from flask import Blueprint, request, jsonify
import requests
import os
import re
import json

calibrate_bp = Blueprint("calibrate", __name__)


def call_llm(prompt, max_tokens=1200):
    """Helper to call OpenAI and return the raw text answer."""
    llm_api_url = os.getenv("LLM_API_URL")
    api_key = os.getenv("OPENAI_API_KEY")
    if not llm_api_url or not api_key:
        return None, "LLM_API_URL or OPENAI_API_KEY not set"

    payload = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0.7,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    try:
        resp = requests.post(llm_api_url, json=payload, headers=headers, timeout=60)
        if resp.status_code != 200:
            return None, f"OpenAI API error {resp.status_code}: {resp.text}"
        data = resp.json()
        if "choices" in data and data["choices"]:
            return data["choices"][0]["message"]["content"].strip(), None
        return None, "No choices in OpenAI response"
    except Exception as e:
        return None, str(e)


def extract_json(text):
    """Try to extract a JSON object or array from LLM text."""
    try:
        return json.loads(text)
    except Exception:
        pass
    obj_match = re.search(r"\{[\s\S]*\}", text)
    if obj_match:
        try:
            return json.loads(obj_match.group(0))
        except Exception:
            pass
    arr_match = re.search(r"\[[\s\S]*\]", text)
    if arr_match:
        try:
            return json.loads(arr_match.group(0))
        except Exception:
            pass
    return None


# ─── 1. Generate self-assessment prompts per skill ────────────────────
@calibrate_bp.route("/calibrate/questions", methods=["POST"])
def generate_questions():
    """
    POST { courses: [...], skills: [...], targetRoles: [...] }
    Returns self-assessment prompts for perceived-knowledge rating.
    """
    body = request.get_json() or {}
    courses = body.get("courses", [])
    skills = body.get("skills", [])
    target_roles = body.get("targetRoles", [])

    prompt = f"""Generate personalized knowledge calibration questions for a student with:
- Completed courses: {json.dumps(courses)}
- Inferred skills: {json.dumps(skills)}
- Target roles: {json.dumps(target_roles)}

For each of 6 skills, generate exactly 1 self-assessment question asking the student
to rate their own confidence / familiarity with that skill.

Return ONLY a valid JSON object with this exact structure:
{{
  "questions": [
    {{
      "skillId": "skill_name_lowercase",
      "skillName": "Readable Skill Name",
      "question": "The self-assessment question text",
      "type": "confidence"
    }}
  ]
}}
Respond ONLY with the JSON object. No extra text."""

    answer, err = call_llm(prompt)
    if err:
        return jsonify({"error": err}), 500

    parsed = extract_json(answer)
    if not parsed or not isinstance(parsed, dict) or "questions" not in parsed:
        return jsonify({"questions": [], "raw": answer, "error": "Could not parse questions"}), 200

    return jsonify(parsed)


# ─── 2. Generate quiz (multiple-choice) for actual-knowledge measurement ───
@calibrate_bp.route("/calibrate/quiz", methods=["POST"])
def generate_quiz():
    """
    POST { skills: [ { skillId, skillName } ] }
    Returns 3 multiple-choice questions per skill to measure actual knowledge.
    """
    body = request.get_json() or {}
    skill_list = body.get("skills", [])

    if not skill_list:
        return jsonify({"error": "No skills provided"}), 400

    skill_names = [s.get("skillName", s.get("skillId", "")) for s in skill_list]
    skill_ids = [s.get("skillId", "") for s in skill_list]

    prompt = f"""Generate a knowledge quiz to measure a student's ACTUAL knowledge.

Skills to test: {json.dumps(list(zip(skill_ids, skill_names)))}

For EACH skill, generate exactly 3 multiple-choice questions with 4 options each.
Questions should range from easy to hard so we can accurately gauge real knowledge.
Mark which option is the correct answer.

Return ONLY a valid JSON object:
{{
  "quiz": [
    {{
      "skillId": "skill_id",
      "skillName": "Skill Name",
      "questionIndex": 1,
      "question": "What is ...?",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctIndex": 0
    }}
  ]
}}

IMPORTANT:
- correctIndex is 0-based (0=A, 1=B, 2=C, 3=D)
- Generate exactly 3 questions per skill ({len(skill_ids)} skills = {len(skill_ids) * 3} questions total)
- Make questions genuinely test understanding, not just trivia
Respond ONLY with the JSON object. No extra text."""

    answer, err = call_llm(prompt, max_tokens=2500)
    if err:
        return jsonify({"error": err}), 500

    parsed = extract_json(answer)
    if not parsed or not isinstance(parsed, dict) or "quiz" not in parsed:
        return jsonify({"quiz": [], "raw": answer, "error": "Could not parse quiz"}), 200

    return jsonify(parsed)


# ─── Helper: deterministic classification ────────────────────────────
def _classify(ak, pk):
    """Classify a skill based on Actual Knowledge vs Perceived Knowledge."""
    gap = abs(ak - pk)
    if pk > ak + 0.25 and ak < 0.4:
        return "overconfident"
    if ak > pk + 0.25:
        return "underconfident"
    if ak < 0.3 and pk < 0.3:
        return "blindspot"
    if ak > 0.6 and pk < ak - 0.2:
        return "hidden_strength"
    return "aligned"


def _level(score):
    if score >= 0.6:
        return "High"
    if score >= 0.35:
        return "Medium"
    return "Low"


def _gap_label(gap):
    if gap < 0.15:
        return "None"
    if gap < 0.3:
        return "Small"
    return "Large"


# ─── 3. Submit quiz answers + self-assessment → compute calibration ───
@calibrate_bp.route("/calibrate/submit", methods=["POST"])
def submit_calibration():
    """
    POST {
      selfAssessment: [ { skillId, perceivedScore (0-1) } ],
      quizAnswers:    [ { skillId, questionIndex, selectedIndex, correctIndex } ],
    }

    Computes Actual Knowledge from quiz scores, compares to Perceived Knowledge
    from self-assessment, and returns full calibration dashboard data.
    """
    body = request.get_json() or {}
    self_assessment = body.get("selfAssessment", [])
    quiz_answers = body.get("quizAnswers", [])

    # Build PK map from self-assessment
    pk_map = {}
    for sa in self_assessment:
        pk_map[sa.get("skillId", "")] = float(sa.get("perceivedScore", 0.5))

    # Build AK map from quiz answers — score per skill = correct / total
    quiz_correct = {}
    quiz_total = {}
    for qa in quiz_answers:
        sid = qa.get("skillId", "")
        quiz_total[sid] = quiz_total.get(sid, 0) + 1
        if qa.get("selectedIndex") == qa.get("correctIndex"):
            quiz_correct[sid] = quiz_correct.get(sid, 0) + 1

    ak_map = {}
    for sid in quiz_total:
        ak_map[sid] = round(quiz_correct.get(sid, 0) / quiz_total[sid], 3)

    # Build results for every skill
    all_skill_ids = set(pk_map.keys()) | set(ak_map.keys())

    skills_out = []
    knowledge_map = []
    blindspots = []
    overconfidence_alerts = []
    underconfidence_alerts = []
    total_gap = 0.0

    for skill_id in sorted(all_skill_ids):
        pk = pk_map.get(skill_id, 0.5)
        ak = ak_map.get(skill_id, 0.5)
        gap = round(abs(ak - pk), 3)
        total_gap += gap
        cls = _classify(ak, pk)

        skill_name = skill_id.replace("_", " ").title()
        correct = quiz_correct.get(skill_id, 0)
        total = quiz_total.get(skill_id, 0)

        skills_out.append({
            "skillId": skill_id,
            "skillName": skill_name,
            "actualKnowledgeScore": round(ak, 2),
            "perceivedKnowledgeScore": round(pk, 2),
            "calibrationGap": gap,
            "classification": cls,
        })
        knowledge_map.append({
            "skillName": skill_name,
            "youSaid": _level(pk),
            "quizShows": _level(ak),
            "quizScore": f"{correct}/{total}",
            "gap": _gap_label(gap),
            "classification": cls,
        })

        if cls == "blindspot":
            blindspots.append({
                "skillId": skill_id,
                "reason": f"You rated {skill_name} low, and the quiz confirmed a gap ({correct}/{total} correct).",
                "impact": round(min(gap + 0.2, 1.0), 2),
                "nextStep": f"Consider a course or project focused on {skill_name}.",
            })
        elif cls == "overconfident":
            overconfidence_alerts.append({
                "skillId": skill_id,
                "skillName": skill_name,
                "message": f"You rated yourself high on {skill_name}, but scored {correct}/{total} on the quiz. We recommend reviewing the fundamentals and practicing more.",
            })
        elif cls == "underconfident":
            underconfidence_alerts.append({
                "skillId": skill_id,
                "skillName": skill_name,
                "message": f"Great news — you scored {correct}/{total} on {skill_name}, higher than you expected! We recommend leaning into this strength with more advanced projects.",
            })
        elif cls == "hidden_strength":
            underconfidence_alerts.append({
                "skillId": skill_id,
                "skillName": skill_name,
                "message": f"{skill_name} is a hidden strength — you scored {correct}/{total}! We recommend exploring this further, it could set you apart.",
            })

    n = max(len(all_skill_ids), 1)
    avg_gap = total_gap / n
    calibration_score = round(max(0.0, min(1.0, 1.0 - avg_gap)), 2)

    return jsonify({
        "calibrationScore": calibration_score,
        "skills": skills_out,
        "knowledgeMap": knowledge_map,
        "blindspots": blindspots,
        "overconfidence": overconfidence_alerts,
        "underconfidence": underconfidence_alerts,
    })

"""
Topic-specific graph generator.

Uses the LLM to generate a skill graph for any topic/profession,
falling back to a generic template if the LLM is unavailable.
"""

from __future__ import annotations
import os
import json
import re
import requests
from typing import Any

from .akg import AcademicKnowledgeGraph


def _call_llm(prompt: str, max_tokens: int = 2000) -> str | None:
    llm_url = os.getenv("LLM_API_URL")
    api_key = os.getenv("OPENAI_API_KEY")
    if not llm_url or not api_key:
        return None
    try:
        resp = requests.post(
            llm_url,
            json={"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": prompt}],
                  "max_tokens": max_tokens, "temperature": 0.7},
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            timeout=30,
        )
        if resp.status_code == 200:
            data = resp.json()
            if "choices" in data and data["choices"]:
                return data["choices"][0]["message"]["content"].strip()
    except Exception:
        pass
    return None


def _extract_json(text: str) -> Any:
    try:
        return json.loads(text)
    except Exception:
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                pass
    return None


def generate_topic_graph(topic: str, track: str) -> AcademicKnowledgeGraph | None:
    """Try to generate a topic-specific AKG using the LLM."""
    track_label = "university student" if track == "student" else "working professional"

    prompt = f"""Generate a skill dependency graph for a {track_label} studying/working in: {topic}

Return ONLY a valid JSON object with this structure:
{{
  "skills": [
    {{ "id": "skill_id", "label": "Skill Name", "prerequisites": ["prereq_id1"] }},
    ...
  ],
  "courses": [
    {{ "id": "course_id", "label": "Course or Training Name", "teaches_skills": ["skill_id1"] }},
    ...
  ],
  "roles": [
    {{ "id": "role_id", "label": "Career Role", "requires_skills": ["skill_id1"] }},
    ...
  ],
  "events": [
    {{ "id": "event_id", "label": "Event or Activity", "develops_skills": ["skill_id1"] }},
    ...
  ]
}}

Rules:
- Generate 15-25 skills relevant to {topic} for a {track_label}
- Generate 8-12 courses/trainings
- Generate 4-6 career roles
- Generate 3-5 events/activities
- Skills should have realistic prerequisite chains (foundational → intermediate → advanced)
- Use snake_case for IDs
- Make it specific to {topic}, not generic
Respond ONLY with the JSON."""

    raw = _call_llm(prompt)
    if not raw:
        return None

    parsed = _extract_json(raw)
    if not parsed or not isinstance(parsed, dict):
        return None

    g = AcademicKnowledgeGraph()

    skills_data = parsed.get("skills", [])
    courses_data = parsed.get("courses", [])
    roles_data = parsed.get("roles", [])
    events_data = parsed.get("events", [])

    if not skills_data or len(skills_data) < 3:
        return None

    for s in skills_data:
        sid = f"skill:{s.get('label', s.get('id', ''))}"
        g.add_node(sid, "skill", s.get("label", s.get("id", "")))

    for s in skills_data:
        sid = f"skill:{s.get('label', s.get('id', ''))}"
        for prereq_id in s.get("prerequisites", []):
            pid = None
            for s2 in skills_data:
                if s2.get("id") == prereq_id:
                    pid = f"skill:{s2.get('label', s2.get('id', ''))}"
                    break
            if pid and pid in g.nodes and pid != sid:
                g.add_edge(pid, sid, "SKILL_REQUIRES_SKILL")

    for c in courses_data:
        cid = c.get("id", c.get("label", "")).upper().replace(" ", "")
        label = c.get("label", cid)
        g.add_node(cid, "course", label)
        concept_id = f"concept:{label}"
        g.add_node(concept_id, "concept", label)
        g.add_edge(cid, concept_id, "COURSE_TEACHES_CONCEPT")
        for skill_id in c.get("teaches_skills", []):
            for s in skills_data:
                if s.get("id") == skill_id:
                    target = f"skill:{s.get('label', s.get('id', ''))}"
                    if target in g.nodes:
                        g.add_edge(concept_id, target, "CONCEPT_BUILDS_SKILL")
                    break

    for r in roles_data:
        rid = f"role:{r.get('label', r.get('id', ''))}"
        g.add_node(rid, "role", r.get("label", r.get("id", "")))
        for skill_id in r.get("requires_skills", []):
            for s in skills_data:
                if s.get("id") == skill_id:
                    source = f"skill:{s.get('label', s.get('id', ''))}"
                    if source in g.nodes:
                        g.add_edge(source, rid, "SKILL_REQUIRED_FOR_ROLE")
                    break

    for e in events_data:
        eid = f"event:{e.get('label', e.get('id', ''))}"
        g.add_node(eid, "event", e.get("label", e.get("id", "")))
        for skill_id in e.get("develops_skills", []):
            for s in skills_data:
                if s.get("id") == skill_id:
                    target = f"skill:{s.get('label', s.get('id', ''))}"
                    if target in g.nodes:
                        g.add_edge(eid, target, "EVENT_DEVELOPS_SKILL")
                    break

    return g

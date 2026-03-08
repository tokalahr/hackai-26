from flask import Blueprint, request, jsonify
import requests
import os
from app.utils.nebula_client import nebula_get
import re

solve_bp = Blueprint("solve", __name__)

@solve_bp.route("/solve", methods=["POST"])
def solve():
    data = request.get_json()
    query = data.get("query")

    if not query:
        return jsonify({"error": "Query is required"}), 400

    # Check if the query is asking for professors for a specific course.
    # Swagger-compatible flow: use /course/professors with subject_prefix/course_number.
    course_prof_pattern = re.search(r"professors? (?:for|of|teaching|who taught|instructing|in) ([\w\s]+)", query, re.IGNORECASE)
    if course_prof_pattern:
        course_info = course_prof_pattern.group(1).strip()
        # Prefer the final prefix+number pair, so text like "unix cs 3377"
        # resolves to CS 3377 rather than UNIX.
        matches = re.findall(r"([a-zA-Z]{2,})[\s-]*([0-9]{3,4})", course_info)
        if matches:
            subject_prefix, course_number = matches[-1]
            subject_prefix = subject_prefix.upper()
            try:
                nebula_response = nebula_get(
                    "/course/professors",
                    params={"course_number": course_number, "subject_prefix": subject_prefix},
                    timeout=10,
                )
                nebula_response.raise_for_status()
                nebula_data = nebula_response.json()
                professors = nebula_data.get("data", [])
                if professors:
                    names = [f"{p.get('first_name', '')} {p.get('last_name', '')}".strip() for p in professors]
                    names_str = ", ".join(names)
                    query = f"Here are some professors who have taught {subject_prefix} {course_number}: {names_str}. {query}"
            except Exception as e:
                print("Failed to fetch course-specific professors from Nebula API:", str(e))
                # Continue with the original query if Nebula API fails
    elif "professor" in query.lower() or "professors" in query.lower():
        # Fetch real professor names from Nebula API (general)
        try:
            # Swagger supports offset pagination; no limit query is documented.
            nebula_response = nebula_get("/professor", params={"offset": 0}, timeout=10)
            nebula_response.raise_for_status()
            nebula_data = nebula_response.json()
            professors = nebula_data.get("data", [])
            if professors:
                names = [f"{p.get('first_name', '')} {p.get('last_name', '')}".strip() for p in professors[:5]]
                names_str = ", ".join(names)
                query = f"Here are some professors: {names_str}. {query}"
        except Exception as e:
            print("Failed to fetch professors from Nebula API:", str(e))
            # Continue with the original query if Nebula API fails

    llm_api_url = os.getenv("LLM_API_URL")
    api_key = os.getenv("OPENAI_API_KEY")
    if not llm_api_url or not api_key:
        return jsonify({"error": "LLM_API_URL or OPENAI_API_KEY not set in environment"}), 500

    payload = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": query}],
        "max_tokens": 100,
        "temperature": 0.7
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(llm_api_url, json=payload, headers=headers, timeout=15)
        if response.status_code != 200:
            print("OpenAI API Error:", response.status_code, response.text)
            return jsonify({"error": "Failed to process query with LLM", "details": response.text}), 500
        data = response.json()
        # Defensive: ensure we always return a positive answer
        if "choices" in data and data["choices"]:
            answer = data["choices"][0]["message"]["content"].strip()
            if not answer:
                answer = "I'm here to help! Please try rephrasing your question."
            return jsonify({"answer": answer})
        else:
            return jsonify({"answer": "I'm here to help! Please try rephrasing your question."})
    except Exception as e:
        print("Exception during OpenAI API call:", str(e))
        return jsonify({"error": "Exception during LLM call", "details": str(e)}), 500

from flask import Blueprint, request, jsonify
from app.aria.engine import generate_aria_output

aria_bp = Blueprint("aria", __name__)


@aria_bp.route("/aria/graph", methods=["POST"])
def aria_graph():
    data = request.get_json(silent=True) or {}
    profile = {
        "completed_courses": data.get("completed_courses", []),
        "current_courses": data.get("current_courses", []),
        "major": data.get("major", ""),
        "target_roles": data.get("target_roles", []),
        "interests": data.get("interests", []),
        "inferred_skills_override": data.get("inferred_skills_override", []),
        "proven_skills": data.get("proven_skills", {}),
    }
    try:
        result = generate_aria_output(profile)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

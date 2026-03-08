from flask import Blueprint, request, jsonify
from app.utils.nebula_client import nebula_get

trends_bp = Blueprint("trends", __name__)

@trends_bp.route("/course/sections/trends", methods=["GET"])
def trends_course_section_search():
    course_number = request.args.get("course_number")
    subject_prefix = request.args.get("subject_prefix")
    if not course_number or not subject_prefix:
        return jsonify({"error": "Missing required parameters"}), 400
    params = {
        "course_number": course_number,
        "subject_prefix": subject_prefix
    }
    try:
        response = nebula_get("/course/sections/trends", params=params, timeout=10)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": "Failed to fetch from Nebula API", "details": str(e)}), 500

@trends_bp.route("/professor/sections/trends", methods=["GET"])
def trends_professor_section_search():
    first_name = request.args.get("first_name")
    last_name = request.args.get("last_name")
    if not first_name or not last_name:
        return jsonify({"error": "Missing required parameters"}), 400
    params = {
        "first_name": first_name,
        "last_name": last_name
    }
    try:
        response = nebula_get("/professor/sections/trends", params=params, timeout=10)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": "Failed to fetch from Nebula API", "details": str(e)}), 500

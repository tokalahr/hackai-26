from flask import Blueprint, request, jsonify
import requests

trends_bp = Blueprint("trends", __name__)

@trends_bp.route("/course/sections/trends", methods=["GET"])
def trends_course_section_search():
    course_number = request.args.get("course_number")
    subject_prefix = request.args.get("subject_prefix")
    if not course_number or not subject_prefix:
        return jsonify({"error": "Missing required parameters"}), 400
    nebula_api_url = "http://localhost:8080/course/sections/trends"
    params = {
        "course_number": course_number,
        "subject_prefix": subject_prefix
    }
    try:
        response = requests.get(nebula_api_url, params=params, timeout=10)
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
    nebula_api_url = "http://localhost:8080/professor/sections/trends"
    params = {
        "first_name": first_name,
        "last_name": last_name
    }
    try:
        response = requests.get(nebula_api_url, params=params, timeout=10)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": "Failed to fetch from Nebula API", "details": str(e)}), 500

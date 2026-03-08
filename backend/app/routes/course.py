from flask import Blueprint, request, jsonify
import requests

course_bp = Blueprint("course", __name__)

@course_bp.route("/course", methods=["GET"])
def course_search():
    nebula_api_url = "http://localhost:8080/course"
    try:
        response = requests.get(nebula_api_url, params=request.args, timeout=10)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": "Failed to fetch from Nebula API", "details": str(e)}), 500

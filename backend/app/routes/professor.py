from flask import Blueprint, request, jsonify
import requests

professor_bp = Blueprint("professor", __name__)

@professor_bp.route("/professor", methods=["GET"])
def professor_search():
    nebula_api_url = "http://localhost:8080/professor"
    try:
        response = requests.get(nebula_api_url, params=request.args, timeout=10)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": "Failed to fetch from Nebula API", "details": str(e)}), 500

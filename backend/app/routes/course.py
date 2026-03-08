from flask import Blueprint, request, jsonify
from app.utils.nebula_client import nebula_get

course_bp = Blueprint("course", __name__)

@course_bp.route("/course", methods=["GET"])
def course_search():
    try:
        response = nebula_get("/course", params=request.args.to_dict(flat=True), timeout=10)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": "Failed to fetch from Nebula API", "details": str(e)}), 500

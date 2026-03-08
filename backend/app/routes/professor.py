from flask import Blueprint, request, jsonify
from app.utils.nebula_client import nebula_get

professor_bp = Blueprint("professor", __name__)

@professor_bp.route("/professor", methods=["GET"])
def professor_search():
    try:
        response = nebula_get("/professor", params=request.args.to_dict(flat=True), timeout=10)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": "Failed to fetch from Nebula API", "details": str(e)}), 500

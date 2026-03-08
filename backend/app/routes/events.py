from flask import Blueprint, jsonify

from app.utils.nebula_client import nebula_get


events_bp = Blueprint("events", __name__)


@events_bp.route("/calendar/<date>", methods=["GET"])
def calendar_events(date: str):
    try:
        response = nebula_get(f"/calendar/{date}", timeout=10)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": "Failed to fetch from Nebula API", "details": str(e)}), 500

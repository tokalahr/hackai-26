from flask import Blueprint, jsonify

overview_bp = Blueprint('overview', __name__)

@overview_bp.route('/dashboard/overview', methods=['GET'])
def dashboard_overview():
    # Dummy data for now; replace with real DB queries later
    return jsonify({
        "progress": 72,
        "activeCourses": 18,
        "dueThisWeek": 5,
        "nextEvent": {"name": "Workshop", "time": "Tomorrow at 2 PM"},
        "recentBadge": {"name": "🏆 Star Learner", "earnedAgo": "2 days ago"},
        "stats": {
            "inProgress": 18,
            "completed": 23,
            "certificates": 15,
            "communitySupport": 87
        }
    })

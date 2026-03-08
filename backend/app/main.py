import sys
import os

# Ensure the `backend` directory is in the Python path
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_path)

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from flask_cors import CORS
from app.routes.solve import solve_bp
from app.routes.professor import professor_bp
from app.routes.course import course_bp
from app.routes.trends import trends_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(solve_bp)
app.register_blueprint(professor_bp)
app.register_blueprint(course_bp)
app.register_blueprint(trends_bp)

@app.route('/')
def home():
    return {"message": "Welcome to the Modern Student Tool API!"}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5004, debug=True)

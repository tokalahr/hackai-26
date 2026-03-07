from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["Recommendations"])


class LearnerProfile(BaseModel):
    name: str
    topic: str
    current_level: str
    background: str = ""


@router.post("/recommendations", summary="Get personalised learning recommendations")
def get_recommendations(profile: LearnerProfile):
    """
    Accepts a learner profile (skill level, background, topic) and returns
    stub next-step recommendations.

    TODO: Replace stub logic with:
      - Learner history retrieval (past usage / implicit signals)
      - LLM call or RAG pipeline using course/event data
      - Concept map generation
      - YouTube snippet retrieval
    """
    return {
        "learner": profile.name,
        "topic": profile.topic,
        "next_steps": [
            f"Review the fundamentals of {profile.topic} at your current level ({profile.current_level}).",
            f"Complete a hands-on mini-project related to {profile.topic}.",
            "Join the AI & Society Symposium on campus to see real-world applications.",
            "Explore the Introduction to Machine Learning course offered this semester.",
        ],
        "key_concepts": [
            "Supervised Learning",
            "Feature Engineering",
            "Model Evaluation",
            "Overfitting vs Underfitting",
        ],
        "practice_scenario": (
            f"You are a data analyst at a retail company. Using {profile.topic}, "
            "build a model that predicts which products a customer is likely to buy next, "
            "given their purchase history. Start with a simple baseline, then iterate."
        ),
        "external_resources": [
            {
                "title": "3Blue1Brown — Neural Networks playlist",
                "url": "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi",
                "note": "Visual intuition for how neural nets learn (chapters 1-4 recommended)",
            },
            {
                "title": "fast.ai — Practical Deep Learning for Coders",
                "url": "https://course.fast.ai",
                "note": "Top-down, code-first approach; ideal after basic Python familiarity",
            },
            {
                "title": "Andrej Karpathy — micrograd walkthrough",
                "url": "https://www.youtube.com/watch?v=VMj-3S1tku0",
                "note": "Builds backprop from scratch — great for developing deep understanding",
            },
        ],
        "learning_map": {
            "root": profile.topic,
            "nodes": [
                {"id": "fundamentals", "label": "Fundamentals", "status": "current"},
                {"id": "core_algorithms", "label": "Core Algorithms", "status": "next"},
                {"id": "project", "label": "Mini Project", "status": "next"},
                {"id": "advanced", "label": "Advanced Topics", "status": "future"},
            ],
            "edges": [
                ["fundamentals", "core_algorithms"],
                ["core_algorithms", "project"],
                ["project", "advanced"],
            ],
        },
    }

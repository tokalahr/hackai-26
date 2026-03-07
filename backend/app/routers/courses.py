from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["Courses"])

# Stub data — replace with DB/external API calls
_COURSES = [
    {
        "id": 1,
        "title": "Introduction to Machine Learning",
        "description": "Fundamentals of supervised and unsupervised learning.",
        "credits": 3,
        "department": "Computer Science",
    },
    {
        "id": 2,
        "title": "Data Structures & Algorithms",
        "description": "Arrays, trees, graphs, sorting, and complexity analysis.",
        "credits": 4,
        "department": "Computer Science",
    },
    {
        "id": 3,
        "title": "Natural Language Processing",
        "description": "Text processing, language models, and transformer architectures.",
        "credits": 3,
        "department": "Computer Science",
    },
]


@router.get("/courses", summary="List all courses")
def list_courses():
    return {"courses": _COURSES}


@router.get("/courses/{course_id}", summary="Get course by ID")
def get_course(course_id: int):
    course = next((c for c in _COURSES if c["id"] == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

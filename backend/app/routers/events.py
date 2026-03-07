from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["Events"])

# Stub data — replace with DB/external API calls
_EVENTS = [
    {
        "id": 1,
        "name": "AI & Society Symposium",
        "date": "2026-03-15",
        "time": "10:00",
        "location": "Engineering Building, Room 201",
        "description": "Panel discussion on ethical implications of AI.",
    },
    {
        "id": 2,
        "name": "Spring Career Fair",
        "date": "2026-03-22",
        "time": "09:00",
        "location": "Main Hall, Ground Floor",
        "description": "Meet recruiters from 50+ tech and consulting firms.",
    },
    {
        "id": 3,
        "name": "Hackathon 2026",
        "date": "2026-04-05",
        "time": "08:00",
        "location": "Innovation Hub",
        "description": "24-hour hack — build something impactful!",
    },
]


@router.get("/events", summary="List all campus events")
def list_events():
    return {"events": _EVENTS}


@router.get("/events/{event_id}", summary="Get event by ID")
def get_event(event_id: int):
    event = next((e for e in _EVENTS if e["id"] == event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

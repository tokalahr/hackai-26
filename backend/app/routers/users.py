from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(tags=["Users"])

# Stub in-memory store — replace with a real DB
_USERS: dict[int, dict] = {
    1: {"id": 1, "name": "Alice Smith", "email": "alice@uni.edu", "role": "student"},
    2: {"id": 2, "name": "Bob Jones", "email": "bob@uni.edu", "role": "lecturer"},
}
_NEXT_ID = 3


class UserCreate(BaseModel):
    name: str
    email: str
    role: str = "student"


@router.get("/users/{user_id}", summary="Get user by ID")
def get_user(user_id: int):
    user = _USERS.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/users", status_code=201, summary="Create a new user")
def create_user(body: UserCreate):
    global _NEXT_ID
    new_user = {"id": _NEXT_ID, **body.model_dump()}
    _USERS[_NEXT_ID] = new_user
    _NEXT_ID += 1
    return new_user

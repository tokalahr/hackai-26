from fastapi import APIRouter
from app.models.user import User

router = APIRouter()

# Endpoint for user onboarding
@router.post("/onboard")
async def onboard_user(user: User):
    # For now, just return the user data
    return {"message": "User onboarded successfully", "user": user}
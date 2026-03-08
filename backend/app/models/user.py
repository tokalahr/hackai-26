from pydantic import BaseModel

class User(BaseModel):
    name: str
    email: str
    platform: str  # Either 'student' or 'developer'
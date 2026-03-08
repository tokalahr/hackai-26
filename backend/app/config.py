import os

from dotenv import load_dotenv

load_dotenv()

class Config:
    # MongoDB Configuration
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "combinedDB")

    # PostgreSQL Configuration
    POSTGRES_URI = os.getenv("POSTGRES_URI", "postgresql://user:password@localhost:5432/clubs")
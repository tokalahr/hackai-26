from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, courses, events, users, recommendations

app = FastAPI(
    title="UniLearn API",
    description="University events/courses data + AI-powered learning recommendations.",
    version="0.1.0",
)

# ── CORS (allow Vite dev server) ───────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(health.router, prefix="/api")
app.include_router(courses.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")

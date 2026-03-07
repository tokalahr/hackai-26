# UniLearn — HackAI 26

University events/courses platform + AI-powered personalised learning recommendations.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS v4, React Router v7 |
| Backend | FastAPI, Uvicorn, Python 3.11+ |

## Project Structure

```
hackai-26/
├── frontend/               # React + Vite + Tailwind
│   └── src/
│       ├── components/     # Navbar, Layout
│       └── pages/          # Home, Dashboard, About, Login
└── backend/
    ├── app/
    │   ├── main.py         # FastAPI app + CORS
    │   └── routers/        # health, courses, events, users, recommendations
    └── requirements.txt
```

## Getting Started

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\uvicorn app.main:app --reload
# Mac/Linux:
# source .venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload
```

API docs available at **http://localhost:8000/docs**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at **http://localhost:5173**

> The Vite dev server proxies `/api/*` → `http://localhost:8000` — no CORS config needed in dev.

## API Routes

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/courses` | List all courses |
| GET | `/api/courses/{id}` | Get course by ID |
| GET | `/api/events` | List campus events (name, date, location) |
| GET | `/api/events/{id}` | Get event by ID |
| GET | `/api/users/{id}` | Get user by ID |
| POST | `/api/users` | Create user |
| POST | `/api/recommendations` | Generate learning recommendations |

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Home | Hero landing page |
| `/dashboard` | Dashboard | Campus panel + Learning tool side-by-side |
| `/about` | About | Project description |
| `/login` | Login | Sign-in form (UI stub) |

# Nyx — Academic Intelligence Engine

This project includes:
- Frontend: React + Vite (runs on `http://localhost:5173`)
- Backend: Flask API proxy (runs on `http://localhost:5004`)

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **npm** | 9+ | Bundled with Node.js |
| **Python** | 3.10+ | [python.org](https://www.python.org/downloads/) |

---

## 1. Clone & Open Project

```bash
git clone https://github.com/tokalahr/hackai-26.git
cd hackai-26
```

Open the project folder in VS Code (or your editor of choice) and open **3 terminals**:
1. Terminal 1 — frontend
2. Terminal 2 — backend
3. Terminal 3 — free for tests/git/curl

---

## 2. One-Time Setup

### Install frontend dependencies (Terminal 1)

```bash
npm install
```

### Create backend virtual environment and install packages (Terminal 2)

**macOS / Linux:**

```bash
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt
```

**Windows (PowerShell):**

```powershell
py -3 -m venv backend/.venv
backend\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
```

### Create backend `.env` file

Copy `backend/.env.example` to `backend/.env` (if the example file exists), or create `backend/.env` manually with these keys:

```
NEBULA_API_KEY=
NEBULA_BASE_URL=<Nebula API base URL>
OPENAI_API_KEY=
LLM_API_URL=<OpenAI chat completions endpoint>
```

Then edit `backend/.env` with valid keys:
- `NEBULA_API_KEY` — for course/professor data (optional; public data works without it)
- `OPENAI_API_KEY` — for the Learning Assistant chat and quiz question generation (optional)

---

## 3. Start The App

### Terminal 1 — Frontend

```bash
npm run dev
```

### Terminal 2 — Backend

**macOS / Linux:**

```bash
backend/.venv/bin/python backend/app/main.py
```

**Windows (PowerShell):**

```powershell
backend\.venv\Scripts\python.exe backend\app\main.py
```

---

## 4. Verify Everything Is Running

### Terminal 3 — quick check

**macOS / Linux:**

```bash
curl http://localhost:5004/
```

**Windows (PowerShell):**

```powershell
Invoke-RestMethod http://localhost:5004/
```

Expected response: `Welcome to the Modern Student Tool API!`

Then open the frontend in your browser: **http://localhost:5173**

---

## 5. Common Commands

| Task | Command |
|------|---------|
| Start frontend dev server | `npm run dev` |
| Build frontend for production | `npm run build` |
| Check git status | `git status` |

---

## Project Structure

```
hackai-26/
├── src/                    # React frontend (Vite + TypeScript + Tailwind)
│   ├── app/
│   │   ├── pages/          # Page components (Home, Dashboard, SkillLearner, etc.)
│   │   ├── components/     # UI components (TopNavbar, SidebarNav, SkillTreeGraph, etc.)
│   │   ├── services/       # API client (backend-api.ts)
│   │   └── routes.tsx      # Client-side routes
│   └── styles/             # CSS / Tailwind theme
├── backend/
│   ├── app/
│   │   ├── main.py         # Flask entry point (port 5004)
│   │   ├── routes/         # API route blueprints
│   │   ├── aria/           # ARIA engine (AKG, SDG, graph intelligence)
│   │   └── utils/          # Nebula API client
│   └── requirements.txt    # Python dependencies
├── package.json            # npm config (frontend)
└── .env                    # VITE_API_BASE_URL (frontend env)
```

---

## Troubleshooting

- **Frontend shows empty live sections:**
  - Confirm backend is running on port `5004`.
  - Confirm `backend/.env` exists and has a valid `NEBULA_API_KEY`.

- **Backend starts but `/course` returns 500:**
  - Check API keys in `backend/.env`.
  - Restart backend terminal after editing env values.

- **Wrong URL being used by frontend:**
  - Set root `.env` with: `VITE_API_BASE_URL=http://localhost:5004`

- **`python3 -m venv` fails on Ubuntu/Debian:**
  - Install the venv package: `sudo apt install python3.12-venv`


# UniLearn Web App

This project includes:
- Frontend: React + Vite (runs on `http://localhost:5173`)
- Backend: Flask API proxy (runs on `http://localhost:5004`)

## Run In VS Code (3-Terminal Workflow)

This guide matches your preferred setup:
1. Terminal 1: frontend
2. Terminal 2: backend
3. Terminal 3: free for tests/git/curl

All commands below are for **Windows PowerShell** in VS Code.

## 1. Open Project In VS Code

Open this folder:
- `c:\Users\tokal\College\HackAI\hackai-26`

Then open 3 terminals in VS Code:
- `Terminal` -> `New Terminal` (repeat until you have 3 tabs)

## 2. One-Time Setup

In Terminal 1 (project root), install frontend dependencies:

```powershell
Set-Location c:/Users/tokal/College/HackAI/hackai-26
npm i
```

In Terminal 2, create backend virtual environment and install Python packages:

```powershell
Set-Location c:/Users/tokal/College/HackAI/hackai-26
if (-not (Test-Path "backend/.venv/Scripts/python.exe")) { py -3 -m venv backend/.venv }
& "backend/.venv/Scripts/python.exe" -m pip install -r backend/requirements.txt
```

Create backend env file if missing:

```powershell
Set-Location c:/Users/tokal/College/HackAI/hackai-26
if (-not (Test-Path "backend/.env")) { Copy-Item backend/.env.example backend/.env }
```

Then edit `backend/.env` with valid keys, especially:
- `NEBULA_API_KEY`
- `OPENAI_API_KEY` (used by `/solve`)

## 3. Start The App (Daily Workflow)

Terminal 1 (frontend):

```powershell
Set-Location c:/Users/tokal/College/HackAI/hackai-26
npm run dev
```

Terminal 2 (backend):

```powershell
Set-Location c:/Users/tokal/College/HackAI/hackai-26
& "backend/.venv/Scripts/python.exe" backend/app/main.py
```

Terminal 3 (free terminal):
- Use for git commands, API tests, npm build checks, etc.

## 4. Verify Everything Is Running

In Terminal 3:

```powershell
Set-Location c:/Users/tokal/College/HackAI/hackai-26
Invoke-RestMethod http://localhost:5004/
```

Expected backend response includes:
- `Welcome to the Modern Student Tool API!`

Optional live data check:

```powershell
Invoke-RestMethod "http://localhost:5004/course?offset=0"
```

Then open frontend in browser:
- `http://localhost:5173`

## 5. Common Commands In Free Terminal

Build frontend:

```powershell
Set-Location c:/Users/tokal/College/HackAI/hackai-26
npm run build
```

Check git status:

```powershell
git status
```

## Troubleshooting

- Frontend shows empty live sections:
  - Confirm backend is running on port `5004`.
  - Confirm `backend/.env` exists and has valid `NEBULA_API_KEY`.

- Backend starts but `/course` returns 500:
  - Check API keys in `backend/.env`.
  - Restart backend terminal after editing env values.

- Wrong URL being used by frontend:
  - Set root `.env` with:
    - `VITE_API_BASE_URL=http://localhost:5004`
  
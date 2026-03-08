# AGENTS.md

## Cursor Cloud specific instructions

UniLearn is a student learning tool with a React+Vite frontend (port 5173) and Flask backend (port 5004). See `README.md` for standard commands.

### Services

| Service | Command | Port |
|---------|---------|------|
| Frontend | `npm run dev` | 5173 |
| Backend | `backend/.venv/bin/python backend/app/main.py` | 5004 |

### Key notes

- The backend venv lives at `backend/.venv`. There is also a stale nested `backend/backend/.venv` from the original developer — ignore it.
- `backend/.env` must exist for the backend to start. It loads via `python-dotenv` from `Path(__file__).resolve().parents[1]` (i.e. the `backend/` directory).
- The backend proxies requests to the UTD Nebula API. The `NEBULA_API_KEY` env var is optional — the Nebula API serves public data without it, but some endpoints may return errors without a valid key.
- `OPENAI_API_KEY` and `LLM_API_URL` are only needed for the `/solve` (Learning Assistant chat) endpoint.
- There is no project-level ESLint, Prettier, TypeScript checker, or test framework configured. `npm run build` (Vite build) is the primary correctness check.
- `python3.12-venv` must be installed via apt for the backend venv to be created (`sudo apt-get install -y python3.12-venv`).
- `package.json` uses `npm` (lockfile: `package-lock.json`).

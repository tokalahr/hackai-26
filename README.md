# HackAI 26

Modern React + Vite single-page app for the HackAI 26 project.

## Tech Stack

- React (TypeScript)
- Vite
- Tailwind CSS v4
- Radix UI + MUI + assorted UI utility libraries

## Project Structure

```
hackai-26/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── components/
│   ├── styles/
│   └── main.tsx
├── index.html
├── package.json
└── vite.config.ts
```

## Prerequisites

- Node.js 20+
- npm 10+

## Getting Started

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173` by default.

## Available Scripts

- `npm run dev` - Start local development server
- `npm run build` - Build production bundle

## Build Validation

```bash
npm run build
```

If build completes without errors, the project is in a runnable state.

## Notes

- This repository is currently frontend-only.
- If you plan to add a backend, create a separate service folder (for example `backend/`) and document its setup here.
# Backend Workbench

This backend is the first fullstack workbench for the existing React app.

It intentionally keeps the current frontend style untouched. The backend first reuses `public/data` as a data source, then can move to SQLite or PostgreSQL in a later phase.

## Start

Zero-dependency local API server:

```bash
npm run backend:dev
```

FastAPI server after Python dependencies are installed:

```bash
python -m pip install -r backend/requirements.txt
npm run backend:dev:fastapi
```

## API

```text
GET  /api/health
GET  /api/workbench
GET  /api/data/{relative_json_path}
GET  /api/universities
GET  /api/universities/{university_id}
GET  /api/careers
GET  /api/careers/{career_id}
GET  /api/quiz/questions
GET  /api/quiz/mapping/{mbti_type}
POST /api/quiz/submit
POST /api/qa/chat
GET  /api/state
PUT  /api/state
DELETE /api/state
PUT  /api/state/profile
PUT  /api/state/mbti
PUT  /api/state/favorites
POST /api/state/favorites
DELETE /api/state/favorites/{item_id}
PUT  /api/state/history
POST /api/state/history
DELETE /api/state/history
GET  /api/plans
PUT  /api/plans
POST /api/plans
DELETE /api/plans/{uni_id}
```

Runtime demo user data is stored in `backend/runtime/demo_state.json` and should not be committed.
The Node workbench server also accepts `BACKEND_STATE_FILE` so smoke tests can use an isolated temporary state file.

`backend/node_server.mjs` exists so the workbench can run even when Python package downloads are unavailable. The FastAPI files remain the intended formal backend structure for later database/auth work.

## Demo Boundaries

The following endpoints are local workbench/demo endpoints until authentication and database persistence are added:

```text
GET/PUT/POST/DELETE /api/state/*
GET/PUT/POST/DELETE /api/plans/*
POST                /api/qa/chat
POST                /api/quiz/submit
```

They do not yet provide multi-user isolation, authentication, authorization, or production concurrency guarantees.

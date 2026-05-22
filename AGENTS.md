# AGENTS.md

## Project overview

Homestay booking & management system (brand: **Lehona**). Goals: room availability, online booking, payments & OTA sync.

## Tech stack

- Backend: FastAPI + PostgreSQL + Redis
- Frontend: React + Tailwind CSS
- Tests: pytest (backend), vitest (frontend)

## Commands

- Dev backend: `uvicorn backend.main:app --reload`
- Run tests: `pytest tests/`
- Migrate DB: `alembic upgrade head`

## Rules for agents

- Ask if requirements are unclear
- Write code + tests together
- When changing API, update spec in `/docs/openapi.yaml`

## Directory structure

- `/backend`
- `/frontend`

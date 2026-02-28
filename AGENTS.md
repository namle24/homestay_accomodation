# AGENTS.md

## 1. Project Overview
Project: Homestay booking & management system  
Goal: Quản lý phòng trống, booking trực tuyến, payment & OTA sync

## 2. Tech Stack
Backend: FastAPI + PostgreSQL + Redis  
Frontend: React + Tailwind CSS  
Tests: pytest (backend), vitest (frontend)

## 3. Commands
- Dev backend: `uvicorn backend.main:app --reload`
- Run tests: `pytest tests/`
- Migrate DB: `alembic upgrade head`

## 4. Rules for Agent
- Always ask questions if unclear
- Write code + tests together
- When changing API, update spec in `/docs/openapi.yaml`

## 5. Directory Structure
- `/backend`
- `/frontend`
- `/features`
- `/backlog`

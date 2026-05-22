# Lehona — Homestay Booking & Management

Full-stack booking and operations system: guest-facing site, reception dashboard, room inventory, and booking lifecycle.

## Visual preview

<img width="1920" height="1040" alt="Hero section" src="https://github.com/user-attachments/assets/28462c0f-f32c-435c-8169-baa1aeccbfd7" />

## Features

- **Guests**: search availability, book rooms, view booking history
- **Staff**: occupancy dashboard, check-in/out, schedule, archives, notifications

## Tech stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Database**: SQLite (dev) / PostgreSQL (production)

## Quick start

### Backend

```bash
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload
```

API docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

## Assets

Replace images under `frontend/public/images/`:

| Section        | Path                                   | Filenames                                      |
| :------------- | :------------------------------------- | :--------------------------------------------- |
| Hero / Banner  | `frontend/public/images/hero/`         | `banner.png`                                   |
| Private rooms  | `frontend/public/images/rooms/private/`| `main.png`, `2.png`, `3.png`                   |
| Dorm rooms     | `frontend/public/images/rooms/dorm/`   | `main.png`, `2.png`, `3.png`                   |
| Our story      | `frontend/public/images/about/`      | `story.png`, `story2.png`, `story3.png`        |
| Activities     | `frontend/public/images/activities/` | `hot-spring.png`, `comfort.png`, `culture.png` |

## Admin screenshots

<img width="1920" height="1040" alt="Reception dashboard" src="https://github.com/user-attachments/assets/468c838d-02ca-4ed1-b7eb-a57bc09d13a4" />
<img width="1920" height="1040" alt="Room management" src="https://github.com/user-attachments/assets/eff905c3-f6ef-40e2-8bae-356d6e39b06f" />
<img width="1920" height="1040" alt="Booking schedule" src="https://github.com/user-attachments/assets/2e36dd76-089c-497f-93d1-12890d945f28" />

## License

Private project — configure contact and branding in deployment settings.

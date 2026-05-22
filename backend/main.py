from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import auth, availability, bookings, rooms, notifications
from .config import get_settings


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://*.ngrok-free.dev",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(availability.router)
app.include_router(bookings.router)
app.include_router(rooms.router)
app.include_router(notifications.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}


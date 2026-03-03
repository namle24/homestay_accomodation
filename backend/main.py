from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import auth, availability, bookings, rooms
from .config import get_settings


settings = get_settings()
print(f"DEBUG: Server using Secret Key {settings.secret_key[:5]}... and Algorithm {settings.algorithm}")

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
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


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}


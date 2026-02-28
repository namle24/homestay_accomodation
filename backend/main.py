from fastapi import FastAPI

from .api import availability, bookings
from .config import get_settings


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
)

app.include_router(availability.router)
app.include_router(bookings.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}


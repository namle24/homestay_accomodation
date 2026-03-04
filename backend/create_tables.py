from backend.db import engine, Base
from backend.models.user import User
from backend.models.room import Room
from backend.models.booking import Booking
from backend.models.notification import Notification

def create_tables():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Done.")

if __name__ == "__main__":
    create_tables()

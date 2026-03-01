from __future__ import annotations

import sys
from contextlib import contextmanager
from pathlib import Path

# Add project root to sys.path to allow relative imports
sys.path.append(str(Path(__file__).parent.parent))

from backend.db import SessionLocal, Base, engine
from backend.models import Room, User, Booking, OTASync 
from backend.models.room import RoomTypeEnum
from backend.models.user import UserRoleEnum
from backend.api.auth_utils import get_password_hash


@contextmanager
def get_session():
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def seed_users() -> None:
    print("Seeding users...")
    with get_session() as session:
        # 1. Admin user
        admin_email = "admin@example.com"
        existing_admin = session.query(User).filter(User.email == admin_email).first()
        if not existing_admin:
            admin = User(
                email=admin_email,
                hashed_password=get_password_hash("admin123"),
                full_name="System Admin",
                role=UserRoleEnum.ADMIN,
                is_active=True
            )
            session.add(admin)
            print(f"Created admin user: {admin_email}")
        else:
            print(f"Admin user {admin_email} already exists. Skipping.")

def seed_rooms() -> None:
    print("Seeding rooms...")
    with get_session() as session:
        existing_count = session.query(Room).count()
        if existing_count > 0:
            print(f"DB already has {existing_count} rooms. Skipping room seeding.")
            return

        rooms = []

        # 12 private rooms
        for i in range(1, 13):
            rooms.append(
                Room(
                    name=f"Private Room {i:02d}",
                    room_type=RoomTypeEnum.PRIVATE,
                    total_units=1,
                    description="Phòng riêng tiện nghi với giường lớn, điều hòa và toilet riêng.",
                    base_price=1200000,
                    max_occupancy=2,
                )
            )

        # 2 dorm rooms - assumptions: 8 beds each
        dorm_configs = [
            ("Dormitory Alpha", 8),
            ("Dormitory Beta", 10),
        ]
        for name, units in dorm_configs:
            rooms.append(
                Room(
                    name=name,
                    room_type=RoomTypeEnum.DORM,
                    total_units=units,
                    description=f"Phòng tập thể {units} giường tầng, không gian mở năng động.",
                    base_price=250000,
                    max_occupancy=units,
                )
            )

        session.add_all(rooms)
        print(f"Added {len(rooms)} rooms.")


if __name__ == "__main__":
    print("Creating tables if not exist...")
    Base.metadata.create_all(bind=engine)
    seed_users()
    seed_rooms()
    print("Seeding completed successfully!")

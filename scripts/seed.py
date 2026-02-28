from __future__ import annotations

from contextlib import contextmanager

from backend.db import SessionLocal
from backend.models import Room
from backend.models.room import RoomTypeEnum


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


def seed_rooms() -> None:
    with get_session() as session:
        existing_count = session.query(Room).count()
        if existing_count > 0:
            return

        rooms = []

        # 12 private rooms
        for i in range(1, 13):
            rooms.append(
                Room(
                    name=f"Private Room {i}",
                    room_type=RoomTypeEnum.PRIVATE,
                    total_units=1,
                    description="Phòng riêng tiện nghi cho 2 khách.",
                    max_occupancy=2,
                )
            )

        # 2 dorm rooms - assumptions: 8 beds each
        dorm_configs = [
            ("Dorm A", 8),
            ("Dorm B", 8),
        ]
        for name, total_units in dorm_configs:
            rooms.append(
                Room(
                    name=name,
                    room_type=RoomTypeEnum.DORM,
                    total_units=total_units,
                    description="Phòng dorm giường tầng, phù hợp nhóm bạn.",
                    max_occupancy=total_units,
                )
            )

        session.add_all(rooms)


if __name__ == "__main__":
    seed_rooms()


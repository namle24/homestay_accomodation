from datetime import date

from sqlalchemy.orm import Session

from backend.db import Base
from backend.models import Booking, Room
from backend.models.booking import BookingSourceEnum, BookingStatusEnum
from backend.models.room import RoomTypeEnum
from backend.tests.conftest import TestingSessionLocal, engine as test_engine


# Đảm bảo schema được tạo trong test DB
Base.metadata.create_all(bind=test_engine)


def _get_db_session() -> Session:
    return TestingSessionLocal()


def test_create_booking_success_when_enough_availability(client):
    db = _get_db_session()
    try:
        room = Room(
            name="Booking Room 1",
            room_type=RoomTypeEnum.PRIVATE,
            total_units=1,
        )
        db.add(room)
        db.commit()
        db.refresh(room)

        payload = {
            "room_id": room.id,
            "start_date": "2026-05-01",
            "end_date": "2026-05-03",
            "quantity": 1,
            "guest_name": "Guest D",
            "guest_email": "d@example.com",
        }

        response = client.post("/bookings/", json=payload)

        assert response.status_code == 201
        data = response.json()
        assert data["room_id"] == room.id
        assert data["status"] == BookingStatusEnum.PENDING
        assert data["booking_source"] == BookingSourceEnum.DIRECT
        assert data["quantity"] == 1
    finally:
        db.close()


def test_create_booking_fails_when_not_enough_units(client):
    """
    Race-condition style test: đã có booking đủ lấp kín, request mới phải bị từ chối.
    """
    db = _get_db_session()
    try:
        dorm = Room(
            name="Booking Dorm 1",
            room_type=RoomTypeEnum.DORM,
            total_units=4,
        )
        db.add(dorm)
        db.flush()

        existing = Booking(
            room_id=dorm.id,
            guest_name="Existing Guest",
            guest_email="exist@example.com",
            start_date=date(2026, 6, 10),
            end_date=date(2026, 6, 15),
            quantity=4,
            status=BookingStatusEnum.CONFIRMED,
            booking_source=BookingSourceEnum.DIRECT,
        )
        db.add(existing)
        db.commit()

        # Cố gắng đặt thêm 1 giường trong khoảng trùng -> phải bị 400
        payload = {
            "room_id": dorm.id,
            "start_date": "2026-06-11",
            "end_date": "2026-06-14",
            "quantity": 1,
            "guest_name": "New Guest",
            "guest_email": "new@example.com",
        }

        response = client.post("/bookings/", json=payload)

        assert response.status_code == 400
        data = response.json()
        assert data["detail"] == "Not enough availability for the requested dates"
    finally:
        db.close()


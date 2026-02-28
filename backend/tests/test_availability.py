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


def test_availability_no_overlap_checkout_checkin_same_day(client):
    """
    Một booking kết thúc ngày X, booking khác bắt đầu ngày X: phải được coi là KHÔNG trùng.
    """
    db = _get_db_session()
    try:
        room = Room(
            name="Private Room Test",
            room_type=RoomTypeEnum.PRIVATE,
            total_units=1,
        )
        db.add(room)
        db.flush()

        # Booking đã có: 10-03 đến 12-03
        existing_booking = Booking(
            room_id=room.id,
            guest_name="Guest A",
            guest_email="a@example.com",
            start_date=date(2026, 3, 10),
            end_date=date(2026, 3, 12),
            quantity=1,
            status=BookingStatusEnum.CONFIRMED,
            booking_source=BookingSourceEnum.DIRECT,
        )
        db.add(existing_booking)
        db.commit()

        # Check availability từ 12-03 đến 14-03 -> phải còn phòng
        response = client.get(
            "/availability/",
            params={"check_in": "2026-03-12", "check_out": "2026-03-14"},
        )

        assert response.status_code == 200
        data = response.json()
        rooms = data["rooms"]
        assert len(rooms) == 1
        assert rooms[0]["room_id"] == room.id
        assert rooms[0]["available_units"] == 1
    finally:
        db.close()


def test_availability_dorm_quantity_calculation(client):
    """
    Dorm room với nhiều booking quantity khác nhau, kiểm tra tổng quantity và available_units.
    """
    db = _get_db_session()
    try:
        dorm = Room(
            name="Dorm Test",
            room_type=RoomTypeEnum.DORM,
            total_units=4,
        )
        db.add(dorm)
        db.flush()

        # Booking 1: 2 giường, 10-03 đến 15-03
        booking1 = Booking(
            room_id=dorm.id,
            guest_name="Guest B1",
            guest_email="b1@example.com",
            start_date=date(2026, 3, 10),
            end_date=date(2026, 3, 15),
            quantity=2,
            status=BookingStatusEnum.CONFIRMED,
            booking_source=BookingSourceEnum.DIRECT,
        )

        # Booking 2: 1 giường, 12-03 đến 13-03
        booking2 = Booking(
            room_id=dorm.id,
            guest_name="Guest B2",
            guest_email="b2@example.com",
            start_date=date(2026, 3, 12),
            end_date=date(2026, 3, 13),
            quantity=1,
            status=BookingStatusEnum.CONFIRMED,
            booking_source=BookingSourceEnum.DIRECT,
        )

        db.add_all([booking1, booking2])
        db.commit()

        # Khoảng cần check: 11-03 đến 13-03
        # Overlap với cả booking1 và booking2 -> tổng quantity = 3
        # total_units = 4 -> available_units = 1
        response = client.get(
            "/availability/",
            params={"check_in": "2026-03-11", "check_out": "2026-03-13"},
        )

        assert response.status_code == 200
        data = response.json()
        rooms = data["rooms"]
        assert len(rooms) == 1
        room_data = rooms[0]
        assert room_data["room_id"] == dorm.id
        assert room_data["available_units"] == 1
    finally:
        db.close()


def test_availability_ignores_cancelled_bookings(client):
    """
    Booking có status CANCELLED không được tính vào occupied quantity.
    """
    db = _get_db_session()
    try:
        room = Room(
            name="Private Room Cancelled",
            room_type=RoomTypeEnum.PRIVATE,
            total_units=1,
        )
        db.add(room)
        db.flush()

        cancelled_booking = Booking(
            room_id=room.id,
            guest_name="Guest C",
            guest_email="c@example.com",
            start_date=date(2026, 4, 1),
            end_date=date(2026, 4, 3),
            quantity=1,
            status=BookingStatusEnum.CANCELLED,
            booking_source=BookingSourceEnum.DIRECT,
        )
        db.add(cancelled_booking)
        db.commit()

        response = client.get(
            "/availability/",
            params={"check_in": "2026-04-01", "check_out": "2026-04-03"},
        )

        assert response.status_code == 200
        data = response.json()
        rooms = data["rooms"]
        # V\xec booking b\u1ecb CANCELLED, ph\xf2ng v\u1eabn ph\u1ea3i c\xf2n 1 \u0111\u01a1n v\u1ecb tr\u1ed1ng
        room_data = next((r for r in rooms if r["room_id"] == room.id), None)
        assert room_data is not None
        assert room_data["available_units"] == 1
    finally:
        db.close()


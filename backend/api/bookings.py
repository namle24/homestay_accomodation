from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.models import Booking, Room
from backend.models.booking import BookingSourceEnum, BookingStatusEnum
from backend.schemas.booking import BookingCreate, BookingResponse


router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("/", response_model=BookingResponse, status_code=201)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)) -> BookingResponse:
    # Validate date order at API level (dù Pydantic đã check)
    if payload.start_date >= payload.end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")

    # Lấy thông tin phòng
    room = db.query(Room).filter(Room.id == payload.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Tính tổng quantity đã book cho phòng này trong khoảng ngày (overlap logic)
    booked_quantity = (
        db.query(func.coalesce(func.sum(Booking.quantity), 0))
        .filter(
            Booking.room_id == payload.room_id,
            Booking.status.in_(
                [BookingStatusEnum.PENDING, BookingStatusEnum.CONFIRMED]
            ),
            Booking.start_date < payload.end_date,
            Booking.end_date > payload.start_date,
        )
        .scalar()
    )

    available_units = room.total_units - booked_quantity
    if available_units < payload.quantity:
        raise HTTPException(
            status_code=400,
            detail="Not enough availability for the requested dates",
        )

    booking = Booking(
        room_id=payload.room_id,
        guest_name=payload.guest_name,
        guest_email=payload.guest_email,
        start_date=payload.start_date,
        end_date=payload.end_date,
        quantity=payload.quantity,
        status=BookingStatusEnum.PENDING,
        booking_source=BookingSourceEnum.DIRECT,
    )
    db.add(booking)
    db.commit()

    db.refresh(booking)
    return BookingResponse.model_validate(booking)


from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.models import Booking, Room
from backend.models.booking import BookingStatusEnum
from backend.schemas.availability import (
    AvailabilityResponse,
    RoomAvailability,
)

router = APIRouter(prefix="/availability", tags=["availability"])


@router.get("/", response_model=AvailabilityResponse)
def get_availability(
    check_in: date = Query(..., alias="check_in"),
    check_out: date = Query(..., alias="check_out"),
    db: Session = Depends(get_db),
) -> AvailabilityResponse:
    if check_in >= check_out:
        raise HTTPException(status_code=400, detail="check_in must be before check_out")

    # Subquery: tổng quantity đã book theo phòng, chỉ tính booking PENDING/CONFIRMED và có overlap
    booked_subq = (
        db.query(
            Booking.room_id.label("room_id"),
            func.coalesce(func.sum(Booking.quantity), 0).label("booked_quantity"),
        )
        .filter(
            Booking.status.in_(
                [BookingStatusEnum.PENDING, BookingStatusEnum.CONFIRMED]
            ),
            Booking.start_date < check_out,
            Booking.end_date > check_in,
        )
        .group_by(Booking.room_id)
        .subquery()
    )

    # Join rooms với subquery, tính available_units = total_units - booked_quantity
    query = (
        db.query(
            Room.id.label("room_id"),
            Room.name,
            Room.room_type,
            Room.base_price,
            (Room.total_units - func.coalesce(booked_subq.c.booked_quantity, 0)).label(
                "available_units"
            ),
        )
        .outerjoin(booked_subq, Room.id == booked_subq.c.room_id)
        .filter(
            (Room.total_units - func.coalesce(booked_subq.c.booked_quantity, 0)) > 0
        )
        .order_by(Room.id)
    )

    results = query.all()

    rooms = [
        RoomAvailability(
            room_id=row.room_id,
            name=row.name,
            room_type=row.room_type,
            base_price=row.base_price,
            available_units=row.available_units,
        )
        for row in results
    ]

    return AvailabilityResponse(rooms=rooms)


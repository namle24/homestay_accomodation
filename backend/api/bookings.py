from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, or_
from datetime import date

from ..db import get_db
from ..models.booking import Booking, BookingStatusEnum
from ..models.room import Room
from ..models.user import UserRoleEnum
from ..schemas.booking import BookingCreate, BookingOut, BookingStatusUpdate
from .deps import get_current_user, RoleChecker

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("/", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Protected: Create a new booking with anti-overbooking check."""
    # Logic anti-overbooking within a transaction
    # We use a simple select with for update or just a careful check since it's an MVP
    
    # 1. Get room total capacity
    room = db.query(Room).filter(Room.id == booking_in.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # 2. Query overlapping bookings
    # Overlap: booking.start_date < checkout AND booking.end_date > checkin
    overlap_bookings = db.query(func.sum(Booking.quantity)).filter(
        Booking.room_id == booking_in.room_id,
        Booking.status != BookingStatusEnum.CANCELLED,
        Booking.start_date < booking_in.end_date,
        Booking.end_date > booking_in.start_date
    ).scalar() or 0
    
    available_units = room.total_units - overlap_bookings
    
    is_staff = current_user.role in [UserRoleEnum.ADMIN, UserRoleEnum.RECEPTIONIST]
    
    if not is_staff and available_units < booking_in.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough available units. Only {available_units} left."
        )
    
    # 3. Calculate total price
    num_nights = (booking_in.end_date - booking_in.start_date).days
    total_price = room.base_price * booking_in.quantity * num_nights

    # 4. Create booking
    booking_data = booking_in.model_dump()
    requested_status = booking_data.pop("status", None)
    
    # Staff (Admin/Receptionist) can override status
    final_status = BookingStatusEnum.PENDING
    if current_user.role in [UserRoleEnum.ADMIN, UserRoleEnum.RECEPTIONIST] and requested_status:
        final_status = requested_status

    db_booking = Booking(
        **booking_data,
        user_id=current_user.id,
        status=final_status,
        total_price=total_price
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@router.get("/", response_model=List[BookingOut])
def list_bookings(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Protected: Get list of bookings with RBAC filtering."""
    query = db.query(Booking)
    
    # RBAC: Admin/Receptionist sees all, User sees only theirs
    if current_user.role not in [UserRoleEnum.ADMIN, UserRoleEnum.RECEPTIONIST]:
        query = query.filter(Booking.user_id == current_user.id)
    
    return query.all()

@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Protected: Get booking details with RBAC check."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # RBAC check
    if current_user.role not in [UserRoleEnum.ADMIN, UserRoleEnum.RECEPTIONIST]:
        if booking.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to access this booking")
            
    return booking

@router.patch("/{booking_id}/status", response_model=BookingOut)
def update_booking_status(
    booking_id: int,
    status_in: BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker([UserRoleEnum.ADMIN, UserRoleEnum.RECEPTIONIST]))
):
    """Protected: Update booking status (Staff only)."""
    db_booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    old_status = db_booking.status
    new_status = status_in.status

    if old_status == new_status:
        return db_booking
    
    # Allowed transitions for Staff:
    # pending -> confirmed / cancelled
    # confirmed -> cancelled / completed
    # cancelled -> (none)
    # completed -> (none)
    
    if old_status == BookingStatusEnum.CANCELLED:
        raise HTTPException(status_code=400, detail="Cannot update a cancelled booking")
    
    if old_status == BookingStatusEnum.COMPLETED:
        raise HTTPException(status_code=400, detail="Cannot update a completed booking")

    db_booking.status = new_status
    db.commit()
    db.refresh(db_booking)
    return db_booking

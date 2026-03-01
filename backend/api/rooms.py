from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from ..db import get_db
from ..models.room import Room
from ..models.booking import Booking
from ..models.user import UserRoleEnum
from ..schemas.room import RoomCreate, RoomUpdate, RoomOut
from .deps import get_current_user, RoleChecker

router = APIRouter(prefix="/rooms", tags=["Rooms"])

# RBAC dependencies
allow_write = RoleChecker([UserRoleEnum.ADMIN, UserRoleEnum.RECEPTIONIST])

@router.get("/", response_model=List[RoomOut])
def list_rooms(db: Session = Depends(get_db)):
    """Public: Get all rooms."""
    return db.query(Room).all()

@router.get("/{room_id}", response_model=RoomOut)
def get_room(room_id: int, db: Session = Depends(get_db)):
    """Public: Get room details."""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@router.post("/", response_model=RoomOut, status_code=status.HTTP_201_CREATED)
def create_room(
    room_in: RoomCreate,
    db: Session = Depends(get_db),
    current_user=Depends(allow_write)
):
    """Protected: Create a new room (Admin/Receptionist only)."""
    db_room = Room(**room_in.model_dump())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

@router.put("/{room_id}", response_model=RoomOut)
def update_room(
    room_id: int,
    room_in: RoomUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(allow_write)
):
    """Protected: Update room details (Admin/Receptionist only)."""
    db_room = db.query(Room).filter(Room.id == room_id).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    update_data = room_in.model_dump(exclude_unset=True)
    
    # Cross-field validation for update if only one field is provided
    new_type = update_data.get("room_type", db_room.room_type)
    new_units = update_data.get("total_units", db_room.total_units)
    
    if new_type == "private" and new_units != 1:
        raise HTTPException(
            status_code=400, 
            detail="Rooms of type 'private' must have exactly 1 unit."
        )

    for field, value in update_data.items():
        setattr(db_room, field, value)
    
    db.commit()
    db.refresh(db_room)
    return db_room

@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(allow_write)
):
    """Protected: Delete room if no bookings exist (Admin/Receptionist only)."""
    db_room = db.query(Room).filter(Room.id == room_id).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Check for existing bookings
    has_bookings = db.query(Booking).filter(Booking.room_id == room_id).first() is not None
    if has_bookings:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete room with existing bookings"
        )
    
    db.delete(db_room)
    db.commit()
    return None

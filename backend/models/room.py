from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import JSON, Column, DateTime, Enum, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from ..db import Base


class RoomTypeEnum(str, PyEnum):
    PRIVATE = "private"
    DORM = "dorm"


class RoomStatusEnum(str, PyEnum):
    AVAILABLE = "available"
    CLEANING = "cleaning"
    MAINTENANCE = "maintenance"


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    room_type = Column(
        Enum(RoomTypeEnum, name="room_type_enum"),
        nullable=False,
    )
    status = Column(
        Enum(RoomStatusEnum, name="room_status_enum"),
        nullable=False,
        default=RoomStatusEnum.AVAILABLE,
    )
    total_units = Column(Integer, nullable=False, default=1)
    description = Column(Text, nullable=True)
    amenities = Column(JSON, nullable=True)
    max_occupancy = Column(Integer, nullable=True)
    base_price = Column(Numeric(10, 2), nullable=True)
    ota_room_id = Column(String(100), nullable=True, index=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    bookings = relationship("Booking", back_populates="room", cascade="all, delete-orphan")
    prices = relationship("Price", back_populates="room", cascade="all, delete-orphan")


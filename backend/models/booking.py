from datetime import date, datetime
from enum import Enum as PyEnum

from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from ..db import Base


class BookingStatusEnum(str, PyEnum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class BookingSourceEnum(str, PyEnum):
    DIRECT = "direct"
    BOOKING_COM = "booking_com"
    AIRBNB = "airbnb"
    AGODA = "agoda"
    OTHER = "other"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="RESTRICT"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    guest_name = Column(String(255), nullable=False)
    guest_email = Column(String(255), nullable=True)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    quantity = Column(Integer, nullable=False, default=1)

    status = Column(
        Enum(BookingStatusEnum, name="booking_status_enum"),
        nullable=False,
        default=BookingStatusEnum.PENDING,
    )

    booking_source = Column(
        Enum(BookingSourceEnum, name="booking_source_enum"),
        nullable=False,
        default=BookingSourceEnum.DIRECT,
    )
    external_booking_id = Column(String(255), nullable=True, index=True)
    total_price = Column(Numeric(10, 2), nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    room = relationship("Room", back_populates="bookings")
    user = relationship("User")


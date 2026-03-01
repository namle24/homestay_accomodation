from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, Field, model_validator, ConfigDict
from datetime import date, datetime
from backend.models.booking import BookingStatusEnum, BookingSourceEnum

class BookingBase(BaseModel):
    room_id: int
    guest_name: str = Field(..., min_length=1, max_length=255)
    guest_email: Optional[str] = Field(None, max_length=255)
    start_date: date
    end_date: date
    quantity: int = Field(1, ge=1)

class BookingCreate(BookingBase):
    @model_validator(mode="after")
    def validate_dates(self) -> "BookingCreate":
        today = date.today()
        if self.start_date < today:
            raise ValueError("start_date cannot be in the past")
        if self.start_date >= self.end_date:
            raise ValueError("start_date must be before end_date")
        return self

class BookingOut(BookingBase):
    id: int
    user_id: Optional[int]
    status: BookingStatusEnum
    booking_source: BookingSourceEnum
    total_price: Optional[Decimal]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class BookingStatusUpdate(BaseModel):
    status: BookingStatusEnum

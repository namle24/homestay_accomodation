from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, Field, model_validator, ConfigDict
from datetime import date, datetime
from backend.models.booking import BookingStatusEnum, BookingSourceEnum

class BookingBase(BaseModel):
    room_id: int
    guest_name: str = Field(..., min_length=1, max_length=255)
    guest_email: Optional[str] = Field(None, max_length=255)
    phone_number: Optional[str] = Field(None, max_length=20)
    start_date: datetime
    end_date: datetime
    quantity: int = Field(1, ge=1)
    notes: Optional[str] = Field(None, max_length=1000)

class BookingCreate(BookingBase):
    status: Optional[BookingStatusEnum] = None
    @model_validator(mode="after")
    def validate_dates(self) -> "BookingCreate":
        # using datetime.now(timezone.utc) logic is ideal, but let's just make sure start < end
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

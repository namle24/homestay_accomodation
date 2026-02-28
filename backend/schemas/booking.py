from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, ValidationInfo, field_validator


class BookingCreate(BaseModel):
    room_id: int
    start_date: date
    end_date: date
    quantity: int = Field(1, ge=1)
    guest_name: str
    guest_email: Optional[EmailStr] = None

    @field_validator("end_date")
    @classmethod
    def validate_date_order(cls, v: date, info: ValidationInfo) -> date:
        start_date = info.data.get("start_date")
        if start_date and v <= start_date:
            raise ValueError("end_date must be after start_date")
        return v


class BookingResponse(BaseModel):
    id: int
    room_id: int
    start_date: date
    end_date: date
    quantity: int
    guest_name: str
    guest_email: Optional[EmailStr] = None
    status: str
    booking_source: str

    model_config = ConfigDict(from_attributes=True)


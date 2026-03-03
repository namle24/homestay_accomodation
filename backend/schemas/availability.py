from datetime import date
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class AvailabilityRequest(BaseModel):
    check_in: date = Field(..., description="Ngày nhận phòng (UTC+7), dạng YYYY-MM-DD")
    check_out: date = Field(..., description="Ngày trả phòng (UTC+7), dạng YYYY-MM-DD")


class RoomAvailability(BaseModel):
    room_id: int
    name: str
    room_type: str
    description: Optional[str] = None
    amenities: Optional[List[str]] = None
    base_price: Optional[Decimal] = None
    available_units: int


class AvailabilityResponse(BaseModel):
    rooms: List[RoomAvailability]

from typing import Optional
from pydantic import BaseModel, Field, model_validator, ConfigDict
from decimal import Decimal
from datetime import datetime

from backend.models.room import RoomTypeEnum

class RoomBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    room_type: RoomTypeEnum
    description: Optional[str] = None
    base_price: Decimal = Field(..., ge=0)
    total_units: int = Field(..., ge=1)

class RoomCreate(RoomBase):
    @model_validator(mode="after")
    def validate_inventory_rules(self) -> "RoomCreate":
        if self.room_type == RoomTypeEnum.PRIVATE and self.total_units != 1:
            raise ValueError("Rooms of type 'private' must have exactly 1 unit.")
        if self.room_type == RoomTypeEnum.DORM and self.total_units < 1:
            raise ValueError("Rooms of type 'dorm' must have at least 1 unit (beds).")
        return self

class RoomUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    room_type: Optional[RoomTypeEnum] = None
    description: Optional[str] = None
    base_price: Optional[Decimal] = Field(None, ge=0)
    total_units: Optional[int] = Field(None, ge=1)

    @model_validator(mode="after")
    def validate_inventory_rules(self) -> "RoomUpdate":
        if self.room_type is not None and self.total_units is not None:
             if self.room_type == RoomTypeEnum.PRIVATE and self.total_units != 1:
                 raise ValueError("Rooms of type 'private' must have exactly 1 unit.")
        return self

class RoomOut(RoomBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime

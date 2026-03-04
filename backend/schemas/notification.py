from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class NotificationBase(BaseModel):
    message: str
    type: str = "new_booking"
    booking_id: Optional[int] = None

class NotificationOut(NotificationBase):
    id: int
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NotificationUpdate(BaseModel):
    is_read: bool

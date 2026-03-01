from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import Column, DateTime, Enum, Integer, String, Text

from ..db import Base


class OTAProviderEnum(str, PyEnum):
    BOOKING_COM = "booking_com"
    AIRBNB = "airbnb"
    AGODA = "agoda"


class OTASyncStatusEnum(str, PyEnum):
    SUCCESS = "success"
    ERROR = "error"


class OTASync(Base):
    __tablename__ = "otas_sync"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(
        Enum(OTAProviderEnum, name="ota_provider_enum"),
        nullable=False,
    )
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
    last_sync_status = Column(
        Enum(OTASyncStatusEnum, name="ota_sync_status_enum"),
        nullable=True,
    )
    last_sync_message = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String

from ..db import Base


class UserRoleEnum(str, PyEnum):
    ADMIN = "admin"
    RECEPTIONIST = "receptionist"
    USER = "user"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(
        Enum(
            UserRoleEnum.ADMIN,
            UserRoleEnum.RECEPTIONIST,
            UserRoleEnum.USER,
            name="user_role_enum",
        ),
        nullable=False,
        default=UserRoleEnum.USER,
    )
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


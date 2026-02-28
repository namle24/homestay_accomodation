"""Initial database schema.

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-02-28
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enums
    user_role_enum = sa.Enum(
        "admin",
        "receptionist",
        "user",
        name="user_role_enum",
    )
    room_type_enum = sa.Enum(
        "private",
        "dorm",
        name="room_type_enum",
    )
    booking_status_enum = sa.Enum(
        "pending",
        "confirmed",
        "cancelled",
        name="booking_status_enum",
    )
    booking_source_enum = sa.Enum(
        "direct",
        "booking_com",
        "airbnb",
        "agoda",
        "other",
        name="booking_source_enum",
    )
    ota_provider_enum = sa.Enum(
        "booking_com",
        "airbnb",
        "agoda",
        name="ota_provider_enum",
    )
    ota_sync_status_enum = sa.Enum(
        "success",
        "error",
        name="ota_sync_status_enum",
    )

    user_role_enum.create(op.get_bind(), checkfirst=True)
    room_type_enum.create(op.get_bind(), checkfirst=True)
    booking_status_enum.create(op.get_bind(), checkfirst=True)
    booking_source_enum.create(op.get_bind(), checkfirst=True)
    ota_provider_enum.create(op.get_bind(), checkfirst=True)
    ota_sync_status_enum.create(op.get_bind(), checkfirst=True)

    # users
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("role", user_role_enum, nullable=False, server_default="user"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("TRUE")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_email", "users", ["email"])

    # rooms
    op.create_table(
        "rooms",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("room_type", room_type_enum, nullable=False),
        sa.Column("total_units", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("max_occupancy", sa.Integer(), nullable=True),
        sa.Column("base_price", sa.Numeric(10, 2), nullable=True),
        sa.Column("ota_room_id", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("name", name="uq_rooms_name"),
    )
    op.create_index("ix_rooms_id", "rooms", ["id"])
    op.create_index("ix_rooms_ota_room_id", "rooms", ["ota_room_id"])

    # bookings
    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("room_id", sa.Integer(), nullable=False),
        sa.Column("guest_name", sa.String(length=255), nullable=False),
        sa.Column("guest_email", sa.String(length=255), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("status", booking_status_enum, nullable=False, server_default="confirmed"),
        sa.Column("booking_source", booking_source_enum, nullable=False, server_default="direct"),
        sa.Column("external_booking_id", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_bookings_id", "bookings", ["id"])
    op.create_index("ix_bookings_room_id", "bookings", ["room_id"])
    op.create_index("ix_bookings_external_booking_id", "bookings", ["external_booking_id"])
    op.create_foreign_key(
        "fk_bookings_room_id_rooms",
        "bookings",
        "rooms",
        ["room_id"],
        ["id"],
        ondelete="RESTRICT",
    )

    # prices
    op.create_table(
        "prices",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("room_id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="VND"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_prices_id", "prices", ["id"])
    op.create_index("ix_prices_room_id_date", "prices", ["room_id", "date"])
    op.create_foreign_key(
        "fk_prices_room_id_rooms",
        "prices",
        "rooms",
        ["room_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # otas_sync
    op.create_table(
        "otas_sync",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("provider", ota_provider_enum, nullable=False),
        sa.Column("last_sync_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_sync_status", ota_sync_status_enum, nullable=True),
        sa.Column("last_sync_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_otas_sync_id", "otas_sync", ["id"])


def downgrade() -> None:
    op.drop_index("ix_otas_sync_id", table_name="otas_sync")
    op.drop_table("otas_sync")

    op.drop_constraint("fk_prices_room_id_rooms", "prices", type_="foreignkey")
    op.drop_index("ix_prices_room_id_date", table_name="prices")
    op.drop_index("ix_prices_id", table_name="prices")
    op.drop_table("prices")

    op.drop_constraint("fk_bookings_room_id_rooms", "bookings", type_="foreignkey")
    op.drop_index("ix_bookings_external_booking_id", table_name="bookings")
    op.drop_index("ix_bookings_room_id", table_name="bookings")
    op.drop_index("ix_bookings_id", table_name="bookings")
    op.drop_table("bookings")

    op.drop_index("ix_rooms_ota_room_id", table_name="rooms")
    op.drop_index("ix_rooms_id", table_name="rooms")
    op.drop_table("rooms")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")

    ota_sync_status_enum = sa.Enum(name="ota_sync_status_enum")
    ota_provider_enum = sa.Enum(name="ota_provider_enum")
    booking_source_enum = sa.Enum(name="booking_source_enum")
    booking_status_enum = sa.Enum(name="booking_status_enum")
    room_type_enum = sa.Enum(name="room_type_enum")
    user_role_enum = sa.Enum(name="user_role_enum")

    ota_sync_status_enum.drop(op.get_bind(), checkfirst=True)
    ota_provider_enum.drop(op.get_bind(), checkfirst=True)
    booking_source_enum.drop(op.get_bind(), checkfirst=True)
    booking_status_enum.drop(op.get_bind(), checkfirst=True)
    room_type_enum.drop(op.get_bind(), checkfirst=True)
    user_role_enum.drop(op.get_bind(), checkfirst=True)


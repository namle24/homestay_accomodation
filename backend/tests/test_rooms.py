from backend.models.user import UserRoleEnum
from backend.models.room import RoomTypeEnum

def test_list_rooms_public(client):
    response = client.get("/rooms/")
    assert response.status_code == 200

def test_create_room_rbac_forbidden(client, token_headers_user):
    payload = {
        "name": "Unauthorized Room",
        "room_type": RoomTypeEnum.PRIVATE,
        "base_price": 500000,
        "total_units": 1
    }
    response = client.post("/rooms/", json=payload, headers=token_headers_user)
    assert response.status_code == 403

def test_create_room_validation_fail_private_units(client, token_headers_admin):
    # Rule: private must have 1 unit
    payload = {
        "name": "Invalid Private Room",
        "room_type": RoomTypeEnum.PRIVATE,
        "base_price": 1000000,
        "total_units": 4
    }
    response = client.post("/rooms/", json=payload, headers=token_headers_admin)
    assert response.status_code == 422 # Pydantic valuation error

def test_create_room_success_admin(client, token_headers_admin):
    payload = {
        "name": "Deluxe Room admin",
        "room_type": RoomTypeEnum.PRIVATE,
        "base_price": 1500000,
        "total_units": 1
    }
    response = client.post("/rooms/", json=payload, headers=token_headers_admin)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Deluxe Room admin"

def test_delete_room_with_bookings_fails(client, db, token_headers_admin):
    # 1. Create a room
    room_payload = {
        "name": "Room for Booking",
        "room_type": RoomTypeEnum.PRIVATE,
        "base_price": 800000,
        "total_units": 1
    }
    r_resp = client.post("/rooms/", json=room_payload, headers=token_headers_admin)
    room_id = r_resp.json()["id"]

    # 2. Create a booking for this room
    from backend.models.booking import Booking, BookingStatusEnum, BookingSourceEnum
    from datetime import date
    booking = Booking(
        room_id=room_id,
        guest_name="Test Customer",
        guest_email="customer@example.com",
        start_date=date(2024, 6, 1),
        end_date=date(2024, 6, 5),
        status=BookingStatusEnum.CONFIRMED,
        booking_source=BookingSourceEnum.DIRECT
    )
    db.add(booking)
    db.commit()

    # 3. Try to delete the room
    response = client.delete(f"/rooms/{room_id}", headers=token_headers_admin)
    assert response.status_code == 400
    assert "Cannot delete room with existing bookings" in response.json()["detail"]

def test_delete_room_success_no_bookings(client, token_headers_admin):
    # 1. Create a room
    room_payload = {
        "name": "Trash Room",
        "room_type": RoomTypeEnum.DORM,
        "base_price": 200000,
        "total_units": 10
    }
    r_resp = client.post("/rooms/", json=room_payload, headers=token_headers_admin)
    room_id = r_resp.json()["id"]

    # 2. Delete it
    response = client.delete(f"/rooms/{room_id}", headers=token_headers_admin)
    assert response.status_code == 204

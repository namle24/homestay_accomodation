# DESIGN_DECISIONS.md

## Database
- Use PostgreSQL
- Tables: users, rooms, bookings, prices, otas_sync

## Authentication
- JWT with refresh tokens
- Role based: admin, receptionist, user

## Availability Logic
- No double booking
- Update cache in Redis after booking created

## OTA Sync
- Cron fetch from Booking.com & Airbnb nightly at 1AM
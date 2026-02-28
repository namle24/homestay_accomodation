# TASKS.md

## Sprint 1 — Foundation ✅
- [x] Setup backend project structure
- [x] Create DB schema (rooms, bookings, users, prices, otas_sync)
- [x] Alembic migration initial
- [x] Config (pydantic-settings)
- [x] Seed data script

## Sprint 2 — Availability ✅
- [x] Availability API (`GET /availability/`)
- [x] Overlap logic + half-day checkout
- [x] Unit tests (3 tests)

## Sprint 3 — Booking ✅
- [x] Booking POST API (`POST /bookings/`)
- [x] Anti-overbooking validation
- [x] Unit tests (2 tests)
- [x] Pydantic V2 migration fix

## Sprint 4 — Auth & CRUD (NEXT)
- [ ] JWT Authentication (login/register)
- [ ] Role-based authorization (admin/receptionist/user)
- [ ] CRUD Rooms API (GET/POST/PUT/DELETE)
- [ ] CRUD Bookings mở rộng (list/detail/cancel/confirm)

## Sprint 5 — Price & Cache
- [ ] Price management API
- [ ] Redis cache cho availability
- [ ] User profile management

## Sprint 6 — OTA & Payment
- [ ] OTA Sync (Booking.com, Airbnb, Agoda)
- [ ] Stripe payment integration
- [ ] Frontend (React + Tailwind)
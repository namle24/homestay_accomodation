# Project State Summary - March 3, 2026

## ✅ Accomplishments (Phase 4)

### 🏨 Staff & Booking Features

- **Walk-in Booking**: Implemented "New Walk-in Booking" on the management dashboard. Staff can now create bookings manually, selecting any room directly.
- **Force Booking**: Backend modified to allow Admins/Receptionists to bypass availability limits (overbooking/manual override).
- **Booking Lifecycle**: Added "Check-out" action. Confirmed bookings can now be marked as `Completed`, which frees up room inventory while preserving revenue records.
- **Enhanced Dashboard**: Added columns for Guest Phone and Notes in the management table (responsive).

### ✨ UI/UX Upgrades

- **Room Presentation**: Rooms now display full descriptions and a list of amenities (Wifi, AC, etc.) on the Home page and in the Detail Modal.
- **Priority Forms**: The checkout flow now places Guest Phone at the top and makes it mandatory.
- **Bug Fixes**:
  - Fixed `ResponseValidationError` (500 error) on `/bookings/` caused by legacy data with null phone numbers.
  - Fixed Availability API to include `amenities` and `description` which were missing.
  - Standardized Room ID handling in the walk-in modal.

---

## 🛑 Outstanding Issues (Tồn đọng)

### 🔐 Authentication Bug (High Priority)

- **Issue**: `PUT /rooms/{id}` returns `401 Unauthorized` ("Could not validate credentials") when updating room amenities.
- **Observation**: This happens even if the user is an admin. It might be due to a token expiration or session mismatch in the browser.
- **Next Step**: Investigate why `deps.py` is rejecting the token. I added **Debug Logs** in `backend/api/deps.py` and `backend/main.py` to catch the specific failure reason.

### 🧹 Clean-up

- **Debug Code**: Remove `print` statements from `backend/api/deps.py` and `backend/main.py` once the auth bug is resolved.
- **Temp Files**: `diagnose_jwt.py` and `test_role_ser.py` are in the root directory.

---

## 📋 Current Checklist Status

- [x] Phase 1-3: Core MVP & UI Polish (Completed)
- [x] Phase 4: Staff Walk-in & Lifecycle (Implementation complete)
- [ ] Phase 4: Final Validation (Blocked by 401 bug)

## 🛠️ Tech Stack & Environment

- **Backend**: FastAPI, SQLAlchemy, SQLite, Jose (JWT).
- **Frontend**: React (Vite+TS), Tailwind CSS, Axios.
- **User**: admin@example.com (Staff role).

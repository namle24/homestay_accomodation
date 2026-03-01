# PROJECT_STATE.md

## Last Updated: 2026-03-01

## Phase 1: Backend MVP ✅ (COMPLETED)

- **Sprint 4: Authentication & Authorization**: JWT, hashing, RBAC.
- **Sprint 5: Rooms CRUD API**: Admin-protected creation/deletion, public listing.
- **Sprint 6: Core Booking API**: Create/List/Detail with Anti-Overbooking logic.
- **Sprint 7: Booking Lifecycle**: Status management and total price calculation.
- **Sprint 8: Backend Packaging**: CORS, SQLite (`homestay.db`), Seed Data, organized Swagger UI.
- **Verification**: 12/12 unit tests PASSED.

## Phase 2: Frontend Web App 🔧 (IN PROGRESS)

- **Sprint 1: Frontend Scaffold**: COMPLETED.
  - React + TypeScript + Vite.
  - Tailwind CSS configuration.
  - Axios service layer with base URL and JWT interceptor.
  - Standard folder structure (`components/`, `pages/`, `services/`, etc.).

## Next Steps (Restarting tomorrow)

1. **Frontend Sprint 2**: Authentication UI (Register/Login).
2. **Frontend Sprint 3**: Room Browser & Availability Search.
3. **Frontend Sprint 4**: Booking Flow.

---

**Current Database**: SQLite (`homestay.db`) - seeded with 14 rooms and 1 Admin.
**Backend URL**: `http://localhost:8000`
**Frontend URL**: `http://localhost:5173` (default Vite)

# Homestay Suối Khoáng Nóng Minh Hằng - Management System

A premium, full-stack management and booking system tailored for **Homestay Suối Khoáng Nóng Minh Hằng**. This application features a cinematic guest interface and a robust administrative dashboard for real-time operations.

---

## 📸 Visual Preview

> [!TIP]
> **[INSERT HERO SECTION SCREENSHOT HERE]**
> _Description: The cinematically animated hero section with search bar._

---

## ✨ Key Features

### 🏨 Guest Experience

- **Cinematic Landing Page**: Features high-quality visuals of the homestay and local culture with smooth scroll animations.
- **Real-time Availability Search**: Instantly find available Private or Dorm rooms for specific dates.
- **Interactive Room Details**: Comprehensive slideshows for each room type to showcase amenities and style.
- **Seamless Booking Flow**: Simple and secure booking process for guests.
- **My Bookings Dashboard**: Guests can track their personal booking history and status.

### 💼 Staff & Admin Tools (Receptionist)

- **Real-time Occupancy Dashboard**: Color-coded room grid showing:
  - 🔴 **Occupied**: Active stays (supports early check-in).
  - 🟡 **Reserved**: Upcoming bookings.
  - 🔵 **Cleaning**: Rooms being sanitized.
  - ⚪ **Maintenance**: Rooms out of service.
  - 🟢 **Available**: Ready-to-sell inventory.
- **Booking Management**: Quick actions for Check-in, Check-out, and Status Updates.
- **Live Notifications**: Real-time alerts for new bookings and system updates.
- **Booking Schedule**: Gantt-style view of all current and future stays.
- **Archives**: Historical record of all bookings with advanced filtering.

---

## 🚀 Tech Stack

- **Frontend**: React (TypeScript), Vite, Tailwind CSS, Lucide React (Icons).
- **Backend**: FastAPI (Python), SQLAlchemy (ORM), Pydantic (Validation).
- **Database**: SQLite (Development) / PostgreSQL (Production ready).
- **Security**: JWT Authentication, Bcrypt password hashing.

---

## 🛠️ Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+

### 1. Backend Setup

```bash
# Navigate to root
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload
```

The API will be available at `http://localhost:8000/docs` (Swagger UI).

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🎨 Personalization & Assets

### Replacing Images

You can easily personalize the website by overwriting files in the following directories:

| Section           | Directory Path                          | Expected Filenames                             |
| :---------------- | :-------------------------------------- | :--------------------------------------------- |
| **Hero / Banner** | `frontend/public/images/hero/`          | `banner.png`                                   |
| **Private Rooms** | `frontend/public/images/rooms/private/` | `main.png`, `2.png`, `3.png`                   |
| **Dorm Rooms**    | `frontend/public/images/rooms/dorm/`    | `main.png`, `2.png`, `3.png`                   |
| **Our Story**     | `frontend/public/images/about/`         | `story.png`, `story2.png`, `story3.png`        |
| **Activities**    | `frontend/public/images/activities/`    | `hot-spring.png`, `comfort.png`, `culture.png` |


> [!IMPORTANT]
<img width="1920" height="1040" alt="Screenshot 2026-03-06 145548" src="https://github.com/user-attachments/assets/468c838d-02ca-4ed1-b7eb-a57bc09d13a4" />
<img width="1920" height="1040" alt="Screenshot 2026-03-06 145541" src="https://github.com/user-attachments/assets/eff905c3-f6ef-40e2-8bae-356d6e39b06f" />
<img width="1920" height="1040" alt="Screenshot 2026-03-06 145538" src="https://github.com/user-attachments/assets/2e36dd76-089c-497f-93d1-12890d945f28" />
<img width="1920" height="1040" alt="Screenshot 2026-03-06 145530" src="https://github.com/user-attachments/assets/50e8e9ff-0a68-4082-952c-3687b549d1d7" />
<img width="1920" height="1040" alt="Screenshot 2026-03-06 145433" src="https://github.com/user-attachments/assets/8d940ee6-e97b-4b6c-9f2b-2ad5a90ba059" />
<img width="1920" height="1040" alt="Screenshot 2026-03-06 145413" src="https://github.com/user-attachments/assets/c6b987c2-6361-43e2-bbdb-387557bbdfe7" />
<img width="1920" height="1040" alt="Screenshot 2026-03-06 145407" src="https://github.com/user-attachments/assets/28462c0f-f32c-435c-8169-baa1aeccbfd7" />
> _Description: Dashboard showing the color-coded room grid._

---

## 📈 Project Status

- **Status**: Stable / Development Complete.
- **Last Updated**: March 6, 2026.
- **Completed Phases**: 19 Phases (Backend MVP, Frontend Web App, Admin Tools, Notification System, Asset Personalization, etc.).

---

## 📞 Support & Contact

- **Address**: HHCC+M8, Van Chan District, Yen Bai, Vietnam
- **Facebook**: [Homestay Suối Khoáng Nóng Minh Hằng](https://www.facebook.com/profile.php?id=61565515635546)
- **Maps**: [Google Maps Link](https://www.google.com/maps/place/Homestay+Su%E1%BB%91i+Kho%C3%A1ng+Minh+H%E1%BA%B1ng/@21.5717046,104.5707705,17z/)

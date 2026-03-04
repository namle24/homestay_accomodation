import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import BookingCheckout from './pages/BookingCheckout';
import MyBookings from './pages/MyBookings';
import ManageRooms from './pages/admin/ManageRooms';
import ReceptionistDashboard from './pages/admin/ReceptionistDashboard';
import BookingSchedule from './pages/admin/BookingSchedule';
import BookingArchives from './pages/admin/BookingArchives';
import Notifications from './pages/admin/Notifications';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                 <Route path="/book/:roomId" element={<BookingCheckout />} />
                 <Route path="/my-bookings" element={<MyBookings />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                 <Route path="/dashboard" element={<ReceptionistDashboard />} />
                 <Route path="/manage-rooms" element={<ManageRooms />} />
                 <Route path="/schedule" element={<BookingSchedule />} />
                 <Route path="/archives" element={<BookingArchives />} />
                 <Route path="/admin/notifications" element={<Notifications />} />
              </Route>
            </Routes>
          </div>
        </div>
      </Router>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

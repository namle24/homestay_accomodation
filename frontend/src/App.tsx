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

function App() {
  return (
    <AuthProvider>
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
                 <Route path="/manage-rooms" element={<ManageRooms />} />
              </Route>
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

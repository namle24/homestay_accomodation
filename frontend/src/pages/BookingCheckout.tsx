import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { roomService } from '../services/roomService';
import { bookingService } from '../services/bookingService';
import { Room } from '../types/room';

const BookingCheckout: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Calculate Nights
  const getDaysDiff = (start: string, end: string) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    // Ignore time for standard hotel night calculation (count midnights crossed)
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, days); // Minimum 1 night
  };
  
  const formatDatePreview = (isoString: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    // If there is no time provided (e.g. just date), add default time to look nice
    if (isoString.length <= 10) d.setHours(14, 0, 0);
    
    return d.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };
  
  const nights = (checkIn && checkOut) ? getDaysDiff(checkIn, checkOut) : 0;
  
  // Calculate Total Price
  const basePrice = room ? parseFloat(room.base_price) : 0;
  const totalPrice = basePrice * quantity * nights;

  useEffect(() => {
    if (!roomId) return;
    
    const fetchRoom = async () => {
      try {
        const data = await roomService.getRoomById(roomId);
        setRoom(data);
      } catch (err) {
        setError('Failed to load room details.');
      } finally {
        setLoadingRoom(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !checkIn || !checkOut) {
      setError('Missing booking details.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await bookingService.createBooking({
        room_id: parseInt(roomId),
        guest_name: guestName,
        guest_email: guestEmail,
        phone_number: phoneNumber,
        start_date: checkIn,
        end_date: checkOut,
        quantity: quantity,
      });

      // Show success toast/alert (Simple alert for MVP)
      alert('Booking Successfully Created!');
      navigate('/my-bookings');
    } catch (err: any) {
      if (err.response?.status === 400 || err.response?.status === 422) {
        let errorMsg = 'Rất tiếc, phòng này vừa hết chỗ trong khoảng thời gian bạn chọn.';
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail) && detail.length > 0 && typeof detail[0].msg === 'string') {
          errorMsg = detail[0].msg;
        }
        setError(errorMsg);
      } else if (err.response?.status === 403) {
        setError('Bạn không có quyền thực hiện chức năng này.');
      } else {
        setError('Đã xảy ra lỗi khi tạo đặt phòng. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loadingRoom) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Room not found</h2>
        <button onClick={() => navigate('/')} className="text-primary-600 hover:text-primary-700">Go back Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to search results
          </button>
        </div>

        <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl">
          <div className="px-4 py-5 sm:px-6 bg-primary-700 text-white">
            <h3 className="text-xl leading-6 font-bold uppercase tracking-wider">
              Confirm Your Booking
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-primary-200">
              Please review your details and submit the form to finalize your stay.
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Room Summary */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Room Summary</h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h5 className="font-bold text-gray-800 text-xl">{room.name}</h5>
                  <p className="text-sm text-gray-500 capitalize mt-1">{room.room_type} Room</p>
                  
                  <div className="mt-4 space-y-2 text-sm text-gray-700">
                    <div className="flex flex-col gap-2">
                       <div className="flex justify-between items-center">
                        <span className="font-medium">Check-in:</span>
                        <input 
                          type="datetime-local" 
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Check-out:</span>
                        <input 
                          type="datetime-local" 
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                      <span className="font-medium">Duration:</span>
                      <span>{nights} {nights === 1 ? 'night' : 'nights'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Rate:</span>
                      <span>{formatCurrency(basePrice)} / night</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Form */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Guest Details</h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-bold text-gray-900">Phone Number (Required for Booking)</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      required
                      placeholder="e.g., +84 123 456 789"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="mt-1 block w-full border-2 border-primary-100 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-primary-50/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="guestName" className="block text-sm font-medium text-gray-700">Guest Name</label>
                    <input
                      type="text"
                      id="guestName"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700">Guest Email</label>
                    <input
                      type="email"
                      id="guestEmail"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Number of Rooms/Guests</label>
                    <input
                      type="number"
                      id="quantity"
                      min={1}
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>

                  <div className="pt-6 border-t border-gray-200 flex flex-col items-end">
                     <p className="text-gray-500 text-sm mb-1">Total Due</p>
                     <p className="text-3xl font-extrabold text-primary-600 mb-4">
                       {formatCurrency(totalPrice)}
                     </p>
                     <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        {submitting ? 'Confirming...' : 'Confirm Booking'}
                      </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCheckout;

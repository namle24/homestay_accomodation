import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { roomService } from '../services/roomService';
import { BookingResponse } from '../types/booking';
import { Room } from '../types/room';

const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [rooms, setRooms] = useState<Record<number, Room>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    room_id: '',
    guest_name: '',
    phone_number: '',
    start_date: '',
    end_date: '',
    quantity: 1,
    notes: '',
    status: 'confirmed'
  });

  const isAdminOrReceptionist = user?.role === 'admin' || user?.role === 'receptionist';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [bookingsData, roomsData] = await Promise.all([
        bookingService.getBookings(),
        roomService.getRooms(),
      ]);

      // Create a dictionary of rooms for quick O(1) lookups by ID
      const roomDict: Record<number, Room> = {};
      roomsData.forEach(room => {
        roomDict[room.id] = room;
      });

      setRooms(roomDict);
      setBookings(bookingsData);
    } catch (err) {
      setError('Failed to load bookings data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh bookings every 15 seconds to reflect status changes (e.g. from Admin)
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (highlightId && !loading && bookings.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`booking-${highlightId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [highlightId, loading, bookings]);

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(999999); // Global loading for new booking
    try {
      if (!walkInForm.room_id) {
        alert('Please select a room');
        return;
      }
      // Standardize check-out time to 12:00:00
      const finalCheckOut = walkInForm.end_date.includes('T') ? walkInForm.end_date : `${walkInForm.end_date}T12:00:00`;

      await bookingService.createBooking({
        room_id: parseInt(walkInForm.room_id),
        guest_name: walkInForm.guest_name,
        phone_number: walkInForm.phone_number,
        start_date: walkInForm.start_date,
        end_date: finalCheckOut,
        quantity: walkInForm.quantity,
        notes: walkInForm.notes,
        status: walkInForm.status
      });
      setIsWalkInModalOpen(false);
      setWalkInForm({
        room_id: '',
        guest_name: '',
        phone_number: '',
        start_date: '',
        end_date: '',
        quantity: 1,
        notes: '',
        status: 'confirmed'
      });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create walk-in booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (bookingId: number, status: string) => {
    setActionLoading(bookingId);
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      // Refresh the list after successful update
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update booking status.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amountStr: string) => {
    const amount = parseFloat(amountStr);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 capitalize">{status}</span>;
      case 'confirmed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">{status}</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 capitalize">Cancelled</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">Completed</span>;
      case 'checked_in':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 capitalize">Checked-in</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {isAdminOrReceptionist ? 'Booking Management' : 'My Bookings'}
            </h2>
            <p className="mt-1 flex items-center text-sm text-gray-500">
              {isAdminOrReceptionist ? 
                'Manage all reservations across the system. Approve or cancel bookings.' : 
                'View your past and upcoming stays at Homestay Oasis.'}
            </p>
          </div>
          {isAdminOrReceptionist && (
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                type="button"
                onClick={() => setIsWalkInModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all transform hover:scale-105"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Walk-in Booking
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Phone</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Notes</th>
                        {isAdminOrReceptionist && (
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan={isAdminOrReceptionist ? 9 : 8} className="px-6 py-12 text-center text-gray-500">
                            No bookings found.
                          </td>
                        </tr>
                      ) : (
                        bookings.map((booking) => (
                          <tr 
                            key={booking.id} 
                            id={`booking-${booking.id}`}
                            className={`transition-colors duration-1000 ${
                              highlightId === booking.id.toString() 
                                ? 'bg-primary-50 ring-2 ring-primary-500 ring-inset' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              #{booking.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{rooms[booking.room_id]?.name || `Room ${booking.room_id}`}</div>
                              <div className="text-sm text-gray-500 capitalize">{rooms[booking.room_id]?.room_type}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{booking.start_date}</div>
                              <div className="text-sm text-gray-500">to {booking.end_date}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                              {booking.guest_email || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                              {booking.phone_number || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {formatCurrency(booking.total_price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(booking.status)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell max-w-[200px] truncate">
                              {booking.notes || '-'}
                            </td>
                            
                            {isAdminOrReceptionist && (
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {(booking.status === 'confirmed' || booking.status === 'checked_in') && (
                                  <button
                                    onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                    disabled={actionLoading === booking.id}
                                    className="text-primary-600 hover:text-primary-900 font-bold mr-4"
                                  >
                                    Check-out
                                  </button>
                                )}
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                  disabled={booking.status === 'cancelled' || booking.status === 'confirmed' || booking.status === 'completed' || booking.status === 'checked_in' || actionLoading === booking.id}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-30 disabled:cursor-not-allowed mr-4"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                  disabled={booking.status === 'cancelled' || booking.status === 'completed' || booking.status === 'checked_in' || actionLoading === booking.id}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  Cancel
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden space-y-4">
          {bookings.length === 0 ? (
            <div className="bg-white p-6 text-center text-gray-500 rounded-lg shadow-sm">
               No bookings found.
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="bg-white shadow rounded-lg p-4 border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs text-gray-500">#{booking.id}</span>
                    <h3 className="font-bold text-gray-900">{rooms[booking.room_id]?.name || `Room ${booking.room_id}`}</h3>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Guest:</span>
                    <span className="text-gray-900">{booking.guest_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <span className="text-gray-900">{booking.phone_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dates:</span>
                    <span className="text-gray-900">{booking.start_date} to {booking.end_date}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-50 pt-1 mt-1">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(booking.total_price)}</span>
                  </div>
                </div>

                {booking.notes && (
                  <div className="mb-3 py-2 bg-gray-50 px-3 rounded text-xs text-gray-500 italic">
                    <strong>Notes:</strong> {booking.notes}
                  </div>
                )}

                {isAdminOrReceptionist && (
                  <div className="flex justify-end space-x-3 pt-3 border-t border-gray-50">
                    {(booking.status === 'confirmed' || booking.status === 'checked_in') && (
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'completed')}
                        disabled={actionLoading === booking.id}
                        className="px-3 py-1 bg-primary-600 text-white font-bold rounded text-sm hover:bg-primary-700 disabled:opacity-50 transition-all"
                      >
                        Check-out
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                      disabled={booking.status === 'cancelled' || booking.status === 'confirmed' || booking.status === 'completed' || booking.status === 'checked_in' || actionLoading === booking.id}
                      className="px-3 py-1 bg-green-50 text-green-700 font-medium rounded text-sm hover:bg-green-100 disabled:opacity-50 border border-green-200"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                      disabled={booking.status === 'cancelled' || booking.status === 'completed' || booking.status === 'checked_in' || actionLoading === booking.id}
                      className="px-3 py-1 bg-red-50 text-red-700 font-medium rounded text-sm hover:bg-red-100 disabled:opacity-50 border border-red-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Walk-in Booking Modal */}
        {isWalkInModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsWalkInModalOpen(false)}></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 animate-fade-in scale-up">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                      New Walk-in Booking
                    </h3>
                    <button onClick={() => setIsWalkInModalOpen(false)} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <form onSubmit={handleWalkInSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Room</label>
                      <select
                        required
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-gray-900 border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        value={walkInForm.room_id}
                        onChange={(e) => setWalkInForm({ ...walkInForm, room_id: e.target.value, quantity: 1 })}
                      >
                        <option value="">Select a room...</option>
                        {Object.values(rooms).map(room => (
                          <option key={room.id} value={room.id.toString()}>
                            {room.name} ({room.room_type === 'dorm' ? `Dorm · ${room.total_units} beds` : 'Private'}) — {formatCurrency(room.base_price.toString())}/night
                          </option>
                        ))}
                      </select>

                      {/* Bed count selector — shown only for Dorm rooms */}
                      {walkInForm.room_id && rooms[parseInt(walkInForm.room_id)]?.room_type === 'dorm' && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <label className="block text-sm font-semibold text-blue-800 mb-1">
                            🛏 Number of Beds
                            <span className="ml-1 text-xs font-normal text-blue-500">
                              (max: {rooms[parseInt(walkInForm.room_id)]?.total_units} beds available)
                            </span>
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={rooms[parseInt(walkInForm.room_id)]?.total_units}
                            value={walkInForm.quantity}
                            onChange={(e) => setWalkInForm({ ...walkInForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="block w-28 border border-blue-300 rounded-md shadow-sm py-2 px-3 text-gray-900 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                          <p className="text-xs text-blue-500 mt-1">Khách có thể đặt nhiều giường cho bạn bè</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Guest Name</label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          value={walkInForm.guest_name}
                          onChange={(e) => setWalkInForm({ ...walkInForm, guest_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                          type="tel"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          value={walkInForm.phone_number}
                          onChange={(e) => setWalkInForm({ ...walkInForm, phone_number: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Check-in</label>
                        <input
                          type="datetime-local"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          value={walkInForm.start_date}
                          min={new Date().toISOString().slice(0, 16)}
                          onChange={(e) => setWalkInForm({ ...walkInForm, start_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Check-out Date</label>
                        <input
                          type="date"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          value={walkInForm.end_date.split('T')[0]}
                          min={walkInForm.start_date ? new Date(new Date(walkInForm.start_date).getTime() + 86400000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                          onChange={(e) => setWalkInForm({ ...walkInForm, end_date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                          value={walkInForm.status}
                          onChange={(e) => setWalkInForm({ ...walkInForm, status: e.target.value })}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes (Requirement)</label>
                      <textarea
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Internal staff notes or special requests..."
                        value={walkInForm.notes}
                        onChange={(e) => setWalkInForm({ ...walkInForm, notes: e.target.value })}
                      />
                    </div>

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                      <button
                        type="submit"
                        disabled={actionLoading === 999999}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-bold text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                      >
                        {actionLoading === 999999 ? 'Saving...' : 'Create Booking'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsWalkInModalOpen(false)}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

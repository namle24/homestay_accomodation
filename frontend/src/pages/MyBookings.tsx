import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/bookingService';
import { roomService } from '../services/roomService';
import { BookingResponse } from '../types/booking';
import { Room } from '../types/room';

const MyBookings: React.FC = () => {
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [rooms, setRooms] = useState<Record<number, Room>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');

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
  }, [fetchData]);

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 capitalize">{status}</span>;
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
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        {isAdminOrReceptionist && (
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan={isAdminOrReceptionist ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                            No bookings found.
                          </td>
                        </tr>
                      ) : (
                        bookings.map((booking) => (
                          <tr key={booking.id}>
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {booking.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {formatCurrency(booking.total_price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(booking.status)}
                            </td>
                            
                            {isAdminOrReceptionist && (
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                  disabled={booking.status === 'cancelled' || booking.status === 'confirmed' || actionLoading === booking.id}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-30 disabled:cursor-not-allowed mr-4"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                  disabled={booking.status === 'cancelled' || actionLoading === booking.id}
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
                
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <p><strong>Dates:</strong> {booking.start_date} to {booking.end_date}</p>
                  <p><strong>Quantity:</strong> {booking.quantity}</p>
                  <p><strong>Total:</strong> <span className="font-semibold text-gray-900">{formatCurrency(booking.total_price)}</span></p>
                </div>

                {isAdminOrReceptionist && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-3">
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                      disabled={booking.status === 'cancelled' || booking.status === 'confirmed' || actionLoading === booking.id}
                      className="px-3 py-1 bg-green-50 text-green-700 font-medium rounded text-sm hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed border border-green-200"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                      disabled={booking.status === 'cancelled' || actionLoading === booking.id}
                      className="px-3 py-1 bg-red-50 text-red-700 font-medium rounded text-sm hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  );
};

export default MyBookings;

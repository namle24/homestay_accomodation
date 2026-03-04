import React, { useState, useEffect, useCallback } from 'react';
import { roomService } from '../../services/roomService';
import { bookingService } from '../../services/bookingService';
import { Room } from '../../types/room';
import { BookingResponse } from '../../types/booking';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

type RoomStatus = 'available' | 'occupied' | 'reserved';

interface RoomWithStatus {
  room: Room;
  status: RoomStatus;
  activeBooking?: BookingResponse;
}

const ReceptionistDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { addToast } = useNotifications();
  const [roomsWithStatus, setRoomsWithStatus] = useState<RoomWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'private' | 'dorm'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomData, setSelectedRoomData] = useState<RoomWithStatus | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [rooms, bookings] = await Promise.all([
        roomService.getRooms(),
        bookingService.getBookings(),
      ]);

      const result: RoomWithStatus[] = rooms.map((room) => {
        const now = new Date();
        
        // Find a booking that makes this room occupied today
        // Occupied: status is 'confirmed' or 'checked_in', and now is between start and end
        const occupiedBooking = bookings.find(
          (b) =>
            b.room_id === room.id &&
            (b.status === 'confirmed' || b.status === 'checked_in') &&
            new Date(b.start_date) <= now &&
            new Date(b.end_date) > now
        );

        if (occupiedBooking) {
          return { 
            room, 
            status: occupiedBooking.status === 'checked_in' ? 'occupied' : 'reserved', 
            activeBooking: occupiedBooking 
          };
        }

        // Reserved: confirmed or pending booking in the future (starts after now)
        const reservedBooking = bookings.find(
          (b) =>
            b.room_id === room.id &&
            (b.status === 'confirmed' || b.status === 'pending') &&
            new Date(b.start_date) > now
        );

        if (reservedBooking) {
          return { room, status: 'reserved', activeBooking: reservedBooking };
        }

        return { room, status: 'available' };
      });

      setRoomsWithStatus(result);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleQuickCheckout = async (bookingId: number) => {
    setActionLoading(true);
    try {
      await bookingService.updateBookingStatus(bookingId, 'completed');
      setSelectedRoomData(null);
      await fetchData();
    } catch (err) {
      alert('Failed to check out. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckIn = async (bookingId: number) => {
    setActionLoading(true);
    try {
      await bookingService.updateBookingStatus(bookingId, 'checked_in');
      setSelectedRoomData(null);
      await fetchData();
    } catch (err) {
      alert('Failed to check in. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Stats
  const totalRooms = roomsWithStatus.length;
  const occupiedCount = roomsWithStatus.filter((r) => r.status === 'occupied').length;
  const availableCount = roomsWithStatus.filter((r) => r.status === 'available').length;
  const reservedCount = roomsWithStatus.filter((r) => r.status === 'reserved').length;

  // Filter + Search
  const filtered = roomsWithStatus.filter((rws) => {
    const typeMatch = filterType === 'all' || rws.room.room_type === filterType;
    if (!typeMatch) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const guestName = rws.activeBooking?.guest_name?.toLowerCase() || '';
      const phone = rws.activeBooking?.phone_number?.toLowerCase() || '';
      const roomName = rws.room.name.toLowerCase();
      if (!guestName.includes(q) && !phone.includes(q) && !roomName.includes(q)) return false;
    }
    return true;
  });

  const statusConfig = {
    occupied: {
      bg: 'bg-red-50 border-red-300',
      dot: 'bg-red-500',
      badge: 'bg-red-100 text-red-700',
      label: t('admin.dashboard.occupied'),
    },
    reserved: {
      bg: 'bg-amber-50 border-amber-300',
      dot: 'bg-amber-400',
      badge: 'bg-amber-100 text-amber-700',
      label: t('admin.dashboard.reserved'),
    },
    available: {
      bg: 'bg-emerald-50 border-emerald-200',
      dot: 'bg-emerald-500',
      badge: 'bg-emerald-100 text-emerald-700',
      label: t('admin.dashboard.available'),
    },
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{t('admin.dashboard.title')}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('admin.dashboard.refresh')}
            </button>
            <button
              onClick={() => addToast('Đây là thông báo kiểm tra hệ thống!', 'success')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-50 border border-primary-200 text-sm font-bold text-primary-700 hover:bg-primary-100 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Kiểm tra thông báo
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t('admin.dashboard.totalRooms'), value: totalRooms, icon: '🏠', color: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
            { label: t('admin.dashboard.occupied'), value: occupiedCount, icon: '🔴', color: 'bg-red-50 border-red-200', text: 'text-red-700' },
            { label: t('admin.dashboard.available'), value: availableCount, icon: '🟢', color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
            { label: t('admin.dashboard.reserved'), value: reservedCount, icon: '🟡', color: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} border rounded-2xl p-5 flex flex-col gap-1`}>
              <div className="flex items-center justify-between">
                <span className="text-2xl">{stat.icon}</span>
                <span className={`text-3xl font-black ${stat.text}`}>{stat.value}</span>
              </div>
              <p className="text-sm font-semibold text-gray-600 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={t('admin.dashboard.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'private', 'dorm'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                  filterType === type
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? t('admin.dashboard.types.all') : type === 'private' ? t('admin.dashboard.types.private') : t('admin.dashboard.types.dorm')}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-gray-600">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>Available</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>Reserved (upcoming)</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>Occupied (guest in)</div>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(({ room, status, activeBooking }) => {
            const cfg = statusConfig[status];
            const isClickable = status !== 'available';
            return (
              <div
                key={room.id}
                onClick={() => isClickable ? setSelectedRoomData({ room, status, activeBooking }) : undefined}
                className={`${cfg.bg} border-2 rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 ${
                  isClickable ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : 'cursor-default'
                }`}
              >
                {/* Room header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-base leading-tight">{room.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{room.room_type} room</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} animate-pulse`}></span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                </div>

                {/* Guest Info (if occupied/reserved) */}
                {activeBooking && (
                  <div className="bg-white/70 rounded-xl p-3 space-y-1.5 shadow-inner">
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-semibold text-gray-800 truncate">{activeBooking.guest_name}</span>
                    </div>
                    {activeBooking.phone_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a
                          href={`tel:${activeBooking.phone_number}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary-600 font-medium hover:underline"
                        >
                          {activeBooking.phone_number}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {status === 'occupied'
                          ? `Check-out: ${formatDate(activeBooking.end_date)}`
                          : `Check-in: ${formatDate(activeBooking.start_date)}`}
                      </span>
                    </div>

                    {/* Simple Action buttons for grid */}
                    <div className="mt-3 pt-3 border-t border-black/5 flex gap-2">
                      {status === 'reserved' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCheckIn(activeBooking.id); }}
                          disabled={actionLoading}
                          className="flex-1 py-1.5 bg-primary-600 text-white text-[10px] font-bold rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                          Check-in
                        </button>
                      )}
                      {status === 'occupied' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleQuickCheckout(activeBooking.id); }}
                          disabled={actionLoading}
                          className="flex-1 py-1.5 bg-gray-800 text-white text-[10px] font-bold rounded-lg hover:bg-black transition-colors shadow-sm disabled:opacity-50"
                        >
                          Checkout
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {status === 'available' && (
                  <div className="text-xs text-emerald-600 font-medium text-center py-2">
                    ✓ Ready for new guests
                  </div>
                )}

                {isClickable && (
                  <p className="text-xs text-gray-400 text-center">Click for details</p>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <p className="text-lg font-medium">No rooms match your filters.</p>
              <button onClick={() => { setFilterType('all'); setSearchQuery(''); }} className="mt-3 text-sm text-primary-600 hover:underline">Clear filters</button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Detail Popup */}
      {selectedRoomData && selectedRoomData.activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedRoomData(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup header */}
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${statusConfig[selectedRoomData.status].badge}`}>
                  {statusConfig[selectedRoomData.status].label}
                </span>
                <h2 className="text-xl font-extrabold text-gray-900 mt-2">{selectedRoomData.room.name}</h2>
              </div>
              <button onClick={() => setSelectedRoomData(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Guest Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Guest Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Name</span>
                  <span className="font-semibold text-gray-900">{selectedRoomData.activeBooking.guest_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone</span>
                  <a href={`tel:${selectedRoomData.activeBooking.phone_number}`} className="font-semibold text-primary-600 hover:underline">
                    {selectedRoomData.activeBooking.phone_number || '—'}
                  </a>
                </div>
                {selectedRoomData.activeBooking.guest_email && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-700">{selectedRoomData.activeBooking.guest_email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Booking Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Check-in</span>
                  <span className="font-semibold text-gray-900">{formatDate(selectedRoomData.activeBooking.start_date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Check-out</span>
                  <span className="font-semibold text-gray-900">{formatDate(selectedRoomData.activeBooking.end_date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-primary-600 text-base">{formatCurrency(selectedRoomData.activeBooking.total_price)}</span>
                </div>
                {selectedRoomData.activeBooking.notes && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Special Requests</p>
                    <p className="text-sm text-gray-700 bg-amber-50 rounded-lg p-2">{selectedRoomData.activeBooking.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {selectedRoomData.status === 'reserved' && (
                <button
                  onClick={() => handleCheckIn(selectedRoomData.activeBooking!.id)}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirm Check-in
                    </>
                  )}
                </button>
              )}
              {selectedRoomData.status === 'occupied' && (
                <button
                  onClick={() => handleQuickCheckout(selectedRoomData.activeBooking!.id)}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {t('admin.dashboard.checkoutBtn')}
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setSelectedRoomData(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;

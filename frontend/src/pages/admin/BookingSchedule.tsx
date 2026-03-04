import React, { useState, useEffect, useCallback, useRef } from 'react';
import { roomService } from '../../services/roomService';
import { bookingService } from '../../services/bookingService';
import { Room } from '../../types/room';
import { BookingResponse } from '../../types/booking';
import { formatCurrency } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-blue-500 hover:bg-blue-600',
  checked_in: 'bg-red-500 hover:bg-red-600',
  pending:   'bg-amber-400 hover:bg-amber-500',
  completed: 'bg-gray-400 hover:bg-gray-500',
  cancelled: 'bg-red-300 hover:bg-red-400',
};

const STATUS_BADGE: Record<string, string> = {
  confirmed: 'bg-blue-100 text-blue-800',
  checked_in: 'bg-red-100 text-red-800',
  pending: 'bg-amber-100 text-amber-800',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

const BookingSchedule: React.FC = () => {
  const { t } = useLanguage();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tooltip, setTooltip] = useState<{ booking: BookingResponse; x: number; y: number } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Days in the viewed month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [roomsData, bookingsData] = await Promise.all([
        roomService.getRooms(),
        bookingService.getBookings(),
      ]);
      setRooms(roomsData);
      setBookings(bookingsData);
    } catch {
      setError('Failed to load schedule data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  // Get bookings for a room that overlap this month
  const getBookingsForRoom = (roomId: number) => {
    const monthStart = new Date(viewYear, viewMonth, 1);
    const monthEnd   = new Date(viewYear, viewMonth + 1, 0);
    return bookings.filter(b => {
      if (b.room_id !== roomId) return false;
      // Hide cancelled AND completed bookings from the schedule
      if (b.status === 'cancelled' || b.status === 'completed') return false;
      const start = new Date(b.start_date);
      const end   = new Date(b.end_date);
      return start <= monthEnd && end >= monthStart;
    });
  };

  // Compute the left offset (col) and width (span) of a bar in this month
  const getBarPosition = (booking: BookingResponse) => {
    const start = new Date(booking.start_date);
    const end   = new Date(booking.end_date);
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const lastOfMonth  = new Date(viewYear, viewMonth + 1, 0);

    const clampedStart = start < firstOfMonth ? firstOfMonth : start;
    const clampedEnd   = end   > lastOfMonth  ? lastOfMonth  : end;

    const startDay = clampedStart.getDate(); // 1-indexed
    const endDay   = clampedEnd.getDate();
    return { startDay, span: endDay - startDay + 1 };
  };

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const formatDate = (d: string) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const ROOM_COL_W = 140; // px
  const DAY_COL_W = 36;   // px

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{t('admin.schedule.title')}</h1>
              <p className="text-sm text-gray-500 mt-1">Gantt-style room occupancy calendar</p>
            </div>

            {/* Month Navigator */}
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-base font-bold text-gray-900 w-40 text-center">{monthName}</span>
              <button onClick={nextMonth} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button onClick={fetchData} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ml-2" title="Refresh">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 text-xs font-medium">
            {Object.entries({ 
              pending: '🟡 ' + t('common.pending'),
              confirmed: '🔵 ' + t('admin.dashboard.reserved'), 
              checked_in: '🔴 ' + t('admin.dashboard.occupied'),
            }).map(([k, v]) => (
              <span key={k} className={`px-2 py-1 rounded-full ${STATUS_BADGE[k]}`}>{v}</span>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="max-w-7xl mx-auto px-4 py-3"><div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm">{error}</div></div>}

      {/* Scrollable Gantt */}
      <div className="px-4 sm:px-6 py-6 overflow-x-auto">
        <div style={{ minWidth: ROOM_COL_W + DAY_COL_W * daysInMonth }}>
          {/* Header row: room label + day numbers */}
          <div className="flex sticky top-0 z-10 bg-gray-100 border border-gray-200 rounded-t-xl overflow-hidden">
            <div style={{ width: ROOM_COL_W, minWidth: ROOM_COL_W }} className="px-3 py-2 text-xs font-bold text-gray-500 uppercase border-r border-gray-200 flex-shrink-0">
              Room
            </div>
            {days.map(d => {
              const date = new Date(viewYear, viewMonth, d);
              const isToday = date.toDateString() === new Date().toDateString();
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return (
                <div
                  key={d}
                  style={{ width: DAY_COL_W, minWidth: DAY_COL_W }}
                  className={`text-center py-2 text-xs font-semibold flex-shrink-0 border-r border-gray-200 ${isToday ? 'bg-primary-100 text-primary-700' : isWeekend ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  <div>{d}</div>
                  <div className="text-[9px] text-gray-400">{date.toLocaleString('en-US', { weekday: 'narrow' })}</div>
                </div>
              );
            })}
          </div>

          {/* Room rows */}
          {rooms.map((room, rowIdx) => {
            const roomBookings = getBookingsForRoom(room.id);
            return (
              <div key={room.id} className={`flex border-l border-r border-b border-gray-200 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`} style={{ height: 52 }}>
                {/* Room name cell */}
                <div style={{ width: ROOM_COL_W, minWidth: ROOM_COL_W }} className="px-3 py-1 border-r border-gray-200 flex-shrink-0 flex flex-col justify-center">
                  <p className="text-sm font-semibold text-gray-800 truncate">{room.name}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{room.room_type}</p>
                </div>

                {/* Day cells + bars */}
                <div className="relative flex-1 flex" style={{ minWidth: DAY_COL_W * daysInMonth }}>
                  {/* Background day columns */}
                  {days.map(d => {
                    const date = new Date(viewYear, viewMonth, d);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    return (
                      <div
                        key={d}
                        style={{ width: DAY_COL_W, minWidth: DAY_COL_W }}
                        className={`flex-shrink-0 border-r border-gray-100 h-full ${isToday ? 'bg-primary-50' : isWeekend ? 'bg-gray-100/50' : ''}`}
                      />
                    );
                  })}

                  {/* Booking bars */}
                  {roomBookings.map(b => {
                    const { startDay, span } = getBarPosition(b);
                    return (
                      <div
                        key={b.id}
                        style={{
                          position: 'absolute',
                          left: (startDay - 1) * DAY_COL_W + 2,
                          width: span * DAY_COL_W - 4,
                          top: 8,
                          height: 34,
                        }}
                        className={`${STATUS_COLORS[b.status] || 'bg-gray-400'} rounded-lg text-white text-xs font-semibold flex items-center px-2 cursor-pointer truncate shadow-sm transition-all`}
                        onMouseEnter={(e) => setTooltip({ booking: b, x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => setSelectedBooking(b)}
                        title={b.guest_name}
                      >
                        <span className="truncate">{b.guest_name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {rooms.length === 0 && (
            <div className="border border-t-0 border-gray-200 bg-white py-12 text-center text-gray-400 rounded-b-xl">No rooms found.</div>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          ref={tooltipRef}
          style={{ position: 'fixed', left: tooltip.x + 12, top: tooltip.y - 8, zIndex: 9999, pointerEvents: 'none' }}
          className="bg-gray-900 text-white text-xs rounded-xl p-3 shadow-2xl space-y-1 max-w-[220px]"
        >
          <p className="font-bold text-sm">{tooltip.booking.guest_name}</p>
          {tooltip.booking.phone_number && <p>📞 {tooltip.booking.phone_number}</p>}
          <p>📅 {formatDate(tooltip.booking.start_date)} → {formatDate(tooltip.booking.end_date)}</p>
          <p>💰 {formatCurrency(tooltip.booking.total_price)}</p>
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_BADGE[tooltip.booking.status]}`}>
            {tooltip.booking.status}
          </span>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${STATUS_BADGE[selectedBooking.status]}`}>{selectedBooking.status}</span>
                <h3 className="text-xl font-extrabold text-gray-900 mt-2">Booking #{selectedBooking.id}</h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 text-sm bg-gray-50 rounded-xl p-4">
              {[
                { label: 'Guest', value: selectedBooking.guest_name },
                { label: 'Phone', value: selectedBooking.phone_number },
                { label: 'Email', value: selectedBooking.guest_email || '—' },
                { label: 'Check-in', value: formatDate(selectedBooking.start_date) },
                { label: 'Check-out', value: formatDate(selectedBooking.end_date) },
                { label: 'Total', value: formatCurrency(selectedBooking.total_price) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-900">{value}</span>
                </div>
              ))}
              {selectedBooking.notes && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-gray-500 text-xs mb-1">Special Requests</p>
                  <p className="text-gray-700 bg-amber-50 rounded-lg p-2">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
            <button onClick={() => setSelectedBooking(null)} className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSchedule;

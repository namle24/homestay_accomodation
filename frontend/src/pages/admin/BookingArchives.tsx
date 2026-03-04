import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { bookingService } from '../../services/bookingService';
import { roomService } from '../../services/roomService';
import { BookingResponse } from '../../types/booking';
import { Room } from '../../types/room';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';

const STATUS_BADGE: Record<string, string> = {
  confirmed: 'bg-blue-100 text-blue-800',
  pending:   'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  checked_in: 'bg-red-100 text-red-600',
};

const BookingArchives: React.FC = () => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [rooms, setRooms] = useState<Record<number, Room>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [bookingsData, roomsData] = await Promise.all([
        bookingService.getBookings(),
        roomService.getRooms(),
      ]);
      const roomDict: Record<number, Room> = {};
      roomsData.forEach(r => { roomDict[r.id] = r; });
      setRooms(roomDict);
      // Sort by created_at descending (newest first)
      const sorted = [...bookingsData].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setBookings(sorted);
    } catch {
      setError('Failed to load booking archives.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (dateFrom && b.created_at < dateFrom) return false;
      if (dateTo && b.created_at.slice(0, 10) > dateTo) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const room = rooms[b.room_id];
        const matchName  = b.guest_name?.toLowerCase().includes(q);
        const matchPhone = b.phone_number?.toLowerCase().includes(q);
        const matchEmail = b.guest_email?.toLowerCase().includes(q);
        const matchRoom  = room?.name?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail && !matchRoom) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, dateFrom, dateTo, searchQuery, rooms]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // Build rows for export
  const buildExportRows = (data: BookingResponse[]) =>
    data.map(b => ({
      'Booking ID':    b.id,
      'Created At':    formatDateTime(b.created_at),
      'Guest Name':    b.guest_name,
      'Phone':         b.phone_number || '',
      'Email':         b.guest_email || '',
      'Room':          rooms[b.room_id]?.name || `Room #${b.room_id}`,
      'Check-in':      formatDateTime(b.start_date),
      'Check-out':     formatDateTime(b.end_date),
      'Nights':        Math.ceil((new Date(b.end_date).getTime() - new Date(b.start_date).getTime()) / 86400000),
      'Qty':           b.quantity,
      'Total (USD)':   Number(b.total_price),
      'Status':        b.status,
      'Source':        b.booking_source,
      'Notes':         b.notes || '',
    }));

  const exportToExcel = () => {
    const rows = buildExportRows(filtered);
    const ws = XLSX.utils.json_to_sheet(rows);

    // Column widths
    ws['!cols'] = [
      { wch: 10 }, { wch: 20 }, { wch: 22 }, { wch: 15 }, { wch: 26 },
      { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 7 }, { wch: 5 },
      { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 30 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Booking Archives');
    const now = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `homestay_bookings_${now}.xlsx`);
  };

  const exportToCSV = () => {
    const rows = buildExportRows(filtered);
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(h => {
        const val = String((row as Record<string, unknown>)[h] ?? '').replace(/"/g, '""');
        return `"${val}"`;
      }).join(',')),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `homestay_bookings_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{t('admin.archives.title')}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {filtered.length} record{filtered.length !== 1 && 's'} — full raw booking log
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                CSV
              </button>
              <button
                onClick={exportToExcel}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 rounded-md text-sm">{error}</div>}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search guest, phone, email, room..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked-in</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Date from */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Created from</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="w-full border border-gray-200 rounded-xl text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>

          {/* Date to */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Created to</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="w-full border border-gray-200 rounded-xl text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
        </div>

        {/* Clear filters button */}
        {(statusFilter !== 'all' || dateFrom || dateTo || searchQuery) && (
          <button
            onClick={() => { setStatusFilter('all'); setDateFrom(''); setDateTo(''); setSearchQuery(''); }}
            className="text-sm text-primary-600 hover:underline"
          >
            × Clear all filters
          </button>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['ID', 'Created', 'Guest', 'Phone', 'Room', 'Check-in', 'Check-out', 'Total', 'Status', 'Notes'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">#{b.id}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(b.created_at)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{b.guest_name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {b.phone_number ? (
                          <a href={`tel:${b.phone_number}`} className="text-primary-600 hover:underline">{b.phone_number}</a>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{rooms[b.room_id]?.name || `#${b.room_id}`}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDateTime(b.start_date)}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDateTime(b.end_date)}</td>
                      <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">{formatCurrency(b.total_price)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[b.status] || 'bg-gray-100 text-gray-600'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate text-xs" title={b.notes || ''}>
                        {b.notes || '—'}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                        No bookings match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer summary */}
            {filtered.length > 0 && (
              <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex flex-wrap gap-4 text-sm text-gray-600">
                <span><strong>{filtered.length}</strong> records</span>
                <span>Total Revenue: <strong className="text-emerald-700">
                  {formatCurrency(filtered.reduce((sum, b) => sum + Number(b.total_price), 0))}
                </strong></span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingArchives;

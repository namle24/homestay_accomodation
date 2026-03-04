import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { CheckCheck, Bell, ExternalLink, Inbox, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const navigate = useNavigate();

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleNotificationClick = (n: any) => {
    if (!n.is_read) markAsRead(n.id);
    if (n.booking_id) {
      navigate(`/my-bookings?highlight=${n.booking_id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <Bell className="text-primary-600" size={32} />
              Thông báo hệ thống
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Quản lý và xem lại tất cả các hoạt động đặt phòng mới.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all"
            >
              <CheckCheck className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="border-b border-gray-100 flex p-4 gap-4 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                filter === 'all' ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                filter === 'unread' ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Chưa đọc ({notifications.filter(n => !n.is_read).length})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                filter === 'read' ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Đã đọc ({notifications.filter(n => n.is_read).length})
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {filteredNotifications.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox size={40} className="text-gray-200" />
                </div>
                <p className="text-gray-500 font-medium">Không có thông báo nào trong mục này.</p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-6 cursor-pointer transition-all hover:bg-primary-50/30 flex gap-4 items-start ${
                    !n.is_read ? 'bg-blue-50/20' : ''
                  }`}
                >
                  <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${!n.is_read ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                    <MessageSquare size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-lg leading-snug ${!n.is_read ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                        {n.message}
                      </p>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                        {formatDate(n.created_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3">
                      {!n.is_read && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 text-primary-800">
                          Mới
                        </span>
                      )}
                      <span className="text-xs text-primary-600 font-bold flex items-center gap-1 hover:underline decoration-2">
                        Chi tiết booking <ExternalLink size={12} />
                      </span>
                    </div>
                  </div>
                  
                  {!n.is_read && (
                    <div className="w-2.5 h-2.5 bg-primary-600 rounded-full mt-2.5 shadow-sm shadow-primary-200 animate-pulse" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;

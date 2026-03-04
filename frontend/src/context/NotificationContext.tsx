import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notification } from '../types/notification';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lastNotifiedId, setLastNotifiedId] = useState<number | null>(null);
  const { user } = useAuth();
  
  const isStaff = user?.role === 'admin' || user?.role === 'receptionist';

  const addToast = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!isStaff) return;
    try {
      const data = await notificationService.getNotifications();
      
      // Throttling logic for new notifications
      if (data.length > 0) {
        // Find newest ID from the fetched data
        const newestId = Math.max(...data.map(n => n.id));
        
        if (lastNotifiedId !== null && newestId > lastNotifiedId) {
          const newItems = data.filter(n => n.id > lastNotifiedId);
          if (newItems.length > 0) {
            if (newItems.length === 1) {
              addToast(`Thông báo mới: ${newItems[0].message}`, 'info');
            } else {
              addToast(`Bạn có ${newItems.length} thông báo mới`, 'info');
            }
          }
        }
        setLastNotifiedId(newestId);
      }
      
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [isStaff, lastNotifiedId, addToast]);

  useEffect(() => {
    if (isStaff) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [isStaff, fetchNotifications]);

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      fetchNotifications, 
      markAsRead, 
      markAllAsRead,
      addToast
    }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`pointer-events-auto flex items-center p-4 rounded-lg shadow-xl border-l-4 animate-slide-in-right transform transition-all ${
              toast.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
              toast.type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' :
              'bg-blue-50 border-blue-500 text-blue-800'
            }`}
          >
            <div className="flex-shrink-0 mr-3">
              {toast.type === 'success' && <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
              {toast.type === 'info' && <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>}
            </div>
            <p className="text-sm font-bold">{toast.message}</p>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

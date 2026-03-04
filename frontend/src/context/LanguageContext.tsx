import React, { createContext, useContext, useState, useCallback } from 'react';

type Language = 'vi' | 'en';

type Translations = Record<string, string>;

const enTranslations: Translations = {
  // Navigation
  'nav.home': 'Home',
  'nav.rooms': 'Rooms',
  'nav.myBookings': 'My Bookings',
  'nav.staffTools': 'Staff Tools',
  'nav.dashboard': 'Dashboard',
  'nav.manageRooms': 'Manage Rooms',
  'nav.schedule': 'Schedule',
  'nav.archives': 'Archives',
  'nav.logout': 'Logout',
  'nav.login': 'Login',
  'nav.register': 'Register',

  // Home Page
  'home.hero.title': 'Experience Authentic Living',
  'home.hero.subtitle': 'Discover comfort, local culture, and unforgettable stays.',
  'home.hero.bookNow': 'Book Now',

  // Footer
  'footer.about': 'About Us',
  'footer.quickLinks': 'Quick Links',
  'footer.contact': 'Contact Us',

  // Common
  'common.search': 'Search',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.close': 'Close',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.status': 'Status',
  'common.price': 'Price',
  'common.total': 'Total',
  'common.night': 'night',
  'common.checkIn': 'Check-in',
  'common.checkOut': 'Check-out',
  'common.guest': 'Guest',
  'common.phone': 'Phone',
  'common.email': 'Email',
  'common.notes': 'Notes',

  // Booking Checkout
  'checkout.title': 'Complete Your Booking',
  'checkout.form.name': 'Full Name',
  'checkout.form.email': 'Email Address',
  'checkout.form.phone': 'Phone Number',
  'checkout.summary.title': 'Booking Summary',
  'checkout.summary.duration': 'Duration',
  'checkout.summary.nights': 'nights',
  'checkout.submit': 'Confirm Booking',

  // Admin Dashboard (Mostly requested in VN for admin)
  'admin.dashboard.title': 'Reception Dashboard',
  'admin.dashboard.refresh': 'Làm mới',
  'admin.dashboard.totalRooms': 'Tổng số phòng',
  'admin.dashboard.occupied': 'Đang có khách',
  'admin.dashboard.available': 'Phòng trống',
  'admin.dashboard.reserved': 'Khách sắp đến',
  'admin.dashboard.search': 'Tìm kiếm tên, SĐT, hoặc phòng...',
  'admin.dashboard.types.all': 'Tất cả',
  'admin.dashboard.types.private': 'Phòng Riêng',
  'admin.dashboard.types.dorm': 'Phòng Dorm',
  'admin.dashboard.checkoutBtn': 'Thanh toán nhanh',
  
  // Manage Rooms
  'admin.rooms.title': 'Quản lý phòng',
  'admin.rooms.add': 'Thêm phòng mới',
  'admin.rooms.edit': 'Sửa phòng',
  'admin.rooms.form.name': 'Tên phòng',
  'admin.rooms.form.type': 'Loại phòng',
  'admin.rooms.form.price': 'Giá mỗi đêm (VND)',
  'admin.rooms.form.units': 'Tổng số phòng/giường',
  'admin.rooms.form.amenities': 'Tiện nghi',

  // Archives / Schedule
  'admin.archives.title': 'Lưu trữ Booking',
  'admin.schedule.title': 'Lịch đặt phòng',
};

const viTranslations: Translations = {
  // Navigation
  'nav.home': 'Trang chủ',
  'nav.rooms': 'Danh sách phòng',
  'nav.myBookings': 'Booking của tôi',
  'nav.staffTools': 'Công cụ Lễ tân',
  'nav.dashboard': 'Bảng điều khiển',
  'nav.manageRooms': 'Quản lý phòng',
  'nav.schedule': 'Lịch đặt phòng',
  'nav.archives': 'Lưu trữ Booking',
  'nav.logout': 'Đăng xuất',
  'nav.login': 'Đăng nhập',
  'nav.register': 'Đăng ký',

  // Home Page
  'home.hero.title': 'Trải Nghiệm Cuộc Sống Đích Thực',
  'home.hero.subtitle': 'Khám phá sự thoải mái, văn hóa địa phương và những kỳ nghỉ khó quên.',
  'home.hero.bookNow': 'Đặt phòng ngay',

  // Footer
  'footer.about': 'Về chúng tôi',
  'footer.quickLinks': 'Liên kết nhanh',
  'footer.contact': 'Liên hệ',

  // Common
  'common.search': 'Tìm kiếm',
  'common.save': 'Lưu',
  'common.cancel': 'Hủy',
  'common.close': 'Đóng',
  'common.edit': 'Chỉnh sửa',
  'common.delete': 'Xóa',
  'common.status': 'Trạng thái',
  'common.price': 'Giá',
  'common.total': 'Tổng cộng',
  'common.night': 'đêm',
  'common.checkIn': 'Nhận phòng',
  'common.checkOut': 'Trả phòng',
  'common.guest': 'Khách hàng',
  'common.phone': 'Số điện thoại',
  'common.email': 'Email',
  'common.notes': 'Ghi chú',

  // Booking Checkout
  'checkout.title': 'Hoàn tất đặt phòng',
  'checkout.form.name': 'Họ và tên',
  'checkout.form.email': 'Địa chỉ Email',
  'checkout.form.phone': 'Số điện thoại',
  'checkout.summary.title': 'Tóm tắt đặt phòng',
  'checkout.summary.duration': 'Thời gian',
  'checkout.summary.nights': 'đêm',
  'checkout.submit': 'Xác nhận đặt phòng',

  // Admin Dashboard
  'admin.dashboard.title': 'Bảng Điều Khiển Lễ Tân',
  'admin.dashboard.refresh': 'Làm mới',
  'admin.dashboard.totalRooms': 'Tổng số phòng',
  'admin.dashboard.occupied': 'Đang có khách',
  'admin.dashboard.available': 'Phòng trống',
  'admin.dashboard.reserved': 'Khách sắp đến',
  'admin.dashboard.search': 'Tìm kiếm tên, SĐT, hoặc phòng...',
  'admin.dashboard.types.all': 'Tất cả',
  'admin.dashboard.types.private': 'Phòng Riêng',
  'admin.dashboard.types.dorm': 'Phòng Dorm',
  'admin.dashboard.checkoutBtn': 'Thanh toán nhanh',

  // Manage Rooms
  'admin.rooms.title': 'Quản lý phòng',
  'admin.rooms.add': 'Thêm phòng mới',
  'admin.rooms.edit': 'Sửa thông tin phòng',
  'admin.rooms.form.name': 'Tên phòng',
  'admin.rooms.form.type': 'Loại phòng',
  'admin.rooms.form.price': 'Giá mỗi đêm (VND)',
  'admin.rooms.form.units': 'Tổng số phòng/giường',
  'admin.rooms.form.amenities': 'Tiện nghi',

  // Archives / Schedule
  'admin.archives.title': 'Lưu trữ Booking',
  'admin.schedule.title': 'Lịch đặt phòng',
};

const translations = {
  vi: viTranslations,
  en: enTranslations,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to load saved language, default to 'vi' if not found
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    if (saved === 'vi' || saved === 'en') return saved;
    return 'vi'; // Default fallback
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  }, []);

  const t = (key: keyof Translations | string): string => {
    const currentTranslations = translations[language];
    // Fallback to English if translation is missing in Vietnamese, though we defined all
    return currentTranslations[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

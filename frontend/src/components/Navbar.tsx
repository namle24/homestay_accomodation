import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import NotificationBell from './NotificationBell';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdminOrReceptionist = user?.role === 'admin' || user?.role === 'receptionist';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-extrabold text-primary-600 tracking-tight">Homestay Suối Khoáng Minh Hằng</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/my-bookings"
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t('nav.myBookings')}
                </Link>

                {isAdminOrReceptionist && <NotificationBell />}

                {isAdminOrReceptionist && (
                  <>
                    {/* Dashboard quick-access button */}
                    <Link
                      to="/dashboard"
                      className="items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-md text-sm font-semibold transition-colors hidden sm:flex"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                      {t('nav.dashboard')}
                    </Link>

                    {/* Admin Tools dropdown */}
                    <div className="relative" onMouseLeave={() => setAdminMenuOpen(false)}>
                      <button
                        onMouseEnter={() => setAdminMenuOpen(true)}
                        onClick={() => setAdminMenuOpen(v => !v)}
                        className="flex items-center gap-1 text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        {t('nav.staffTools')}
                        <svg className={`w-4 h-4 transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {adminMenuOpen && (
                        <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                          {[
                            { to: '/manage-rooms', label: t('nav.manageRooms'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                            { to: '/schedule', label: t('nav.schedule'), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                            { to: '/archives', label: t('nav.archives'), icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                          ].map(item => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setAdminMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                            >
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                              </svg>
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="hidden sm:flex items-center ml-2 border-l border-gray-200 pl-4 gap-3">
                  <span className="text-sm font-semibold text-gray-700 hidden md:block">{user?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>

                {/* Mobile logout */}
                <button
                  onClick={handleLogout}
                  className="sm:hidden text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('nav.register')}
                </Link>
              </>
            )}

            {/* Language Switch */}
            <div className="relative border-l border-gray-200 pl-4 py-1" onMouseLeave={() => setLangMenuOpen(false)}>
              <button
                onMouseEnter={() => setLangMenuOpen(true)}
                onClick={() => setLangMenuOpen(v => !v)}
                className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary-200 bg-primary-50 text-primary-700 font-bold text-xs uppercase hover:bg-primary-100 transition-colors"
              >
                {language}
              </button>
              
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 overflow-hidden">
                  <button
                    onClick={() => { setLanguage('vi'); setLangMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm ${language === 'vi' ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    Tiếng Việt
                  </button>
                  <button
                    onClick={() => { setLanguage('en'); setLangMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    English
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

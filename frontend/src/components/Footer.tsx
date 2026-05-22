import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          <div className="space-y-4">
            <h3 className="text-white text-xl font-bold tracking-tight">
              <span className="text-primary-400">Lehona</span>
            </h3>
            <p className="text-sm leading-relaxed">
              {t('footer.aboutText')}
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">{t('nav.home')}</Link></li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    window.location.hash = 'search-section';
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('nav.rooms')}
                </button>
              </li>
              <li><Link to="/my-bookings" className="hover:text-white transition-colors">{t('nav.myBookings')}</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>
            &copy; {currentYear} Lehona. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

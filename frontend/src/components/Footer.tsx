import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  Facebook, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink 
} from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-white text-xl font-bold tracking-tight">
              Homestay <span className="text-primary-400">Suối Khoáng Minh Hằng</span>
            </h3>
            <p className="text-sm leading-relaxed">
              {t('footer.aboutText')}
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://www.facebook.com/profile.php?id=61565515635546" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">{t('nav.home')}</Link></li>
              <li><button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); window.location.hash = 'search-section'; }} className="hover:text-white transition-colors text-left">{t('nav.rooms')}</button></li>
              <li><Link to="/my-bookings" className="hover:text-white transition-colors">{t('nav.myBookings')}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">
              {t('footer.contact')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <MapPin size={18} className="mr-3 text-primary-400 shrink-0" />
                  <span>{t('footer.address')}</span>
                </div>
                <div className="flex items-center">
                  <Phone size={18} className="mr-3 text-primary-400 shrink-0" />
                  <span>{t('footer.phone')}</span>
                </div>
                <div className="flex items-center">
                  <Mail size={18} className="mr-3 text-primary-400 shrink-0" />
                  <span>{t('footer.email')}</span>
                </div>
              </div>
              
              <div className="flex flex-col justify-start">
                <a 
                  href="https://www.google.com/maps/place/Homestay+Su%E1%BB%91i+Kho%C3%A1ng+Minh+H%E1%BA%B1ng/@21.5717046,104.5707705,17z/data=!3m1!4b1!4m6!3m5!1s0xadb0b00763a5bd31:0xcea855af41813960!8m2!3d21.5717046!4d104.5707705!16s%2Fg%2F11kq681gfj?entry=ttu" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-xl transition-all border border-gray-700 group w-fit"
                >
                  <span className="mr-2">{t('footer.viewMap')}</span>
                  <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>
            &copy; {currentYear} Homestay Suối Khoáng Nóng Minh Hằng. All rights reserved.
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

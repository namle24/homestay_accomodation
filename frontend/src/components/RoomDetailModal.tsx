import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AvailableRoom } from '../types/room';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/formatters';

interface RoomDetailModalProps {
  room: AvailableRoom;
  checkIn?: string;
  checkOut?: string;
  onClose: () => void;
}

const RoomDetailModal: React.FC<RoomDetailModalProps> = ({ room, checkIn, checkOut, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    'https://images.unsplash.com/photo-1590392848650-0639d677864c?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?auto=format&fit=crop&q=80&w=1200'
  ];

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    let queryParams = '';
    if (checkIn && checkOut) {
      queryParams = `?checkIn=${checkIn}&checkOut=${checkOut}`;
    }
    navigate(`/book/${room.room_id}${queryParams}`);
  };

  const amenityIcons: Record<string, React.ReactNode> = {
    'Wifi': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
    'Air Conditioning': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    'Shower': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4a2 2 0 012 2v1h10V6a2 2 0 012-2h2v16h-2a2 2 0 01-2-2V9H6v9a2 2 0 01-2 2H2V4h2z" />
      </svg>
    ),
    'Kitchen': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    'TV': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    'Parking': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    'Pool': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 16.5v-3.5a1.5 1.5 0 00-1.5-1.5H19a1.5 1.5 0 00-1.5 1.5v3.5M3 16.5v-3.5a1.5 1.5 0 011.5-1.5H5a1.5 1.5 0 011.5 1.5v3.5M7 10h10M7 6h10" />
      </svg>
    )
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Slideshow */}
        <div className="relative h-64 sm:h-80 lg:h-96 w-full group">
          <img 
            src={images[currentImageIndex]} 
            alt={room.room_name} 
            className="w-full h-full object-cover transition-opacity duration-500" 
          />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
            </svg>
          </button>

          {/* Slideshow Controls */}
          <div className="absolute inset-y-0 left-0 flex items-center px-4">
             <button 
              onClick={() => setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
              className="bg-white/30 hover:bg-white/50 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
             >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
             </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center px-4">
             <button 
              onClick={() => setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
              className="bg-white/30 hover:bg-white/50 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
             >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
             </button>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 w-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
              ></div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${room.room_type === 'private' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {room.room_type} ROOM
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm font-medium text-gray-500">
                  {room.available_units} units available
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900">{room.room_name}</h2>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About this room
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {room.description || 'This room offers a comfortable and serene environment, perfect for relaxing after a long day of exploring. Experience premium hospitality and top-notch facilities designed for your comfort.'}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-900">What this room offers</h4>
              <div className="grid grid-cols-2 gap-4">
                {(room.amenities && room.amenities.length > 0) ? room.amenities.map(amenity => (
                  <div key={amenity} className="flex items-center text-gray-600">
                    <div className="p-2 bg-gray-100 rounded-lg mr-3 text-primary-600">
                      {amenityIcons[amenity] || (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">{amenity}</span>
                  </div>
                )) : (
                  <p className="text-sm text-gray-400 italic col-span-2">No specific amenities listed.</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
             <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 sticky top-0">
                <div className="mb-6">
                  <p className="text-sm text-gray-500">Starting from</p>
                  <p className="text-4xl font-black text-primary-600">
                    {formatCurrency(room.base_price)}
                    <span className="text-sm font-normal text-gray-500"> /night</span>
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Best price guaranteed
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Free cancellation (24h)
                  </div>
                </div>

                <button 
                  onClick={handleBookNow}
                  disabled={room.available_units <= 0}
                  className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {room.available_units <= 0 ? 'Fully Booked' : 'Book Your Stay Now'}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailModal;

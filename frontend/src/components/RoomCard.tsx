import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AvailableRoom } from '../types/room';
import { useAuth } from '../contexts/AuthContext';

interface RoomCardProps {
  room: AvailableRoom;
  checkIn?: string;
  checkOut?: string;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, checkIn, checkOut }) => {
  const isDorm = room.room_type === 'dorm';
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const formatPrice = (priceStr: string) => {
    const price = parseFloat(priceStr);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Navigate with query parameters
    let queryParams = '';
    if (checkIn && checkOut) {
      queryParams = `?checkIn=${checkIn}&checkOut=${checkOut}`;
    }
    navigate(`/book/${room.room_id}${queryParams}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      {/* Placeholder image area */}
      <div className="h-48 bg-gray-200 relative">
        <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded text-xs font-semibold text-gray-700 uppercase tracking-wide shadow-sm">
          {room.room_type}
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
          {room.room_name}
        </h3>
        
        <div className="flex justify-between items-end mt-auto pt-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">
              Available 
              <span className={`ml-1 font-semibold ${room.available_units > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {room.available_units} {isDorm ? 'beds' : 'rooms'}
              </span>
            </p>
            <p className="text-2xl font-bold text-primary-600">
              {formatPrice(room.base_price)}
              <span className="text-sm font-normal text-gray-500"> /night</span>
            </p>
          </div>
          
          <button
            onClick={handleBookNow}
            disabled={room.available_units <= 0}
            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {room.available_units <= 0 ? 'Sold Out' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;

import React, { useState } from 'react';
import { AvailableRoom } from '../types/room';
import RoomDetailModal from './RoomDetailModal';

interface RoomCardProps {
  room: AvailableRoom;
  checkIn?: string;
  checkOut?: string;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, checkIn, checkOut }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const formatPrice = (priceStr: string) => {
    const price = parseFloat(priceStr);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full cursor-pointer transform hover:-translate-y-1"
      >
        {/* Placeholder image area */}
        <div className="h-56 bg-gray-200 relative overflow-hidden">
          <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-gray-700 uppercase tracking-widest shadow-sm">
            {room.room_type}
          </div>
          <img 
            src="https://images.unsplash.com/photo-1590392848650-0639d677864c?auto=format&fit=crop&q=80&w=800" 
            alt={room.room_name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
              {room.room_name}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2">
              {room.description || 'Experience ultimate comfort and tranquility in our specially designed space.'}
            </p>
          </div>
          
          <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter mb-1">
                Starting from
              </p>
              <p className="text-2xl font-black text-primary-600">
                {formatPrice(room.base_price)}
                <span className="text-sm font-normal text-gray-400 italic"> /n</span>
              </p>
            </div>
            
            <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${room.available_units > 0 ? 'bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white' : 'bg-red-50 text-red-400'}`}>
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
               </svg>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <RoomDetailModal 
          room={room} 
          checkIn={checkIn} 
          checkOut={checkOut} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};

export default RoomCard;

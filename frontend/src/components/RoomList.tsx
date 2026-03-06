import React from 'react';
import RoomCard from './RoomCard';
import { AvailableRoom } from '../types/room';

export interface RoomListProps {
  rooms: AvailableRoom[];
  checkIn?: string;
  checkOut?: string;
}

const RoomList: React.FC<RoomListProps> = ({ rooms, checkIn, checkOut }) => {
  if (rooms.length === 0) {
    return (
      <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Rất tiếc, không còn phòng trống</h3>
        <p className="mt-1 text-sm text-gray-500">
          Không tìm thấy phòng trống trong giai đoạn này. Vui lòng chọn ngày khác.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <RoomCard key={room.room_id || room.id} room={room} checkIn={checkIn} checkOut={checkOut} />
      ))}
    </div>
  );
};

export default RoomList;

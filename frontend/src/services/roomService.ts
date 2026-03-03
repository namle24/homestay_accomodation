import api from './api';
import { AvailableRoom, Room } from '../types/room';

export const roomService = {
  checkAvailability: async (checkIn: string, checkOut: string): Promise<AvailableRoom[]> => {
    // API GET /availability?check_in=...&check_out=...
    const response = await api.get<{rooms: AvailableRoom[]}>('/availability/', {
      params: {
        check_in: checkIn,
        check_out: checkOut,
      },
    });
    return response.data.rooms;
  },

  getRoomById: async (roomId: string): Promise<Room> => {
    const response = await api.get<Room>(`/rooms/${roomId}`);
    return response.data;
  },

  getRooms: async (): Promise<Room[]> => {
    const response = await api.get<Room[]>('/rooms/');
    return response.data;
  },

  createRoom: async (data: any): Promise<Room> => {
    const response = await api.post<Room>('/rooms/', data);
    return response.data;
  },

  updateRoom: async (roomId: number, data: any): Promise<Room> => {
    const response = await api.put<Room>(`/rooms/${roomId}`, data);
    return response.data;
  },

  deleteRoom: async (roomId: number): Promise<void> => {
    await api.delete(`/rooms/${roomId}`);
  },
};

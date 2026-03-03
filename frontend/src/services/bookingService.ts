import api from './api';
import { BookingCreate, BookingResponse } from '../types/booking';

export const bookingService = {
  createBooking: async (data: BookingCreate): Promise<BookingResponse> => {
    const response = await api.post<BookingResponse>('/bookings/', data);
    return response.data;
  },

  getBookings: async (): Promise<BookingResponse[]> => {
    const response = await api.get<BookingResponse[]>('/bookings/');
    return response.data;
  },

  updateBookingStatus: async (bookingId: number, status: string): Promise<BookingResponse> => {
    const response = await api.patch<BookingResponse>(`/bookings/${bookingId}/status`, { status });
    return response.data;
  },
};

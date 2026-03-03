export interface BookingCreate {
  room_id: number;
  guest_name: string;
  guest_email?: string;
  phone_number: string;
  start_date: string; // ISO format string (YYYY-MM-DD)
  end_date: string;
  quantity: number;
  notes?: string;
  status?: string; // Admin can specify status (e.g., 'confirmed')
}


export interface BookingResponse {
  id: number;
  room_id: number;
  user_id?: number;
  guest_name: string;
  guest_email?: string;
  phone_number: string;
  start_date: string;
  end_date: string;
  quantity: number;
  status: string;
  booking_source: string;
  total_price: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

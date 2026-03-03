export interface BookingCreate {
  room_id: number;
  guest_name: string;
  guest_email?: string;
  start_date: string; // ISO format string (YYYY-MM-DD)
  end_date: string;
  quantity: number;
}


export interface BookingResponse {
  id: number;
  room_id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  quantity: number;
  total_price: string;
  status: string;
  created_at: string;
}

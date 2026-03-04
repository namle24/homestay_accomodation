export interface Notification {
  id: number;
  message: string;
  type: string;
  is_read: boolean;
  booking_id: number | null;
  created_at: string;
}

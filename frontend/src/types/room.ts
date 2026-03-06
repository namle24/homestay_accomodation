export interface Room {
  id: number;
  name: string;
  room_type: string;
  total_units: number;
  base_price: string;
  description?: string;
  amenities?: string[];
  status: 'available' | 'cleaning' | 'maintenance';
}

export interface AvailableRoom extends Room {
  room_id: number;
  room_name: string;
  available_units: number;
}

export interface RoomCreate {
  name: string;
  room_type: 'private' | 'dorm';
  total_units: number;
  base_price: string;
  description?: string;
  amenities?: string[];
  status?: 'available' | 'cleaning' | 'maintenance';
}

export interface RoomUpdate {
  name?: string;
  room_type?: 'private' | 'dorm';
  total_units?: number;
  base_price?: string;
  description?: string;
  amenities?: string[];
  status?: 'available' | 'cleaning' | 'maintenance';
}

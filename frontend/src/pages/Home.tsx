import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import RoomList from '../components/RoomList';
import { roomService } from '../services/roomService';
import { AvailableRoom } from '../types/room';

const Home: React.FC = () => {
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Set default dates: checkIn = today, checkOut = tomorrow
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const defaultCheckIn = today.toISOString().split('T')[0];
  const defaultCheckOut = tomorrow.toISOString().split('T')[0];

  const handleSearch = async (checkIn: string, checkOut: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await roomService.checkAvailability(checkIn, checkOut);
      setRooms(data);
    } catch (err: any) {
      console.error('Error fetching availability:', err);
      setError('Failed to fetch room availability. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically fetch Default Availability on initial load
  useEffect(() => {
    handleSearch(defaultCheckIn, defaultCheckOut);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      <main>
        {/* Search Section */}
        <section className="bg-primary-700 pb-16 pt-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-base font-semibold text-primary-200 tracking-wide uppercase">
              Find Your Perfect Stay
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
              Experience comfort like never before
            </p>
          </div>
          <SearchBar 
            onSearch={handleSearch} 
            isLoading={isLoading} 
            defaultCheckIn={defaultCheckIn}
            defaultCheckOut={defaultCheckOut}
          />
        </section>

        {/* Results Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Available Rooms</h3>
            <p className="text-sm text-gray-500 mt-1">Select a room to proceed with your booking.</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <RoomList rooms={rooms} checkIn={defaultCheckIn} checkOut={defaultCheckOut} />
          )}
        </section>
      </main>
      
      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-center">
          <p className="text-sm text-gray-500 text-center">
            &copy; 2026 Homestay Oasis. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

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
  
  const defaultCheckIn = today.toISOString().slice(0, 16);
  const defaultCheckOut = tomorrow.toISOString().slice(0, 16);

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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000" 
            alt="Homestay Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
            Welcome to <span className="text-primary-400">Homestay Oasis</span>
          </h1>
          <p className="mt-6 text-xl text-gray-100 max-w-2xl mx-auto drop-shadow-sm">
            Discover a perfect blend of comfort and tranquility. Your peaceful escape in the heart of nature awaits.
          </p>
          <div className="mt-10">
            <button 
              onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 bg-primary-600 text-white rounded-full font-bold hover:bg-primary-700 transition-all transform hover:scale-105 shadow-xl"
            >
              Explore Rooms
            </button>
          </div>
        </div>
      </div>

      <div id="search-section" className="relative z-20 -mt-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Find Your Perfect Stay</h2>
          <SearchBar onSearch={handleSearch} defaultCheckIn={defaultCheckIn} defaultCheckOut={defaultCheckOut} isLoading={isLoading} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-500 animate-pulse">Checking availability...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : (
          <div className="space-y-24">
            {/* Gallery Section */}
            <section className="animate-fade-in">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">Experience Our Activities</h2>
                <div className="h-1 w-20 bg-primary-600 mx-auto mt-4 rounded-full"></div>
                <p className="mt-4 text-gray-600">Life at Homestay Oasis is filled with authentic experiences.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Morning Yoga', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800' },
                  { title: 'Local Cuisine', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800' },
                  { title: 'Evening Bonfire', img: 'https://images.unsplash.com/photo-1521289133484-90279e063fc2?auto=format&fit=crop&q=80&w=800' },
                  { title: 'Guided Treks', img: 'https://images.unsplash.com/photo-1551632432-c735e97994cb?auto=format&fit=crop&q=80&w=800' },
                ].map((item, idx) => (
                  <div key={idx} className="group relative h-64 overflow-hidden rounded-xl shadow-lg cursor-pointer">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                      <span className="text-white font-bold text-lg">{item.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Room Listing Section */}
            <section>
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Available Rooms</h2>
                  <p className="text-gray-500 mt-2">Showing results for your selected dates.</p>
                </div>
                <div className="hidden sm:block text-primary-600 font-bold border-b-2 border-primary-600">
                  {rooms.length} rooms found
                </div>
              </div>
              <RoomList rooms={rooms} />
            </section>

            {/* About Us Section */}
            <section className="bg-primary-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 rounded-3xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Our Story & Style</h2>
                  <p className="text-lg text-gray-600 leading-relaxed italic">
                    "At Homestay Oasis, we believe travel should be personal, comfortable, and deeply connected to the surroundings."
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Founded in 2024, our sanctuary was designed to provide a home-away-from-home for travelers seeking modern luxury wrapped in traditional hospitality. From our locally-sourced breakfast to our hand-crafted interiors, every detail is curated to ensure your stay is unforgettable.
                  </p>
                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div>
                      <h4 className="font-bold text-primary-700 text-2xl">5.0 ★</h4>
                      <p className="text-sm text-gray-500">Guest Rating</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-primary-700 text-2xl">24/7</h4>
                      <p className="text-sm text-gray-500">Concierge Support</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1200" 
                    alt="Homestay Interior" 
                  />
                </div>
              </div>
            </section>
          </div>
        )}
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

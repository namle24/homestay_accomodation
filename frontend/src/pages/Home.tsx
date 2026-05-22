import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import RoomList from '../components/RoomList';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { roomService } from '../services/roomService';
import { AvailableRoom } from '../types/room';

const Home: React.FC = () => {
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentAboutImageIndex, setCurrentAboutImageIndex] = useState(0);

  const ABOUT_IMAGES = [
    '/images/about/story.png',
    '/images/about/story2.png',
    '/images/about/story3.png'
  ];
  
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
      // Standardize check-out time to 12:00:00 if only date is provided
      const finalCheckOut = checkOut.includes('T') ? checkOut : `${checkOut}T12:00:00`;
      
      const data = await roomService.checkAvailability(checkIn, finalCheckOut);
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

  // Slideshow effect for "Our Story" section
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAboutImageIndex((prev) => (prev + 1) % ABOUT_IMAGES.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, [ABOUT_IMAGES.length, currentAboutImageIndex]); // Reset timer on manual change

  const nextAboutImage = () => {
    setCurrentAboutImageIndex((prev) => (prev + 1) % ABOUT_IMAGES.length);
  };

  const prevAboutImage = () => {
    setCurrentAboutImageIndex((prev) => (prev - 1 + ABOUT_IMAGES.length) % ABOUT_IMAGES.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero/banner.png" 
            alt="Lehona homestay" 
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight drop-shadow-2xl">
            Welcome to <br/>
            <span className="text-primary-400">Lehona</span>
          </h1>
          <p className="mt-8 text-xl text-gray-100 max-w-3xl mx-auto drop-shadow-lg font-medium">
            Experience the healing power of natural thermal waters. Your sanctuary for wellness and peace.
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
                <div className="h-1.5 w-24 bg-primary-600 mx-auto mt-4 rounded-full"></div>
                <p className="mt-4 text-gray-600">Unwind in our natural hot springs and explore the surrounding landscape.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Natural Hot Springs', img: '/images/activities/hot-spring.png', desc: 'Relax in mineral-rich waters.' },
                  { title: 'Deluxe Comfort', img: '/images/activities/comfort.png', desc: 'Wake up to misty mountain views.' },
                  { title: 'Local Culture', img: '/images/activities/culture.png', desc: 'Explore local traditions and scenery.' },
                ].map((item, idx) => (
                  <div key={idx} className="group relative h-64 overflow-hidden rounded-xl shadow-lg cursor-pointer">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                      <span className="text-white font-bold text-xl">{item.title}</span>
                      <span className="text-gray-300 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.desc}</span>
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
              <RoomList rooms={rooms || []} />
            </section>

            {/* About Us Section */}
            <section className="bg-primary-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 rounded-3xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Our Story & Style</h2>
                  <p className="text-lg text-gray-600 leading-relaxed italic border-l-4 border-primary-500 pl-4">
                    "At Lehona, we believe travel should be personal, comfortable, and deeply connected to the natural healing energy of our land."
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Our homestay was designed as a luxury retreat focused on wellness and tradition. Natural hot spring pools are the heart of the experience, offering rejuvenation for both body and soul.
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
                <div className="relative rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02] aspect-[4/3] group">
                  {ABOUT_IMAGES.map((img, index) => (
                    <img 
                      key={img}
                      src={img} 
                      alt={`Lehona story ${index + 1}`} 
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                        index === currentAboutImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ))}
                  
                  {/* Manual Controls */}
                  <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={prevAboutImage}
                      className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={nextAboutImage}
                      className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>

                  {/* Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {ABOUT_IMAGES.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentAboutImageIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          index === currentAboutImageIndex 
                            ? 'bg-white w-6' 
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;

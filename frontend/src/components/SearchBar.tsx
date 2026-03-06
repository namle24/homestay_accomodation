import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (checkIn: string, checkOut: string) => void;
  isLoading: boolean;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  isLoading, 
  defaultCheckIn = '', 
  defaultCheckOut = '' 
}) => {
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);

  // Calculate today's date and time for the 'min' attribute
  const today = new Date().toISOString().slice(0, 16);

  // Calculate min checkout date based on selected checkin
  const [minCheckOut, setMinCheckOut] = useState('');

  useEffect(() => {
    if (checkIn) {
      const inDate = new Date(checkIn);
      inDate.setDate(inDate.getDate() + 1); // Checkout must be at least 1 day after checkin
      setMinCheckOut(inDate.toISOString().slice(0, 16));
      
      // If current checkout is invalid, reset it
      if (checkOut && new Date(checkOut) <= new Date(checkIn)) {
        setCheckOut(inDate.toISOString().slice(0, 16));
      }
    } else {
      setMinCheckOut(today);
    }
  }, [checkIn, checkOut, today]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkIn && checkOut) {
      onSearch(checkIn, checkOut);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4 mt-6">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label htmlFor="check_in" className="block text-sm font-medium text-gray-700 mb-1">
            Check-in Date & Time
          </label>
          <input
            type="datetime-local"
            id="check_in"
            required
            min={today}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div className="flex-1 w-full">
          <label htmlFor="check_out" className="block text-sm font-medium text-gray-700 mb-1">
            Check-out Date
          </label>
          <input
            type="date"
            id="check_out"
            required
            min={minCheckOut.split('T')[0] || today.split('T')[0]}
            value={checkOut.split('T')[0]}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div className="w-full md:w-auto mt-4 md:mt-0">
          <button
            type="submit"
            disabled={isLoading || !checkIn || !checkOut}
            className="w-full md:w-auto flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 h-[42px]"
          >
            {isLoading ? (
              <span className="animate-pulse">Searching...</span>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Search
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;

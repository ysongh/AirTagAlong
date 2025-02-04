import React from 'react';
import { Calendar, Plane, MapPin, Ticket } from 'lucide-react';

const TravelForm = () => {
  const airports = [
    { code: 'JFK', name: 'John F. Kennedy International' },
    { code: 'LAX', name: 'Los Angeles International' },
    { code: 'ORD', name: 'O\'Hare International' },
    { code: 'LHR', name: 'London Heathrow' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg p-6 mt-10">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Post Plan</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Ticket className="w-4 h-4 mr-2" />
            Event Name
          </label>
          <input
            type="text"
            placeholder="Concert, Sports Game, Conference, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 mr-2" />
            Travel Date
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Plane className="w-4 h-4 mr-2" />
            Departure Airport
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select an airport</option>
            {airports.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {airport.code} - {airport.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 mr-2" />
            Destination
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select an airport</option>
            {airports.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {airport.code} - {airport.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Share any additional details about your travel plans..."
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default TravelForm;
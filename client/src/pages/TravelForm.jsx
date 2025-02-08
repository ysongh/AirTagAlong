import React, { useState } from 'react';
import { Calendar, Plane, MapPin, Ticket } from 'lucide-react';

import Spinner from '../components/Spinner';

const TravelForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setmsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setmsg("")

    const formData = {
      event_name: e.target.event_name.value,
      travel_date: e.target.travel_date.value,
      departure_airport: e.target.departure_airport.value,
      destination: e.target.destination.value,
      additional_note:  e.target.additional_note.value,
    };

    try {
      const response = await fetch('http://localhost:4000/storedata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsLoading(false);
      setmsg("Post succesful")
    } catch (error) {
      console.error(error.message);
      setmsg("Something went wrong")
    } finally {
      setIsLoading(false);
    }
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
            id="event_name"
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
            id="travel_date"
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
          <input
            id="departure_airport"
            type="text"
            placeholder="Enter airport code or name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 mr-2" />
            Destination
          </label>
          <input
            id="destination"
            type="text"
            placeholder="Enter destination airport code or name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            id="additional_note"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Share any additional details about your travel plans..."
          />
        </div>

       <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Spinner />
              <span className="ml-2">Searching...</span>
            </>
          ) : (
            'Post'
          )}
        </button>

        <p>{msg}</p>
      </form>
    </div>
  );
};

export default TravelForm;
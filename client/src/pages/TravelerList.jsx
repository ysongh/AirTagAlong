import { useEffect, useState } from 'react';
import { Plane, Calendar, Mail, MessageCircle } from 'lucide-react';

const TravelerList = () => {
  const [travelers, setTravelers] = useState([]);

  useEffect(() => {
    getTravelList();
  }, [])
  
  const getTravelList = async () => {
    try {
      const response = await fetch('http://localhost:4000/readdata');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result.decryptedCollectionData);
      setTravelers(result.decryptedCollectionData);
      // setData(result);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Travelers List</h1>
      </div>

      <div className="space-y-4">
        {travelers.map((traveler) => (
          <div 
            key={traveler.id}
            className="bg-white rounded-lg shadow p-6 transition-transform hover:scale-[1.01]"
          >
            <div className="flex items-start gap-4">  
              {/* Traveler Details */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{traveler.name}</h3>
                
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {traveler.travel_date}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Plane className="w-4 h-4 mr-2" />
                    {traveler.departure_airport} → {traveler.destination}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{traveler.notes}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>Message</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {travelers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No traveler yet...</p>
        </div>
      )}
    </div>
  );
};

export default TravelerList;
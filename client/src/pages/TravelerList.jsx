import { useEffect, useState } from 'react';
import { Plane, Calendar, Mail, MessageCircle, Loader, Send, DoorOpen } from 'lucide-react';

const TravelerList = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const handlePromptSubmit = async () => {
    try {

      setIsLoading(true);
      const response = await fetch('http://localhost:4000/getmatchingtraveler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result.data);
      console.log(JSON.parse(result.data));
      let array = result.data.replace(/`/g, '');
      setTravelers(JSON.parse(array));
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Travelers List</h1>
      </div>

      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ask AI for Travel Buddy Recommendations</h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Find someone goes to EthGlobal hackathon"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handlePromptSubmit}
              disabled={isLoading || !prompt}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
            >
              {isLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Ask AI
            </button>
          </div>
          
        </div>
      </div>

      <div className="space-y-4">
        {travelers.map((traveler) => (
          <div 
            key={traveler._id}
            className="bg-white rounded-lg shadow p-6 transition-transform hover:scale-[1.01]"
          >
            <div className="flex items-start gap-4">  
              {/* Traveler Details */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{traveler.event_name}</h3>
                
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {traveler.travel_date}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Plane className="w-4 h-4 mr-2" />
                    {traveler.departure_airport} → {traveler.destination}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DoorOpen className="w-4 h-4 mr-2" />
                    Gate Number: {traveler.gate_number}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{traveler.additional_note}</p>
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
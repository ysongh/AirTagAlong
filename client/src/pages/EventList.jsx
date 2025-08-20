import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';

const EventList = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);

   useEffect(() => {
    getEvents();
  }, [])
  
  const getEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVERURL}/allevents`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result.events);
      setEvents(result.events);
      // setData(result);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Upcoming Travel Events</h1>
        <p className="text-gray-600 mt-2">Find travel companions for your next journey</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          All Events
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          This Month
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          Popular
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          Business
        </button>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center text-blue-600 mb-4">
                <Calendar className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {event.event_name}
                </span>
              </div>


              <div className="flex items-center text-gray-600">
                <Users className="w-5 h-5 mr-2" />
                <span>{event.travelers} travelers</span>
              </div>

              <button
                className="w-full cursor-pointer mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => navigate(`/eventwithtravelerlist/${event.event_name}`)}
              >
                View Details
              </button>
            </div>
          ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No travel events found.</p>
          <p className="text-gray-400">Be the first to create a travel event!</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default EventList;
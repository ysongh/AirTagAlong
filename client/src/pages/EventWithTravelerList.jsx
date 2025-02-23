import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plane, Calendar, Mail, MessageCircle, DoorOpen, ChevronLeft, ChevronRight } from 'lucide-react';

const EventWithTravelerList = () => {
  const { eventname } = useParams();
  const [travelers, setTravelers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 3;

  const totalPages = Math.ceil(travelers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResults = travelers.slice(startIndex, endIndex);

  useEffect(() => {
    getTravelList();
  }, [])
  
  const getTravelList = async () => {
    try {
      const response = await fetch(`http://localhost:4000/getalltravelersbyeventname/${eventname}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setTravelers(result.travelers);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Travelers going to {eventname}</h1>
      </div>

      <div className="space-y-4">
        {currentResults.map((traveler) => (
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

      {travelers.length / totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border enabled:hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {getPageNumbers().map((pageNum, index) => (
            <button
              key={index}
              onClick={() => typeof pageNum === 'number' ? handlePageChange(pageNum) : null}
              disabled={pageNum === '...'}
              className={`px-4 py-2 rounded-md ${
                pageNum === currentPage
                  ? 'bg-blue-600 text-white'
                  : pageNum === '...'
                  ? ''
                  : 'hover:bg-gray-100'
              }`}
            >
              {pageNum}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border enabled:hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {travelers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No traveler yet...</p>
        </div>
      )}
    </div>
  );
};

export default EventWithTravelerList;
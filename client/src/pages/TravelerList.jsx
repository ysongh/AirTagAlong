import { useEffect, useState } from 'react';
import { Loader, Send, ChevronLeft, ChevronRight } from 'lucide-react';

import TravelerCard from '../components/TravelerCard';
import config from '../config';

const TravelerList = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      const response = await fetch(`${config.serverUrl}/travellist/${config.collectionId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);
      setTravelers(result.data);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handlePromptSubmit = async () => {
    try {

      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_SERVERURL}/getmatchingtraveler`, {
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
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Search for Travelers</h1>
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
        {currentResults.map((traveler) => (
          <div 
            key={traveler.data._id}
            className="bg-white rounded-lg shadow p-6 transition-transform hover:scale-[1.01]"
          >
            <TravelerCard traveler={traveler.data} />
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

export default TravelerList;
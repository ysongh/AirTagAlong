import { Plane, Calendar, Mail, MessageCircle, DoorOpen } from 'lucide-react';

function TravelerCard({ traveler }) {
  return (
    <div className="flex items-start gap-4">  
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
  )
}

export default TravelerCard;
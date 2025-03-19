import { Plane, Calendar, DoorOpen } from 'lucide-react';

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
    </div>
  )
}

export default TravelerCard;
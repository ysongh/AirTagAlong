import React, { useState } from 'react';
import { Calendar, Plane, MapPin, Ticket, DoorOpen, User, ArrowRight, ArrowLeft } from 'lucide-react';

import Spinner from '../components/Spinner';
import ProgressBar from '../components/travelform/ProgressBar';

const totalSteps = 3;

const TravelForm = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setmsg] = useState("");
  const [formData, setFormData] = useState({
    event_name: '',
    travel_date: '',
    departure_airport: '',
    destination: '',
    gate_number: '',
    additional_note: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value)
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setmsg("")

    console.log(formData)

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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">Personal Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Ticket className="w-4 h-4 mr-2" />
                Event Name
              </label>
              <input
                type="text"
                name="event_name"
                value={formData.event_name}
                onChange={handleInputChange}
                placeholder="Concert, Sports Game, Conference, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">Travel Details</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Travel Date
                </label>
                <input
                  type="date"
                  name="travel_date"
                  value={formData.travel_date}
                  onChange={handleInputChange}
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
                  type="text"
                  name="departure_airport"
                  value={formData.departure_airport}
                  onChange={handleInputChange}
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
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="Enter destination airport code or name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <DoorOpen className="w-4 h-4 mr-2" />
                  Gate Number
                </label>
                <input
                  name="gate_number"
                  type="text"
                  value={formData.gate_number}
                  onChange={handleInputChange}
                  placeholder="Enter gate number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">Additional Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Notes
                </label>
                <textarea
                  name="additional_note"
                  value={formData.additional_note}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                  placeholder="Share any additional details about your travel plans..."
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg p-6 mt-10">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Post Plan</h2>
      </div>

      <ProgressBar step={step} />

      <div className="space-y-6">
        {renderStep()}

        <div className="flex justify-between space-x-4 mt-8">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          )}
          
          {step < totalSteps ? (
            <button
              onClick={handleNext}
              className="flex items-center ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center ml-auto px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  <span className="ml-2">Submitting...</span>
                </>
              ) : (
                'Submit'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelForm;
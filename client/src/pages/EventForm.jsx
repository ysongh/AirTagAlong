import React, { useState } from 'react';
import { MapPin, Ticket } from 'lucide-react';
import { ethers } from 'ethers';

import Spinner from '../components/Spinner';
import ABI from '../contract.json';

const EventForm = () => {
  const [ethAddress, setETHAddress] = useState('');
  const [userSigner, setUserSigner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setmsg] = useState("");

  const connectWallet = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setETHAddress(accounts[0]);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    setUserSigner(signer);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setmsg("");

    const event_name = e.target.event_name.value;
    const location = e.target.location.value;

    try {
      const helloWorldServiceManager = new ethers.Contract("0x998abeb3e57409262ae5b751f60747921b33613e", ABI, userSigner);
      console.log(helloWorldServiceManager);
      const transaction = await helloWorldServiceManager.createNewTask(event_name, location);
      const tx = await transaction.wait();
      console.log(tx);

      setIsLoading(false);
      setmsg("Post succesful: " + tx.transactionHash);
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
        <h2 className="text-2xl font-bold text-gray-800">Post Event</h2>
      </div>

      <button
        onClick={connectWallet}
        className="w-full py-2 px-4 bg-blue-600 mb-4 cursor-pointer text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {ethAddress ? ethAddress.slice(0, 5) + "..." + ethAddress.slice(37, 42) : 'Connect Wallet'}
      </button>
      
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
            <MapPin className="w-4 h-4 mr-2" />
            Location
          </label>
          <input
            id="location"
            type="text"
            placeholder="Enter destination airport code or name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

       <button
          type="submit"
          disabled={isLoading || !ethAddress}
          className="w-full py-2 px-4 bg-blue-600 text-white cursor-pointer rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Spinner />
              <span className="ml-2">Posting...</span>
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

export default EventForm;
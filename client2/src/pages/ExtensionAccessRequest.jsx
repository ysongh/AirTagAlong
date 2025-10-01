import { useState, useEffect } from 'react';

import { EXTENSION_ID } from '../../keys';

export default function ExtensionAccessRequest() {
  const [status, setStatus] = useState({
    message: 'Extension not detected - Please install the extension first',
    type: 'pending'
  });
  const [extensionConnected, setExtensionConnected] = useState(false);
  const [requestBtnText, setRequestBtnText] = useState('Request Extension Access');
  const [requestBtnDisabled, setRequestBtnDisabled] = useState(true);
  const [testBtnDisabled, setTestBtnDisabled] = useState(true);
  const [showRequestBtn, setShowRequestBtn] = useState(true);
  const [tabInfo, setTabInfo] = useState(null);
  const [nillionDiDObj, setNillionDiDObj] = useState(null);

useEffect(() => {
  const checkExtension = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage(
        EXTENSION_ID,
        { type: 'PING' },
        (response) => {
          if (chrome.runtime.lastError) {
            setStatus({
              message: 'Extension not found - Please install and reload page',
              type: 'denied'
            });
          } else {
            setStatus({
              message: 'Extension detected! Click to request access',
              type: 'pending'
            });
            setRequestBtnDisabled(false);
          }
        }
      );
    } else {
      setStatus({
        message: 'Not running in a browser that supports extensions',
        type: 'denied'
      });
    }
  };

  const timer = setTimeout(checkExtension, 500);

  // Listen for messages from extension via postMessage (from content script)
  const messageListener = (event) => {
    // Only accept messages from the extension's content script
    if (event.data.type === 'FROM_EXTENSION') {
      const message = event.data.data;
      console.log('Received from extension:', message);
      
      if (message.type === 'ACCESS_RESPONSE') {
        if (message.granted) {
          setExtensionConnected(true);
          setStatus({
            message: 'Access Granted! You can now use extension features',
            type: 'granted'
          });
          setTestBtnDisabled(false);
          setShowRequestBtn(false);
          setNillionDiDObj(message.nillionDiDObj);
        } else {
          setStatus({
            message: 'Access Denied by user',
            type: 'denied'
          });
          setRequestBtnDisabled(false);
          setRequestBtnText('Request Again');
        }
      }
    }
  };

  window.addEventListener('message', messageListener);

  return () => {
    clearTimeout(timer);
    window.removeEventListener('message', messageListener);
  };
}, []);

  const requestAccess = () => {
    setRequestBtnDisabled(true);
    setRequestBtnText('Requesting...');
    setStatus({
      message: 'Requesting access... Extension popup will open shortly!',
      type: 'pending'
    });

    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage(
        EXTENSION_ID,
        {
          type: 'REQUEST_ACCESS',
          origin: window.location.origin,
          timestamp: Date.now(),
          openPopup: true
        },
        (response) => {
          if (chrome.runtime.lastError) {
            setStatus({
              message: 'Failed to connect to extension',
              type: 'denied'
            });
            setRequestBtnDisabled(false);
            setRequestBtnText('Try Again');
          } else if (response && response.granted) {
            setExtensionConnected(true);
            setStatus({
              message: 'Access Granted! You can now use extension features',
              type: 'granted'
            });
            setTestBtnDisabled(false);
            setShowRequestBtn(false);
          } else if (response && response.popupOpened) {
            setStatus({
              message: 'Extension popup opened - Please Allow or Deny the request',
              type: 'pending'
            });
          } else {
            setStatus({
              message: 'Access Denied by user',
              type: 'denied'
            });
            setRequestBtnDisabled(false);
            setRequestBtnText('Request Again');
          }
        }
      );
    }
  };

  const testConnection = () => {
    if (!extensionConnected) return;

    chrome.runtime.sendMessage(
      EXTENSION_ID,
      { type: 'GET_TAB_INFO' },
      (response) => {
        if (response) {
          setTabInfo(response);
        }
      }
    );
  };

  const getStatusClasses = () => {
    const baseClasses = 'px-4 py-3 rounded border font-bold my-5';
    if (status.type === 'pending') {
      return `${baseClasses} bg-yellow-50 text-yellow-800 border-yellow-200`;
    } else if (status.type === 'granted') {
      return `${baseClasses} bg-green-50 text-green-800 border-green-200`;
    } else {
      return `${baseClasses} bg-red-50 text-red-800 border-red-200`;
    }
  };

  const approveUser = async() => {
    try {
      const response = await fetch("http://localhost:4000/api/test/approve", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nillionDiDObj })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-5">
          Extension Access Request
        </h1>
        <p className="text-gray-600 mb-4">
          This web app wants to connect with your browser extension.
        </p>

        <div className={getStatusClasses()}>
          {status.message}
        </div>

        <div className="flex gap-2 justify-center">
          {showRequestBtn && (
            <button
              onClick={requestAccess}
              disabled={requestBtnDisabled}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-base"
            >
              {requestBtnText}
            </button>
          )}
          <button
            onClick={testConnection}
            disabled={testBtnDisabled}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-base"
          >
            Test Connection
          </button>
           <button
            onClick={approveUser}
            disabled={testBtnDisabled}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-base"
          >
            Approve User
          </button>
        </div>

        {tabInfo && (
          <div className="mt-5 p-4 bg-gray-50 rounded">
            <h3 className="text-xl font-bold mb-3">Current Tab Info:</h3>
            <p className="text-left"><strong>Title:</strong> {tabInfo.title}</p>
            <p className="text-left"><strong>URL:</strong> {tabInfo.url}</p>
          </div>
        )}
      </div>
    </div>
  );
}

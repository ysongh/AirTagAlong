import { createContext, useContext, useState, useEffect } from 'react';

// Context for sharing extension state across the app
const NilDataWalletContext = createContext(null);

/**
 * Provider component that wraps the entire app
 * Handles extension connection and provides DID to all child components
 */
export const NilDataWalletProvider = ({ 
  extensionId, 
  children,
  onConnectionChange,
  customUI,
  autoConnect = false
}) => {
  const [nillionDiD, setNillionDiD] = useState(null);
  const [status, setStatus] = useState({
    message: 'Extension not detected - Please install the extension first',
    type: 'pending'
  });
  const [extensionConnected, setExtensionConnected] = useState(false);
  const [requestBtnText, setRequestBtnText] = useState('Connect DID');
  const [requestBtnDisabled, setRequestBtnDisabled] = useState(true);
  const [showRequestBtn, setShowRequestBtn] = useState(true);

  useEffect(() => {
    if (!extensionId) {
      throw new Error('extensionId is required for NilDataWalletProvider');
    }

    const checkExtension = () => {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage(
          extensionId,
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
              
              // Auto-connect if enabled
              if (autoConnect) {
                setTimeout(() => requestAccess(), 500);
              }
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

    // Listen for messages from extension
    const messageListener = (event) => {
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
            setShowRequestBtn(false);
            setNillionDiD(message.nillionDiD);
            
            // Callback for connection change
            if (onConnectionChange) {
              onConnectionChange({ 
                connected: true, 
                nillionDiD: message.nillionDiD 
              });
            }
          } else {
            handleAccessDenied();
          }
        }
        else if (message.type === 'REJECTED') {
          handleAccessDenied();
        }
      }
    };

    const handleAccessDenied = () => {
      setStatus({
        message: 'Access Denied by user',
        type: 'denied'
      });
      setRequestBtnDisabled(false);
      setRequestBtnText('Request Again');
      
      if (onConnectionChange) {
        onConnectionChange({ connected: false, nillionDiD: null });
      }
    };

    window.addEventListener('message', messageListener);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('message', messageListener);
    };
  }, [extensionId, autoConnect, onConnectionChange]);

  const requestAccess = () => {
    setRequestBtnDisabled(true);
    setRequestBtnText('Requesting...');
    setStatus({
      message: 'Requesting access... Extension popup will open shortly!',
      type: 'pending'
    });

    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage(
        extensionId,
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
            setShowRequestBtn(false);
            
            if (onConnectionChange) {
              onConnectionChange({ 
                connected: true, 
                nillionDiD: response.nillionDiD 
              });
            }
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

  const disconnect = () => {
    setExtensionConnected(false);
    setNillionDiD(null);
    setShowRequestBtn(true);
    setRequestBtnDisabled(false);
    setRequestBtnText('Connect DID');
    setStatus({
      message: 'Disconnected. Click to reconnect',
      type: 'pending'
    });
    
    if (onConnectionChange) {
      onConnectionChange({ connected: false, nillionDiD: null });
    }
  };

  const contextValue = {
    nillionDiD,
    extensionConnected,
    status,
    requestAccess,
    disconnect,
    extensionId
  };

  return (
    <NilDataWalletContext.Provider value={contextValue}>
      {/* Custom UI or default UI */}
      {customUI ? (
        customUI({
          ...contextValue,
          requestBtnText,
          requestBtnDisabled,
          showRequestBtn
        })
      ) : (
        <DefaultConnectionUI 
          status={status}
          requestAccess={requestAccess}
          requestBtnText={requestBtnText}
          requestBtnDisabled={requestBtnDisabled}
          showRequestBtn={showRequestBtn}
          extensionConnected={extensionConnected}
          nillionDiD={nillionDiD}
        />
      )}
      
      {/* Render children only if connected, or always if customUI is provided */}
      {(extensionConnected || customUI) && children}
    </NilDataWalletContext.Provider>
  );
};

/**
 * Default UI component for connection
 */
const DefaultConnectionUI = ({
  status,
  requestAccess,
  requestBtnText,
  requestBtnDisabled,
  showRequestBtn,
  extensionConnected,
  nillionDiD
}) => {
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

  if (extensionConnected) {
    return null; // Don't show UI when connected
  }

  return (
    <div className="bg-gray-100 flex items-center justify-center p-5">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full text-center">
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
        </div>
      </div>
    </div>
  );
};

/**
 * Hook to access extension context in any component
 */
export const useNilDataWallet = () => {
  const context = useContext(NilDataWalletContext);
  
  if (!context) {
    throw new Error(
      'useNilDataWallet must be used within NilDataWalletProvider'
    );
  }
  
  return context;
};
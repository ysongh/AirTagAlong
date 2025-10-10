import { EXTENSION_ID } from '../../keys';

export const sendDataToExtension = (
  collectionName: string,
  userPrivateData: string,
  builderDid: string,
  delegationToken: string,
  collectionId: string
) => {
  chrome.runtime.sendMessage(
    EXTENSION_ID,
    {
      type: 'CREATE_DATA',
      data: {
        collectionName: collectionName,
        timestamp: Date.now(),
        origin: window.location.origin,
        builderDid: builderDid,
        delegationToken: delegationToken,
        collectionId: collectionId,
        userPrivateData: userPrivateData
      },
      openPopup: true
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending data:', chrome.runtime.lastError);
        return ({
          success: false,
          message: 'Failed to send data'
        });
      } else {
        console.log('Data sent successfully:', response);
        return(response);
      }
    }
  );
};
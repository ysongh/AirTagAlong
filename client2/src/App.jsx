import { useEffect, useState } from 'react';
import { Did, Keypair, NucTokenBuilder, Command } from '@nillion/nuc';
import { SecretVaultBuilderClient } from '@nillion/secretvaults';

// import ExtensionAccessRequest from './components/ExtensionAccessRequest';
import { REACT_APP_NILLION_API_KEY, REACT_APP_NILLION_COLLECTION_ID } from '../keys';
import { sendDataToExtension } from './services/useExtension';
// import { useNilDataWallet } from './components/NilDataWalletProvider';
import { useNilDataWallet } from 'nildata-wallet-connector';

const NILLION_API_KEY = REACT_APP_NILLION_API_KEY || '';
const NILLION_COLLECTION_ID = REACT_APP_NILLION_COLLECTION_ID || '';

function App() {
  const { nillionDiD, extensionConnected, status } = useNilDataWallet();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [delegationToken, setDelegationToken] = useState();
  const [collectionName, setCollectionName] = useState("");

  console.log(extensionConnected, status)

  const readCollection = async () => {
    setLoading(true);
    setError(null);

    try {
      // get a Nillion API Key: https://docs.nillion.com/build/network-api-access
      // see Nillion Testnet Config: https://docs.nillion.com/build/network-config#nildb-nodes
      const builder = await SecretVaultBuilderClient.from({
        keypair: Keypair.from(NILLION_API_KEY),
        urls: {
          chain: 'http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz',
          auth: 'https://nilauth.sandbox.app-cluster.sandbox.nilogy.xyz',
          dbs: [
            'https://nildb-stg-n1.nillion.network',
            'https://nildb-stg-n2.nillion.network',
            'https://nildb-stg-n3.nillion.network',
          ],
        },
        blindfold: { operation: 'store' },
      });

      console.log(builder)

      await builder.refreshRootToken();
      console.log(builder)
      const response = await builder.findData({
        collection: NILLION_COLLECTION_ID,
        filter: {},
      });

      console.log(response)

      setData(response.data);
    } catch (err) {
      setError((err).message || 'Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async () => {
    setLoading(true);
    setError(null);

    try {
      const builderKeypair = Keypair.from(NILLION_API_KEY);
      // get a Nillion API Key: https://docs.nillion.com/build/network-api-access
      // see Nillion Testnet Config: https://docs.nillion.com/build/network-config#nildb-nodes
      const builder = await SecretVaultBuilderClient.from({
        keypair: Keypair.from(NILLION_API_KEY),
        urls: {
          chain: 'http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz',
          auth: 'https://nilauth.sandbox.app-cluster.sandbox.nilogy.xyz',
          dbs: [
            'https://nildb-stg-n1.nillion.network',
            'https://nildb-stg-n2.nillion.network',
            'https://nildb-stg-n3.nillion.network',
          ],
        },
        blindfold: { operation: 'store' },
      });

      await builder.refreshRootToken();

      const collections = await builder.readCollections();
      const collection = collections.data.find(item => item.id === NILLION_COLLECTION_ID);
      setCollectionName(collection.name);

      const exampleDid = Did.fromHex(
        nillionDiD.replace(
          "did:nil:",
          ""
        )
      );
      console.log(typeof NILLION_API_KEY, NILLION_API_KEY, NILLION_API_KEY.length)

      // Builder grants write access to the user
      const delegation = NucTokenBuilder.extending(builder.rootToken)
        .command(new Command(['nil', 'db', 'data', 'create']))
        .audience(exampleDid)
        .expiresAt(Math.floor(Date.now() / 1000) + 3600) // 1 hour
        .build(builderKeypair.privateKey());


      console.log('✅ Builder approve user:', nillionDiD);
      console.log('✅ Delegation user:', delegation);

      setDelegationToken(delegation);

    } catch (err) {
      setError((err).message || 'Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

    // Send data to extension
  const handleSendDataToExtension = (e) => {
    e.preventDefault();

    const builderDid = Keypair.from(NILLION_API_KEY).toDidString();
    const collectionId = NILLION_COLLECTION_ID;

    const userPrivateData = {
      _id: crypto.randomUUID(),
      name: e.target.name.value,
      event_name: e.target.event_name.value,
      travel_date: e.target.travel_date.value,
      departure_airport: e.target.departure_airport.value,
      destination: e.target.destination.value,
      gate_number:  e.target.gate_number.value,
      additional_note: e.target.additional_note.value,
    };
    
    sendDataToExtension(collectionName, userPrivateData, builderDid, delegationToken, collectionId);
  };

  const test = () => {
    const builderDid = Keypair.from(NILLION_API_KEY).toDidString();
    const collectionId = NILLION_COLLECTION_ID;

    const userPrivateData = {
      _id: crypto.randomUUID(),
      name: "Coder",
      event_name: 'Hackathon',
      travel_date: '02/04/2025',
      departure_airport: 'LGA',
      destination: 'AAA',
      gate_number: '44',
      additional_note: 'I like to code'
    };
    sendDataToExtension(collectionName, userPrivateData, builderDid, delegationToken, collectionId);
  };

  useEffect(() => {
    if (
      NILLION_API_KEY &&
      NILLION_COLLECTION_ID &&
      NILLION_API_KEY !== 'your-api-key-here' &&
      NILLION_COLLECTION_ID !== 'your-collection-id-here'
    ) {
      readCollection();
    }
  }, []);

  if (
    !NILLION_API_KEY ||
    !NILLION_COLLECTION_ID ||
    NILLION_API_KEY === 'your-api-key-here' ||
    NILLION_COLLECTION_ID === 'your-collection-id-here'
  ) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h1>⚠️ Environment Variables Missing</h1>
        <p>Create a .env file in your project root:</p>
        <pre style={{ background: '#f5f5f5', padding: '1rem' }}>
          {`REACT_APP_NILLION_API_KEY=your-api-key-here
REACT_APP_NILLION_COLLECTION_ID=your-collection-id-here`}
        </pre>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* <ExtensionAccessRequest
        nillionDiD={nillionDiD}
        setNillionDiD={setNillionDiD}
      /> */}
      <h1>Nillion Collection Reader</h1>
      <p>Reading all records in your Nillion Private Storage collection</p>

      <button className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-base mr-3" onClick={readCollection} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh Data'}
      </button>

       <button className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-base mr-3" onClick={approveUser} disabled={loading}>
        {loading ? 'Loading...' : 'Approve User'}
      </button>

       <button className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-base" onClick={test} disabled={loading}>
        {loading ? 'Loading...' : 'Test'}
      </button>

      {delegationToken && <div className="mt-5 p-4 bg-blue-50 rounded border border-blue-200">
        <h3 className="text-xl font-bold mb-3">Send Data to Extension</h3>
          <form onSubmit={handleSendDataToExtension} className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Guest..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
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
                Travel Date
              </label>
              <input
                id="travel_date"
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                Departure Airport
              </label>
              <input
                id="departure_airport"
                type="text"
                placeholder="Enter airport code or name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                Destination
              </label>
              <input
                id="destination"
                type="text"
                placeholder="Enter destination airport code or name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                Gate Number
              </label>
              <input
                id="gate_number"
                type="text"
                placeholder="Enter gate number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <textarea
                id="additional_note"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Share any additional details about your travel plans..."
              />
            </div>

          <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              Post
            </button>
          </form>
      </div>}

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>Error: {error}</div>
      )}

      <div style={{ marginTop: '20px' }}>
        <p>Found {data.length} records:</p>
        <pre style={{ background: '#f5f5f5', padding: '10px' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default App;

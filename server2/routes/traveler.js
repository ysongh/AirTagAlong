import express from 'express';
import { randomUUID } from 'node:crypto';
import { config as loadEnv } from 'dotenv';

// Load environment variables
loadEnv();

// Import Nillion SDK components
import {
  Keypair,
  NucTokenBuilder,
  Command,
} from '@nillion/nuc';
import {
  SecretVaultBuilderClient,
  SecretVaultUserClient,
} from '@nillion/secretvaults';

// Configuration
const config = {
  NILCHAIN_URL: process.env.NILCHAIN_URL,
  NILAUTH_URL: process.env.NILAUTH_URL,
  NILDB_NODES: process.env.NILDB_NODES.split(','),
  BUILDER_PRIVATE_KEY: process.env.BUILDER_PRIVATE_KEY,
  USER_PRIVATE_KEY: process.env.USER_PRIVATE_KEY,
};

// Validate configuration
if (!config.BUILDER_PRIVATE_KEY) {
  console.error('❌ Please set BUILDER_PRIVATE_KEY in your .env file');
  process.exit(1);
}

const router = express.Router();

// Create collection
router.get('/createcollection', async (req, res) => {
  const collectionId = randomUUID();

  const collection = {
    _id: collectionId,
    type: 'owned', // Every document in the collection will be user-owned
    name: 'User Profile Collection',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string', format: 'uuid' },
          event_name: { type: 'string' },
          travel_date: { type: 'string' },
          departure_airport: { type: 'string' },
          destination: { type: 'string' },
          gate_number: { type: 'string' },
          additional_note: { type: 'string' },
        },
        required: ['_id', 'event_name'],
      },
    },
  };

  try {
    const builderKeypair = Keypair.from(config.BUILDER_PRIVATE_KEY);

    const builder = await SecretVaultBuilderClient.from({
      keypair: builderKeypair,
      urls: {
        chain: config.NILCHAIN_URL,
        auth: config.NILAUTH_URL,
        dbs: config.NILDB_NODES,
      },
    });

    await builder.refreshRootToken();

    const createResults = await builder.createCollection(collection);
    console.log(
      '✅ Owned collection created on',
      Object.keys(createResults).length,
      'nodes'
    );

    res.json({ createResults, collectionId });
   } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
  }
});

router.post('/upload/:collectionId', async (req, res) => {
  const collectionId = req.params.collectionId;
  
  const event_name = req.body.event_name;
  const travel_date = req.body.travel_date;
  const departure_airport = req.body.departure_airport;
  const destination = req.body.destination;
  const gate_number = req.body.gate_number;
  const additional_note = req.body.additional_note;

  try {
    const builderKeypair = Keypair.from(config.BUILDER_PRIVATE_KEY);
    const userKeypair = Keypair.from(config.USER_PRIVATE_KEY);
    const builderDid = builderKeypair.toDid().toString();
    const userDid = userKeypair.toDid().toString();

    const builder = await SecretVaultBuilderClient.from({
      keypair: builderKeypair,
      urls: {
        chain: config.NILCHAIN_URL,
        auth: config.NILAUTH_URL,
        dbs: config.NILDB_NODES,
      },
    });

    await builder.refreshRootToken();

    // Create user client
    const user = await SecretVaultUserClient.from({
      baseUrls: config.NILDB_NODES,
      keypair: userKeypair,
    });

    // Builder grants write access to the user
    const delegation = NucTokenBuilder.extending(builder.rootToken)
      .command(new Command(['nil', 'db', 'data', 'create']))
      .audience(userKeypair.toDid())
      .expiresAt(Math.floor(Date.now() / 1000) + 3600) // 1 hour
      .build(builderKeypair.privateKey());

    // User's private data
    // %allot indicates that the client should encrypt this data
    const userPrivateData = {
      _id: randomUUID(),
      name: "Coder",
      event_name: event_name,
      travel_date: travel_date,
      departure_airport: departure_airport,
      destination: destination,
      gate_number: gate_number,
      additional_note: additional_note
    };

    // User uploads data and grants builder limited access
    const uploadResults = await user.createData(delegation, {
      owner: userDid,
      acl: {
        grantee: builderDid, // Grant access to the builder
        read: true, // Builder can read the data
        write: false, // Builder cannot modify the data
        execute: true, // Builder can run queries on the data
      },
      collection: collectionId,
      data: [userPrivateData],
    });

    console.log('✅ User uploaded private data with builder access granted');

    res.json({ uploadResults, userPrivateData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// View user data 
router.get('/readdata/:collectionId/:id', async (req, res) => {
  const collectionId = req.params.collectionId;
  const id = req.params.id;

  try {
    const userKeypair = Keypair.from(config.USER_PRIVATE_KEY);

    // Create user client
    const user = await SecretVaultUserClient.from({
      baseUrls: config.NILDB_NODES,
      keypair: userKeypair,
    });

    // Builder reads user's data (only works because user granted access)
    const userData = await user.readData({
      collection: collectionId,
      document: id,
    });

    console.log('✅ Builder successfully accessed user data:', {
      name: userData.data.name,
      // Note: Builder can only see this because user granted read permission
    });

    res.json({ userData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List User's Data References
router.get('/viewlist', async (req, res) => {
  try {
    const userKeypair = Keypair.from(config.USER_PRIVATE_KEY);

    // Create user client
    const user = await SecretVaultUserClient.from({
      baseUrls: config.NILDB_NODES,
      keypair: userKeypair,
    });

    const references = await user.listDataReferences();
    console.log('✅ User has', references.data.length, 'private records stored');

    res.json({ references });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/travellist/:collectionId', async (req, res) => {
  const collectionId = req.params.collectionId;

  try {
    const userKeypair = Keypair.from(config.USER_PRIVATE_KEY);

    // Create user client
    const user = await SecretVaultUserClient.from({
      baseUrls: config.NILDB_NODES,
      keypair: userKeypair,
    });

    const references = await user.listDataReferences();
    console.log('✅ User has', references.data.length, 'private records stored');

    const data = [];

    for(let i = 0; i < references.data.length; i++){
      if (references.data[i].collection === collectionId) {
        const userData = await user.readData({
          collection: references.data[i].collection,
          document:  references.data[i].document,
        });

        data.push(userData);
      }
    }

    res.json({ data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// User deletes their data
router.get('/delete/:collectionId/:id', async (req, res) => {
  const collectionId = req.params.collectionId;
  const id = req.params.id;

  try {
    const userKeypair = Keypair.from(config.USER_PRIVATE_KEY);

    const user = await SecretVaultUserClient.from({
      baseUrls: config.NILDB_NODES,
      keypair: userKeypair,
    });

    // Create user client
    await user.deleteData({
      collection: collectionId,
      document: id
    });

    console.log('✅ User deleted their private data');

    res.json({ msg: id + " is been deleted" });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Run queries on encrypted data
router.get('/query/:collectionId', async (req, res) => {
  const collectionId = req.params.collectionId;

  try {
    const builderKeypair = Keypair.from(config.BUILDER_PRIVATE_KEY);

    const builder = await SecretVaultBuilderClient.from({
      keypair: builderKeypair,
      urls: {
        chain: config.NILCHAIN_URL,
        auth: config.NILAUTH_URL,
        dbs: config.NILDB_NODES,
      },
    });

    await builder.refreshRootToken();

    const query = {
      _id: randomUUID(),
      name: 'Find Users by Name',
      collection: collectionId,
      variables: {
        searchName: {
          description: 'Name to search for',
          path: '$.pipeline[0].$match.name',
        },
      },
      pipeline: [{ $match: { name: '' } }, { $count: 'total' }],
    };

    const references = await builder.createQuery(query);

    res.json({ references });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
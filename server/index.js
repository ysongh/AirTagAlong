import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'body-parser';
import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { v4 as uuidv4 } from 'uuid';
import { orgConfig } from './nillionOrgConfig.js';

import schema from './schema.json' assert { type: 'json' };

// Load environment variables from .env file
dotenv.config();

const { json } = pkg;
const app = express();
const port = 4000;
const SCHEMA_ID = '9a87839f-f26e-427d-8912-a65b8f64f863';

app.use(cors());

// Middleware for parsing JSON bodies
app.use(json());

app.get('/generate/apitokens', async (req, res) => {
  try {
    const org = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials
    );
    await org.init();

    // generate api tokens for all nodes in the org config
    const apiTokens = await org.generateTokensForAllNodes();

    res.json({ apiTokens });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/create/schema', async (req, res) => {
  try {
    const org = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials
    );
    await org.init();

    // create a new collectionschema
    const newSchema = await org.createSchema(schema, 'Air Tag Along');

    res.json({ newSchema, SchemaID: newSchema[0].result.data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/storedata', async (req, res) => {
  try {
    const data = [
      {
        name: { $allot: 'Hackathon' },
        travel_date: { $allot: '02/04/2025' },
        departure_airport: { $allot: 'John F. Kennedy International' },
        destination: { $allot: 'London Heathrow' },
      },
    ];

    // Create a secret vault wrapper and initialize the SecretVault collection to use
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      SCHEMA_ID
    );
    await collection.init();

    // Write collection data to nodes encrypting the specified fields ahead of time
    const dataWritten = await collection.writeToNodes(data);
    console.log(
      '👀 Data written to nodes:',
      JSON.stringify(dataWritten, null, 2)
    );

    // Get the ids of the SecretVault records created
    const newIds = [
      ...new Set(dataWritten.map((item) => item.result.data.created).flat()),
    ];
    console.log('uploaded record ids:', newIds);

    res.json({ newIds });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/storedata', async (req, res) => {
  const name = req.body.name;
  const travel_date = req.body.travel_date;
  const departure_airport = req.body.departure_airport;
  const destination = req.body.destination;

  try {
    const data = [
      {
        name: { $allot: name },
        travel_date: { $allot: travel_date },
        departure_airport: { $allot: departure_airport },
        destination: { $allot: destination },
      },
    ];

    // Create a secret vault wrapper and initialize the SecretVault collection to use
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      SCHEMA_ID
    );
    await collection.init();

    // Write collection data to nodes encrypting the specified fields ahead of time
    const dataWritten = await collection.writeToNodes(data);
    console.log(
      '👀 Data written to nodes:',
      JSON.stringify(dataWritten, null, 2)
    );

    // Get the ids of the SecretVault records created
    const newIds = [
      ...new Set(dataWritten.map((item) => item.result.data.created).flat()),
    ];
    console.log('uploaded record ids:', newIds);

    res.json({ newIds });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/readdata', async (req, res) => {
  try {
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      SCHEMA_ID
    );
    await collection.init();

    // Read all collection data from the nodes, decrypting the specified fields
    const decryptedCollectionData = await collection.readFromNodes({});
   
    res.json({ decryptedCollectionData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => res.send('It Work'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
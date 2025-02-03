import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'body-parser';
import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { v4 as uuidv4 } from 'uuid';
import { orgConfig } from './nillionOrgConfig.js';

// Load environment variables from .env file
dotenv.config();

const { json } = pkg;
const app = express();
const port = 4000;

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

app.get('/store', async (req, res) => {
  try {
    const SCHEMA_ID = '8055defe-fcb1-4011-904b-d28ae77aa9f7';

    const data = [
      {
        name: { $allot: 'Test Song' }, // name will be encrypted to a $share
        years_in_web3: { $allot: 8 }, // years_in_web3 will be encrypted to a $share
        responses: [ 
          { rating: 5, question_number: 1 },
          { rating: 3, question_number: 2 },
        ], // responses will be stored in plaintext
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

    // Read all collection data from the nodes, decrypting the specified fields
    const decryptedCollectionData = await collection.readFromNodes({});

    // Log first 5 records
    console.log(
      'Most recent records',
      decryptedCollectionData.slice(0, data.length)
    );
   
    res.json({ 
      id: decryptedCollectionData[0]._id,
      name: decryptedCollectionData[0].name,
      years_in_web3: decryptedCollectionData[0].years_in_web3.toString(),
      responses: decryptedCollectionData[0].responses,
    });
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
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'body-parser';
import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { orgConfig } from './nillionOrgConfig.js';

import schema from './schema.json' assert { type: 'json' };

// Load environment variables from .env file
dotenv.config();

const { json } = pkg;
const app = express();
const port = 4000;
const SCHEMA_ID = '74f65645-88cb-45b1-9e46-cff8bfc00e38';

async function initializeGemini() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // For text-only input
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  // For text-and-image input
  const multimodalModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
  
  return { model, multimodalModel };
}

app.use(cors());

// Middleware for parsing JSON bodies
app.use(json());

app.get('/test/gemini', async (req, res) => {
  const { model } = await initializeGemini();

  try {
    const prompt = 'Write a short poem about artificial intelligence.';
    const result = await model.generateContent(prompt);
    const response = result.response;
    console.log(response.text());

    res.json({ text: response.text() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

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
  const additional_note = req.body.additional_note;
  try {
    const data = [
      {
        name: { $allot: name },
        travel_date: { $allot: travel_date },
        departure_airport: { $allot: departure_airport },
        destination: { $allot: destination },
        additional_note:  { $allot: additional_note },
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

app.get('/getmatchingtraveler', async (req, res) => {
  const { model } = await initializeGemini();

  try {
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      SCHEMA_ID
    );
    await collection.init();

    const decryptedCollectionData = await collection.readFromNodes({});
    const formattedData = JSON.stringify(decryptedCollectionData, null, 2);

    const prompt = `Find which data has name as hackathon based on this list: ${formattedData}`;
    const result = await model.generateContent(prompt);
    const response = result.response;
    console.log(response.text());
    
    res.json({ data: response.text() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/getmatchingtraveler', async (req, res) => {
  const { model } = await initializeGemini();

  try {
    const userPrompt = req.body.prompt;
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      SCHEMA_ID
    );
    await collection.init();

    const decryptedCollectionData = await collection.readFromNodes({});
    const formattedData = JSON.stringify(decryptedCollectionData, null, 2);

    const prompt = `${userPrompt} based on this list: ${formattedData}. Return the result as array of object`;
    const result = await model.generateContent(prompt);
    const response = result.response;
    console.log(response.text());
    
    res.json({ data: response.text() });
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
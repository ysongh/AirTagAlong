import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'body-parser';
import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { orgConfig } from './nillionOrgConfig.js';

import schema from './schema.json' assert { type: 'json' };

// Load environment variables from .env file
dotenv.config();

const { json } = pkg;
const app = express();
const port = 4000;

async function initializeGemini() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // For text-only input
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  // For text-and-image input
  const multimodalModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
  
  return { model, multimodalModel };
}

// Create a secret vault wrapper and initialize the SecretVault collection to use
async function initializeSecretVaultCollection(){
  const collection = new SecretVaultWrapper(
    orgConfig.nodes,
    orgConfig.orgCredentials,
    process.env.SCHEMA_ID
  );
  await collection.init();
  return collection;
}

app.use(cors());

// Middleware for parsing JSON bodies
app.use(json());

app.get('/test/gemini', async (req, res) => {
  const { model } = await initializeGemini();

  try {
    const prompt = 'What is the longitude and latitude of John F. Kennedy International';
    const result = await model.generateContent(prompt);
    const response = result.response;
    console.log(response.text());

    res.json({ text: response.text() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/chechissafe/gemini', async (req, res) => {
  const { model } = await initializeGemini();

  const content = req.body.content;

  try {
    const prompt = `Is this address real? ${content}`;
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
        event_name: { $allot: 'Hackathon' },
        travel_date: { $allot: '02/04/2025' },
        departure_airport: { $allot: 'John F. Kennedy International' },
        destination: { $allot: 'London Heathrow' },
      },
    ];

    const collection = await initializeSecretVaultCollection();

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
  const event_name = req.body.event_name;
  const travel_date = req.body.travel_date;
  const departure_airport = req.body.departure_airport;
  const destination = req.body.destination;
  const gate_number = req.body.gate_number;
  const additional_note = req.body.additional_note;
  try {
    const data = [
      {
        event_name: { $allot: event_name },
        travel_date: { $allot: travel_date },
        departure_airport: { $allot: departure_airport },
        destination: { $allot: destination },
        gate_number: { $allot: gate_number },
        additional_note:  { $allot: additional_note },
      },
    ];

    const collection = await initializeSecretVaultCollection();

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
    const collection = await initializeSecretVaultCollection();

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
    const collection = await initializeSecretVaultCollection();

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
    const collection = await initializeSecretVaultCollection();

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

app.get('/allevents', async (req, res) => {
  try {
    const collection = await initializeSecretVaultCollection();

    const decryptedCollectionData = await collection.readFromNodes({});

    const events = [];

    decryptedCollectionData.forEach(entry => {
      if (!entry.event_name) return;
      
      const existingEventIndex = events.findIndex(event => 
        event.event_name === entry.event_name
      );
      
      if (existingEventIndex === -1) {
        const newEvent = {
          event_name: entry.event_name,
          travel_dates: [entry.travel_date],
          departure_airports: [entry.departure_airport],
          travelers: entry.numberOfTravlers || 1
        };
        events.push(newEvent);
      } else {
        const existingEvent = events[existingEventIndex];
        
        if (entry.travel_date && !existingEvent.travel_dates.includes(entry.travel_date)) {
          existingEvent.travel_dates.push(entry.travel_date);
        }
        
        if (entry.departure_airport && !existingEvent.departure_airports.includes(entry.departure_airport)) {
          existingEvent.departure_airports.push(entry.departure_airport);
        }
        
        existingEvent.travelers += entry.numberOfTravlers || 1;
      }
    });
   
    res.json({ events });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/deleterecord/:id', async (req, res) => {
  try {
    const recordID = req.params.id;

    const collection = await initializeSecretVaultCollection();

    const filterById = {
      _id: recordID,
    };

    const readOriginalRecord = await collection.readFromNodes(filterById);
    console.log('📚 Read original record:', readOriginalRecord);

    const deletedData = await collection.deleteDataFromNodes(filterById);
    console.log('📚 Deleted record from all nodes:', deletedData);

    res.json({ deletedData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/editrecord/:id', async (req, res) => {
  try {
    const recordUpdate = {
      event_name: { $allot: 'Hackathon' },
      travel_date: { $allot: '02/04/2025' },
      departure_airport: { $allot: 'John F. Kennedy International' },
      destination: { $allot: 'London Heathrow' },
      additional_note:  { $allot: "I like to read book" },
    };

    const recordID = req.params.id;

    const collection = await initializeSecretVaultCollection();

    const filterById = {
      _id: recordID,
    };

    const readOriginalRecord = await collection.readFromNodes(filterById);
    console.log('📚 Read original record:', readOriginalRecord);

    const updatedData = await collection.updateDataToNodes(
      recordUpdate,
      filterById
    );

    console.log(
      '📚 Find record(s) with filter and update nodes with recordUpdate:',
      updatedData.map((n) => n.result.data)
    );

    const readUpdatedRecord = await collection.readFromNodes(filterById);
    console.log('📚 Read updated record:', readUpdatedRecord);

    res.json({ readUpdatedRecord });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/getalltravelersbyeventname/:eventname', async (req, res) => {
  try {
    const eventname = req.params.eventname;

    const collection = await initializeSecretVaultCollection();

    const decryptedCollectionData = await collection.readFromNodes({});
    const travelers = decryptedCollectionData.filter(event => event.event_name === eventname);

    res.json({ travelers });
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
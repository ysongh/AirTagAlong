import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'body-parser';
import { randomUUID } from 'node:crypto';
import { config as loadEnv } from 'dotenv';

// Load environment variables
loadEnv();

// Import Nillion SDK components
import {
  Keypair,
  NilauthClient,
  PayerBuilder,
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
};

// Validate configuration
if (!config.BUILDER_PRIVATE_KEY) {
  console.error('❌ Please set BUILDER_PRIVATE_KEY in your .env file');
  process.exit(1);
}

const { json } = pkg;
const app = express();
const port = 4000;

app.use(cors());

// Middleware for parsing JSON bodies
app.use(json());

// Create keypairs for builder and user
app.get('/getbuilderanduser', async (req, res) => {
  try {

    const builderKeypair = Keypair.from(config.BUILDER_PRIVATE_KEY); // Use your funded key
    const userKeypair = Keypair.generate(); // Generate random user

    const builderDid = builderKeypair.toDid().toString();
    const userDid = userKeypair.toDid().toString();

    console.log('Builder DID:', builderDid);
    console.log('User DID:', userDid);

    // Create payer and nilauth client
    const payer = await new PayerBuilder()
        .keypair(builderKeypair)
        .chainUrl(config.NILCHAIN_URL)
        .build();

    const nilauth = await NilauthClient.from(config.NILAUTH_URL, payer);

    // Create builder client
    const builder = await SecretVaultBuilderClient.from({
        keypair: builderKeypair,
        urls: {
        chain: config.NILCHAIN_URL,
        auth: config.NILAUTH_URL,
        dbs: config.NILDB_NODES,
        },
    });

    // Refresh token using existing subscription
    await builder.refreshRootToken();
    res.json({ builderDid, userDid });

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

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

async function main() {
  // Create keypairs for builder and user
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

  // Register builder (handle existing registration)
  try {
    const existingProfile = await builder.readProfile();
    console.log('✅ Builder already registered:', existingProfile.data.name);
  } catch (profileError) {
    try {
      await builder.register({
        did: builderDid,
        name: 'My Demo Builder',
      });
      console.log('✅ Builder registered successfully');
    } catch (registerError) {
      // Handle duplicate key errors gracefully
      if (registerError.message.includes('duplicate key')) {
        console.log('✅ Builder already registered (duplicate key)');
      } else {
        throw registerError;
      }
    }
  }

  // Define collection
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
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
        },
        required: ['_id', 'name', 'email'],
      },
    },
  };
}

main().catch(console.error);
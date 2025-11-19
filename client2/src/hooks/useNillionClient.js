import { NillionClient } from "@nillion/secretvaults";
import { NETWORK_CONFIG } from "@/config";

async function initializeSession(signer) {
  const client = new NillionClient({
    signer,
    nilchain: NETWORK_CONFIG.nilchain,
    nilauth: NETWORK_CONFIG.nilauth,
    nildb: NETWORK_CONFIG.nildb,
  });

  // Initialize session - this authenticates the user
  await client.initialize();

  return client;
}

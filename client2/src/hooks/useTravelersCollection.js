import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNillionClient } from "./useNillionClient";
import { useProfile } from "./useProfile";
import { useNillion } from "./useNillion";

const TRAVELERS_COLLECTION_SCHEMA = {
  type: "standard",
  name: "encrypted-notes",
  schema: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "array",
    uniqueItems: true,
    items: {
      type: "object",
      properties: {
        _id: { type: "string", format: "uuid" },
        walletAddress: { type: "string" },           // Plaintext - for filtering
        event_name: { type: "string" },              // Plaintext - for display
        travel_date: { type: "string" },   
        content: {                                   // ENCRYPTED - secret shared
          type: "object",
          properties: { "%share": { type: "string" } },
          required: ["%share"],
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
      required: ["_id", "walletAddress", "event_name", "travel_date", "content", "createdAt", "updatedAt"],
    },
  },
};

const TRAVELERS_COLLECTION_ID_KEY = "travelers_collection_id";

export function useTravelersCollection() {
  const clientResult = useNillionClient();
  const { state } = useNillion();
  const { isRegistered } = useProfile();
  const walletAddress = state.wallets.metaMaskAddress;
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["travelersCollection", walletAddress],
    queryFn: async () => {
      console.log("[useTravelersCollection] Starting...", { clientResult: !!clientResult, walletAddress, isRegistered });

      if (!clientResult) {
        throw new Error("Nillion client not available");
      }
      const { nillionClient, nildbTokens } = clientResult;

      if (!walletAddress) {
        throw new Error("Wallet address is required");
      }
      if (!isRegistered) {
        throw new Error("Builder profile not registered");
      }

      // Check localStorage for existing collection ID for this wallet
      const storageKey = `${TRAVELERS_COLLECTION_ID_KEY}_${walletAddress.toLowerCase()}`;
      const storedId = localStorage.getItem(storageKey);
      console.log("[useTravelersCollection] Stored ID:", storedId);

      if (storedId) {
        // Verify collection still exists
        try {
          console.log("[useTravelersCollection] Verifying existing collection...");
          await nillionClient.readCollection(storedId, {
            auth: { invocations: nildbTokens },
          });
          console.log("[useTravelersCollection] Collection verified:", storedId);
          return storedId;
        } catch (err) {
          // Collection doesn't exist anymore, create a new one
          console.log("[useTravelersCollection] Collection not found, will create new one:", err);
          localStorage.removeItem(storageKey);
        }
      }

      // Create new collection with notes schema
      console.log("[useTravelersCollection] Creating new collection...");
      const collectionId = crypto.randomUUID();
      const result = await nillionClient.createCollection(
        {
          _id: collectionId,
          ...TRAVELERS_COLLECTION_SCHEMA,
        },
        { auth: { invocations: nildbTokens } }
      );
      console.log("[useTravelersCollection] Collection created:", collectionId, result);

      // Store in localStorage
      localStorage.setItem(storageKey, collectionId);

      // Invalidate profile to update collections list
      queryClient.invalidateQueries({ queryKey: ["builderProfile"] });

      return collectionId;
    },
    enabled: !!walletAddress && isRegistered && !!clientResult,
    staleTime: Infinity, // Collection ID doesn't change
    retry: 1,
  });
}

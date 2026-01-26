import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNillionClient } from "./useNillionClient";
import { useTravelersCollection } from "./useTravelersCollection";
import { useNillion } from "./useNillion";

export function useTravelers() {
  const clientResult = useNillionClient();
  const { state } = useNillion();
  const { data: collectionId, isSuccess: isCollectionReady, isLoading: isCollectionLoading, error: collectionError } = useTravelersCollection();
  const queryClient = useQueryClient();
  const walletAddress = state.wallets.metaMaskAddress;

  // READ: Fetch all travelers for this wallet
  const travelersQuery = useQuery({
    queryKey: ["travelers", collectionId, walletAddress],
    queryFn: async () => {
      if (!clientResult || !collectionId || !walletAddress) {
        throw new Error("Not ready");
      }
      const { nillionClient, nildbTokens } = clientResult;

      console.log("[useTravelers] findData - tokens available:", Object.keys(nildbTokens).length);

      const result = await nillionClient.findData(
        {
          collection: collectionId,
          filter: { walletAddress: walletAddress.toLowerCase() },
        },
        { auth: { invocations: nildbTokens } }
      );

      return (result.data || []);
    },
    enabled: isCollectionReady && !!clientResult && !!walletAddress,
    retry: false,
    staleTime: 5000,  // Don't refetch for 5 seconds
  });

  // CREATE: Add a new traveler
  const createTravelerMutation = useMutation({
    mutationFn: async ({ event_name, travel_date, content }) => {
      console.log("[useTravelers] Creating note...", { event_name, travel_date, content, collectionId, walletAddress });

      if (!clientResult || !collectionId || !walletAddress) {
        throw new Error("Not ready - missing client, collection, or wallet");
      }
      const { nillionClient, nildbTokens } = clientResult;

      const now = new Date().toISOString();
      const travelerData = {
        _id: crypto.randomUUID(),
        walletAddress: walletAddress.toLowerCase(),    // Plaintext - for filtering
        event_name,                                    // Plaintext
        travel_date,
        content: ensureAllot(content),                 // ENCRYPTED - secret shared across nodes
        createdAt: now,
        updatedAt: now,
      };

      console.log("[useTravelers] Sending to nilDB (content will be encrypted):", travelerData);

      const result = await nillionClient.createStandardData(
        {
          collection: collectionId,
          data: [travelerData],
        },
        { auth: { invocations: nildbTokens } }
      );

      console.log("[useTravelers] Create result:", result);
      return travelerData;
    },
    onSuccess: () => {
      console.log("[useTravelers] Note created successfully!");
      queryClient.invalidateQueries({ queryKey: ["travelers", collectionId, walletAddress] });
    },
    onError: (error) => {
      console.error("[useTravelers] Failed to create traveler:");
      console.error("Error type:", typeof error);
      console.error("Error stringified:", JSON.stringify(error, null, 2));
      if (Array.isArray(error)) {
        error.forEach((e, i) => console.error(`Node ${i} error:`, e));
      }
    },
  });

  // DELETE: Remove a traveler
  const deleteTravelerMutation = useMutation({
    mutationFn: async (id) => {
      if (!clientResult || !collectionId) {
        throw new Error("Not ready");
      }
      const { nillionClient, nildbTokens } = clientResult;

      await nillionClient.deleteData(
        {
          collection: collectionId,
          filter: { _id: id },
        },
        { auth: { invocations: nildbTokens } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travelers", collectionId, walletAddress] });
    },
  });


  return {
    // Data
    travelers: travelersQuery.data || [],
    collectionId,

    // Loading states
    isLoading: isCollectionLoading || travelersQuery.isLoading,
    isCollectionLoading,
    isCollectionReady,

    // Error states
    isError: travelersQuery.isError || !!collectionError,
    error: travelersQuery.error || collectionError,

    // Mutations
    createTraveler: createTravelerMutation.mutate,
    deleteTraveler: deleteTravelerMutation.mutate,

    // Mutation states
    isCreating: createTravelerMutation.isPending,
    isDeleting: deleteTravelerMutation.isPending,

    // Mutation errors
    createError: createTravelerMutation.error,
    deleteError: deleteTravelerMutation.error,

    // Refetch
    refetch: travelersQuery.refetch,
  };
}

/**
 * Normalize any content value to the %allot shape that NilDB expects.
 * Guards against callers accidentally passing a plain string or an empty object.
 */
function ensureAllot(content) {
  if (content && typeof content === "object" && "%allot" in content && typeof content["%allot"] === "string") {
    return content;
  }
  return { "%allot": typeof content === "string" ? content : "" };
}
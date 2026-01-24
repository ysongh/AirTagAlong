import { useQuery } from "@tanstack/react-query";
import { useNillionClient } from "./useNillionClient";
import { useTravelersCollection } from "./useTravelersCollection";
import { useNillion } from "./useNillion";

export function useTravelers() {
  const clientResult = useNillionClient();
  const { state } = useNillion();
  const { data: collectionId, isSuccess: isCollectionReady, isLoading: isCollectionLoading, error: collectionError } = useTravelersCollection();
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

    // Refetch
    refetch: travelersQuery.refetch,
  };
}
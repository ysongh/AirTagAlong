import { useQuery } from "@tanstack/react-query";
import { useNillionClient } from "./useNillionClient";
import { useNotesCollection } from "./useNotesCollection";
import { useNillion } from "./useNillion";

export function useNotes() {
  const clientResult = useNillionClient();
  const { state } = useNillion();
  const { data: collectionId, isSuccess: isCollectionReady, isLoading: isCollectionLoading, error: collectionError } = useNotesCollection();
  const walletAddress = state.wallets.metaMaskAddress;

  // READ: Fetch all notes for this wallet
  const notesQuery = useQuery({
    queryKey: ["notes", collectionId, walletAddress],
    queryFn: async () => {
      if (!clientResult || !collectionId || !walletAddress) {
        throw new Error("Not ready");
      }
      const { nillionClient, nildbTokens } = clientResult;

      console.log("[useNotes] findData - tokens available:", Object.keys(nildbTokens).length);

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
    notes: notesQuery.data || [],
    collectionId,

    // Loading states
    isLoading: isCollectionLoading || notesQuery.isLoading,
    isCollectionLoading,
    isCollectionReady,

    // Error states
    isError: notesQuery.isError || !!collectionError,
    error: notesQuery.error || collectionError,

    // Refetch
    refetch: notesQuery.refetch,
  };
}

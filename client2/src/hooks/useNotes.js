import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNillionClient } from "./useNillionClient";
import { useNotesCollection } from "./useNotesCollection";
import { useNillion } from "./useNillion";

export function useNotes() {
  const clientResult = useNillionClient();
  const { state } = useNillion();
  const { data: collectionId, isSuccess: isCollectionReady, isLoading: isCollectionLoading, error: collectionError } = useNotesCollection();
  const queryClient = useQueryClient();
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

  // CREATE: Add a new note
  const createNoteMutation = useMutation({
    mutationFn: async ({ title, content }) => {
      console.log("[useNotes] Creating note...", { title, content, collectionId, walletAddress });

      if (!clientResult || !collectionId || !walletAddress) {
        throw new Error("Not ready - missing client, collection, or wallet");
      }
      const { nillionClient, nildbTokens } = clientResult;

      const now = new Date().toISOString();
      const noteData = {
        _id: crypto.randomUUID(),
        walletAddress: walletAddress.toLowerCase(),  // Plaintext - for filtering
        title,                                        // Plaintext
        content: ensureAllot(content),                // ENCRYPTED - secret shared across nodes
        createdAt: now,
        updatedAt: now,
      };

      console.log("[useNotes] Sending to nilDB (content will be encrypted):", noteData);

      const result = await nillionClient.createStandardData(
        {
          collection: collectionId,
          data: [noteData],
        },
        { auth: { invocations: nildbTokens } }
      );

      console.log("[useNotes] Create result:", result);
      return noteData;
    },
    onSuccess: () => {
      console.log("[useNotes] Note created successfully!");
      queryClient.invalidateQueries({ queryKey: ["notes", collectionId, walletAddress] });
    },
    onError: (error) => {
      console.error("[useNotes] Failed to create note:");
      console.error("Error type:", typeof error);
      console.error("Error stringified:", JSON.stringify(error, null, 2));
      if (Array.isArray(error)) {
        error.forEach((e, i) => console.error(`Node ${i} error:`, e));
      }
    },
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

    // Mutations
    createNote: createNoteMutation.mutate,

    // Mutation states
    isCreating: createNoteMutation.isPending,

    // Mutation errors
    createError: createNoteMutation.error,

    // Refetch
    refetch: notesQuery.refetch,
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
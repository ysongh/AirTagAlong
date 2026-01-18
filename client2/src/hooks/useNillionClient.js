import { useSessionQuery } from "./useSessionQuery";

export function useNillionClient() {
  const { data: session, isSuccess } = useSessionQuery();

  if (!isSuccess || !session?.nillionClient || !session?.nildbTokens) {
    return null;
  }

  return {
    nillionClient: session.nillionClient,
    nildbTokens: session.nildbTokens,
  };
}

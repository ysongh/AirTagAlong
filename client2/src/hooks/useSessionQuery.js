import { useQuery } from "@tanstack/react-query";

export const useSessionQuery = () => {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => {
      throw new Error("Session query should be populated manually via queryClient.setQueryData");
    },
    enabled: false,
    staleTime: Infinity,
    retry: false,
  });
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateRewriteRequest } from "@shared/routes";

export function useRewrites() {
  return useQuery({
    queryKey: [api.rewrites.list.path],
    queryFn: async () => {
      const res = await fetch(api.rewrites.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch rewrites");
      return api.rewrites.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateRewrite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateRewriteRequest) => {
      const validated = api.rewrites.create.input.parse(data);
      const res = await fetch(api.rewrites.create.path, {
        method: api.rewrites.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.rewrites.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to generate rewrite");
      }
      return api.rewrites.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.rewrites.list.path] }),
  });
}

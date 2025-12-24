import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateBrandVoiceRequest, type UpdateBrandVoiceRequest } from "@shared/routes";

export function useBrandVoices() {
  return useQuery({
    queryKey: [api.brandVoices.list.path],
    queryFn: async () => {
      const res = await fetch(api.brandVoices.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch brand voices");
      return api.brandVoices.list.responses[200].parse(await res.json());
    },
  });
}

export function useBrandVoice(id: number) {
  return useQuery({
    queryKey: [api.brandVoices.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.brandVoices.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch brand voice");
      return api.brandVoices.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateBrandVoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBrandVoiceRequest) => {
      const validated = api.brandVoices.create.input.parse(data);
      const res = await fetch(api.brandVoices.create.path, {
        method: api.brandVoices.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.brandVoices.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create brand voice");
      }
      return api.brandVoices.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.brandVoices.list.path] }),
  });
}

export function useUpdateBrandVoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateBrandVoiceRequest) => {
      const validated = api.brandVoices.update.input.parse(updates);
      const url = buildUrl(api.brandVoices.update.path, { id });
      const res = await fetch(url, {
        method: api.brandVoices.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update brand voice");
      return api.brandVoices.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.brandVoices.list.path] }),
  });
}

export function useDeleteBrandVoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.brandVoices.delete.path, { id });
      const res = await fetch(url, {
        method: api.brandVoices.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete brand voice");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.brandVoices.list.path] }),
  });
}

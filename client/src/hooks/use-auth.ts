import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

// Using the same API response type for all auth-related user data
// Since api.auth.check.responses[200] is z.any(), we define a minimal user interface
export interface User {
  id: number;
  username: string;
  subscriptionTier: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: [api.auth.check.path],
    queryFn: async () => {
      const res = await fetch(api.auth.check.path);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to check auth");
      return await res.json();
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      
      if (!res.ok) {
        // Parse error message if available
        try {
          const errorData = await res.json();
          throw new Error(errorData.message || "Login failed");
        } catch (e: any) {
          throw new Error(e.message || "Login failed");
        }
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.check.path], data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.auth.logout.path, {
        method: api.auth.logout.method,
      });
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.check.path], null);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      
      if (!res.ok) {
        try {
          const errorData = await res.json();
          throw new Error(errorData.message || "Registration failed");
        } catch (e: any) {
          throw new Error(e.message || "Registration failed");
        }
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.check.path], data);
    },
  });

  return {
    user,
    isLoading,
    error,
    login: loginMutation,
    logout: logoutMutation,
    register: registerMutation,
  };
}

import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect } from "react";
import { toast } from "sonner";
import { getSupabase, hasSupabaseConfig, resultOf } from "@/api/supabase";

export const authQuery = queryOptions({
  queryKey: ["auth", "me"],
  queryFn: async () => {
    if (!hasSupabaseConfig || typeof window === "undefined") return null;
    const auth = getSupabase().auth;
    const { session } = await resultOf(auth.getSession());
    if (!session) return null;
    const { user } = await resultOf(auth.getUser());
    return { id: user.id, email: user.email, full_name: user.user_metadata?.full_name };
  },
  staleTime: Infinity,
  retry: false,
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    ...authQuery,
    enabled: typeof window !== "undefined",
  });

  useEffect(() => {
    if (!hasSupabaseConfig) return;
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") queryClient.clear();
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  async function logout() {
    try {
      await resultOf(getSupabase().auth.signOut({ scope: "local" }));
      queryClient.clear();
      window.location.replace("/login");
    } catch {
      toast.error("Não foi possível sair. Tente novamente.");
    }
  }

  return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

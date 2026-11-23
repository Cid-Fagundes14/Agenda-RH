import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
let client;

export const hasSupabaseConfig = Boolean(url && key);

export function getSupabase() {
  if (typeof window === "undefined") throw new Error("O cliente da agenda só pode ser usado no navegador.");
  if (!hasSupabaseConfig) throw new Error("Configure a URL e a chave publicável do Supabase.");
  client ??= createClient(url, key, { auth: { detectSessionInUrl: false } });
  return client;
}

export async function resultOf(request) {
  const { data, error } = await request;
  if (error) throw error;
  return data;
}

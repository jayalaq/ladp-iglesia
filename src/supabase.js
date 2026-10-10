import { createClient } from "@supabase/supabase-js";

// Acepta tanto las variables VITE_* como las NEXT_PUBLIC_* que crea
// automáticamente la integración Supabase↔Vercel.
const env = import.meta.env;

// Elige la primera que sea una URL http(s) válida (ignora valores mal pegados).
const firstValidUrl = (...vals) => {
  for (const v of vals) {
    if (typeof v === "string" && /^https?:\/\/[^\s]+/.test(v.trim())) return v.trim();
  }
  return "";
};
const firstNonEmpty = (...vals) => {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
};

// Keep each URL paired with a key from the same provider. Prefer the
// explicit VITE_* pair shared by Vercel and GitHub Actions builds.
const supabaseConfig = [
  [env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY],
  [env.SUPABASE_URL, firstNonEmpty(env.SUPABASE_ANON_KEY, env.SUPABASE_PUBLISHABLE_KEY)],
  [env.NEXT_PUBLIC_SUPABASE_URL, firstNonEmpty(env.NEXT_PUBLIC_SUPABASE_ANON_KEY, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)],
]
  .map(([url, key]) => [firstValidUrl(url), firstNonEmpty(key)])
  .find(([url, key]) => url && key) || ["", ""];
const [supabaseUrl, supabaseAnonKey] = supabaseConfig;

let client = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("No se pudo inicializar Supabase:", e?.message || e);
    client = null;
  }
}

export const supabase = client;

export const isSupabaseConfigured = () => !!supabase;

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

// La URL y la clave deben venir de la MISMA fuente para que coincidan.
// Se prioriza la pareja VITE_* (configurada a mano con el proyecto oficial de la iglesia);
// la pareja NEXT_PUBLIC_* de la integración Supabase↔Vercel queda solo como respaldo.
const vitePar = firstValidUrl(env.VITE_SUPABASE_URL) && firstNonEmpty(env.VITE_SUPABASE_ANON_KEY);
const supabaseUrl = vitePar
  ? firstValidUrl(env.VITE_SUPABASE_URL)
  : firstValidUrl(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_URL);
const supabaseAnonKey = vitePar
  ? firstNonEmpty(env.VITE_SUPABASE_ANON_KEY)
  : firstNonEmpty(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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

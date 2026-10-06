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
// Se prioriza la pareja de la integración Supabase↔Vercel (NEXT_PUBLIC_*),
// que siempre está emparejada, y solo como último recurso las VITE_* manuales.
const supabaseUrl = firstValidUrl(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_URL,
  env.VITE_SUPABASE_URL
);
const supabaseAnonKey = firstNonEmpty(
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  env.VITE_SUPABASE_ANON_KEY
);

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

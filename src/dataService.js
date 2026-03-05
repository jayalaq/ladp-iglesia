import { supabase, isSupabaseConfigured } from "./supabase";

// ─── TABLE MAP ─────────────────────────────────────────────────────
// Maps frontend keys to Supabase table names
const TABLE_MAP = {
  miembros: "miembros",
  donaciones: "donaciones",
  proyectos: "proyectos",
  eventos: "eventos",
  asistencia: "asistencia",
  celulas: "celulas",
  ministerios: "ministerios",
  productos: "productos",
  publicaciones: "publicaciones",
  gastos: "gastos",
};

// ─── FETCH ALL ─────────────────────────────────────────────────────
export async function fetchAll(key) {
  if (!isSupabaseConfigured()) return null;
  const table = TABLE_MAP[key];
  if (!table) return null;
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error(`Error fetching ${key}:`, error.message);
    return null;
  }
  return data;
}

// ─── INSERT ────────────────────────────────────────────────────────
export async function insertRow(key, row) {
  if (!isSupabaseConfigured()) return null;
  const table = TABLE_MAP[key];
  if (!table) return null;
  const { data, error } = await supabase
    .from(table)
    .insert(row)
    .select()
    .single();
  if (error) {
    console.error(`Error inserting into ${key}:`, error.message);
    return null;
  }
  return data;
}

// ─── UPDATE ────────────────────────────────────────────────────────
export async function updateRow(key, id, updates) {
  if (!isSupabaseConfigured()) return null;
  const table = TABLE_MAP[key];
  if (!table) return null;
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error(`Error updating ${key}:`, error.message);
    return null;
  }
  return data;
}

// ─── DELETE ────────────────────────────────────────────────────────
export async function deleteRow(key, id) {
  if (!isSupabaseConfigured()) return null;
  const table = TABLE_MAP[key];
  if (!table) return null;
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) {
    console.error(`Error deleting from ${key}:`, error.message);
    return false;
  }
  return true;
}

// ─── LOAD ALL DATA ─────────────────────────────────────────────────
// Loads all tables at once, returns null values for tables that fail
export async function loadAllData() {
  if (!isSupabaseConfigured()) return null;
  const keys = Object.keys(TABLE_MAP);
  const results = await Promise.all(keys.map((k) => fetchAll(k)));
  const data = {};
  keys.forEach((k, i) => {
    data[k] = results[i];
  });
  return data;
}

// ─── AUTH ──────────────────────────────────────────────────────────
export async function signIn(email, password) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error("Login error:", error.message);
    return null;
  }
  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!isSupabaseConfigured()) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

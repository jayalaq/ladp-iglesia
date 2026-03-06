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

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
  if (error) { console.error("Google login error:", error.message); return null; }
  return data;
}

export async function signUp(email, password, nombre) {
  if (!isSupabaseConfigured()) return { error: "Supabase no configurado" };
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };
  if (data.user) {
    await supabase.from("user_profiles").insert({ id: data.user.id, nombre, rol: "usuario" });
  }
  return { data, needsConfirmation: !data.session };
}

export async function getUserProfile() {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from("user_profiles").select("*").eq("id", user.id).single();
  if (error || !data) {
    const nombre = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario";
    await supabase.from("user_profiles").insert({ id: user.id, nombre, rol: "usuario", email: user.email });
    return { id: user.id, nombre, rol: "usuario", email: user.email };
  }
  if (data.email !== user.email) {
    await supabase.from("user_profiles").update({ email: user.email }).eq("id", user.id);
  }
  return { ...data, email: user.email };
}

export async function getUsers() {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("Error fetching users:", error.message); return []; }
  return data || [];
}

export async function updateUserRole(userId, rol) {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase
    .from("user_profiles")
    .update({ rol })
    .eq("id", userId);
  if (error) { console.error("Error updating role:", error.message); return false; }
  return true;
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured()) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
}

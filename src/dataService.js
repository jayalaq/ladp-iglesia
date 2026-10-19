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
  cronograma: "cronograma_adolescentes",
  actas: "actas_adolescentes",
  peticiones: "peticiones_oracion",
  mensajes: "mensajes_contacto",
  pedidos: "pedidos_tienda",
  integrantes: "teens_integrantes",
  asistenciaTeens: "teens_asistencia",
};

// Tablas que se cargan en el panel (configuracion se lee aparte con getConfig)
const PANEL_KEYS = Object.keys(TABLE_MAP);

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
    console.error(`Error fetching ${key}:`, { message: error.message, code: error.code, details: error.details, hint: error.hint });
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
    console.error(`Error inserting into ${key}:`, { message: error.message, code: error.code, details: error.details, hint: error.hint });
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
    console.error(`Error updating ${key}:`, { message: error.message, code: error.code, details: error.details, hint: error.hint });
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

// ─── ENVÍO PÚBLICO (sin sesión) ────────────────────────────────────
// Para formularios de visitantes: el visitante puede insertar pero no leer la tabla,
// así que no se pide la fila de vuelta (.select() fallaría por RLS).
export async function enviarPublico(key, row) {
  if (!isSupabaseConfigured()) return false;
  const table = TABLE_MAP[key];
  if (!table) return false;
  const { error } = await supabase.from(table).insert(row);
  if (error) {
    console.error(`Error enviando a ${key}:`, { message: error.message, code: error.code });
    return false;
  }
  return true;
}

// ─── CONFIGURACIÓN DE LA IGLESIA ───────────────────────────────────
export async function getConfig() {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("configuracion").select("datos").eq("id", "general").maybeSingle();
  if (error) { console.error("Error leyendo configuración:", error.message); return null; }
  return data?.datos || null;
}

export async function saveConfig(datos) {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from("configuracion").upsert({ id: "general", datos, updated_at: new Date().toISOString() });
  if (error) { console.error("Error guardando configuración:", error.message); return false; }
  return true;
}

// ─── UPSERT / REMOVE ───────────────────────────────────────────────
export async function upsertRecord(key, item, isNew) {
  const { created_at, ...rest } = item;
  if (isNew) return insertRow(key, rest);
  const { id, ...updates } = rest;
  return updateRow(key, id, updates);
}

export async function removeRecord(key, id) {
  return deleteRow(key, id);
}

// ─── LOAD ALL DATA ─────────────────────────────────────────────────
// Loads all tables at once, returns null values for tables that fail
export async function loadAllData() {
  if (!isSupabaseConfigured()) return null;
  const keys = PANEL_KEYS;
  const results = await Promise.all(keys.map((k) => fetchAll(k)));
  const data = {};
  keys.forEach((k, i) => {
    data[k] = results[i];
  });
  return data;
}

// ─── AUTH ──────────────────────────────────────────────────────────
// Evita que una llamada de red quede colgada indefinidamente.
function withTimeout(promise, ms, fallback) {
  return Promise.race([
    Promise.resolve(promise),
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export async function signIn(email, password) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }),
      15000,
      { data: null, error: { message: "Tiempo de espera agotado" } }
    );
    if (error) {
      console.error("Login error:", error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.error("Login error:", e);
    return null;
  }
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

export async function signInWithGoogle(volverA = "/panel") {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    // Volver directo al panel (debe estar permitido en Supabase → Auth → Redirect URLs: <origen>/**)
    options: { redirectTo: `${window.location.origin}${volverA}` },
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
  try {
    const { data: { user } } = await withTimeout(supabase.auth.getUser(), 10000, { data: { user: null } });
    if (!user) return null;
    const foto = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
    const fallback = {
      id: user.id,
      foto,
      nombre: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario",
      rol: "usuario",
      estado: "pendiente",
      permisos: {},
      email: user.email,
    };
    // La consulta del perfil no debe colgar el login (p.ej. RLS mal configurada)
    const { data, error } = await withTimeout(
      supabase.from("user_profiles").select("*").eq("id", user.id).single(),
      8000,
      { data: null, error: { message: "Tiempo de espera agotado" } }
    );
    if (error || !data) {
      // Intento de crear el perfil en segundo plano, sin bloquear el ingreso
      Promise.resolve(supabase.from("user_profiles").insert({ id: user.id, nombre: fallback.nombre, rol: "usuario", email: user.email })).catch(() => {});
      return fallback;
    }
    if (data.email !== user.email) {
      Promise.resolve(supabase.from("user_profiles").update({ email: user.email }).eq("id", user.id)).catch(() => {});
    }
    return { ...data, email: user.email, foto };
  } catch (e) {
    console.error("Profile error:", e);
    return null;
  }
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

// Estado (pendiente / activo / bloqueado) y permisos por sección; solo el Super Administrador
export async function updateUserAccess(userId, { estado, permisos }) {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase
    .from("user_profiles")
    .update({ estado, permisos })
    .eq("id", userId);
  if (error) { console.error("Error updating access:", error.message); return false; }
  return true;
}

// ─── INVITACIONES (correos autorizados antes de su primer ingreso) ──
export async function getInvitaciones() {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from("invitaciones").select("*").order("created_at", { ascending: false });
  if (error) { console.error("Error fetching invitaciones:", error.message); return []; }
  return data || [];
}

export async function guardarInvitacion({ email, nombre, permisos }) {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from("invitaciones").upsert({ email: email.trim().toLowerCase(), nombre, permisos });
  if (error) { console.error("Error guardando invitación:", error.message); return false; }
  return true;
}

export async function borrarInvitacion(email) {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from("invitaciones").delete().eq("email", email);
  if (error) { console.error("Error borrando invitación:", error.message); return false; }
  return true;
}

// ─── REGISTRO POR ENLACE (/unirse/<código>) ────────────────────────
export async function infoEnlace(codigo) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.rpc("info_enlace", { p_codigo: codigo });
  if (error) { console.error("Error leyendo enlace:", error.message); return null; }
  return data;
}

// Devuelve { tipo } o { error } con el mensaje que explica qué corregir
export async function registrarse(codigo, datos) {
  if (!isSupabaseConfigured()) return { error: "Supabase no configurado" };
  const { data, error } = await supabase.rpc("registrarse", { p_codigo: codigo, p_datos: datos });
  if (error) return { error: error.message };
  return { tipo: data };
}

export async function cumpleanosMes() {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.rpc("cumpleanos_mes");
  if (error) { console.error("Error leyendo cumpleaños:", error.message); return []; }
  return data || [];
}

export async function getEnlaces() {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from("enlaces_registro").select("*");
  if (error) { console.error("Error leyendo enlaces:", error.message); return []; }
  return data || [];
}

export async function guardarEnlace(enlace) {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from("enlaces_registro").upsert({ ...enlace, updated_at: new Date().toISOString() });
  if (error) { console.error("Error guardando enlace:", error.message); return false; }
  return true;
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured()) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
}

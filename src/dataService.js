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
  evaluaciones: "evaluaciones_teens",
  campanas: "campanas",
  campana_requerimientos: "campana_requerimientos",
  campana_colaboraciones: "campana_colaboraciones",
  campana_entregas: "campana_entregas",
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
    console.error(`Error fetching ${key}:`, { message: error.message, code: error.code, details: error.details, hint: error.hint });
    throw new Error(`No se pudo cargar ${key}`);
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
    throw new Error(`No se pudo guardar ${key}`);
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
    throw new Error(`No se pudo actualizar ${key}`);
  }
  return data;
}

// ─── DELETE ────────────────────────────────────────────────────────
export async function deleteRow(key, id) {
  if (!isSupabaseConfigured()) return null;
  const table = TABLE_MAP[key];
  if (!table) return null;
  const { data, error } = await supabase.from(table).delete().eq("id", id).select("id");
  if (!error && !data?.length) throw new Error(`No se eliminó ${key}: sin permiso o el registro no existe`);
  if (error) {
    console.error(`Error deleting from ${key}:`, { message: error.message, code: error.code, details: error.details, hint: error.hint });
    throw new Error(`No se pudo eliminar ${key}`);
  }
  return true;
}

// ─── UPSERT / REMOVE ───────────────────────────────────────────────
export async function upsertRecord(key, item, isNew) {
  const { created_at, ...raw } = item;
  // Las columnas DATE no aceptan "": se guardan como null.
  const rest = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v === "" && /^(fecha|inicio$|fin$|desde$)/.test(k) ? null : v]));
  if (isNew) return insertRow(key, rest);
  const { id, ...updates } = rest;
  return updateRow(key, id, updates);
}

export async function removeRecord(key, id) {
  return deleteRow(key, id);
}

export async function fetchPublicCampaign(slug) {
  if (!isSupabaseConfigured()) throw new Error("La plataforma no tiene conexión con Supabase.");
  const { data: campaign, error: campaignError } = await supabase
    .from("campanas")
    .select("id, slug, titulo, descripcion, fecha_evento, fecha_limite, estado")
    .eq("slug", slug)
    .eq("estado", "abierta")
    .maybeSingle();
  if (campaignError) {
    console.error("Error fetching public campaign:", { message: campaignError.message, code: campaignError.code });
    throw new Error("No se pudo cargar la campaña.");
  }
  if (!campaign) return null;

  const { data: needs, error: needsError } = await supabase
    .from("campana_requerimientos")
    .select("id, nombre, tipo, unidad, objetivo")
    .eq("campana_id", campaign.id)
    .order("created_at", { ascending: true });
  if (needsError) {
    console.error("Error fetching public campaign needs:", { message: needsError.message, code: needsError.code });
    throw new Error("No se pudieron cargar los requerimientos.");
  }
  return { ...campaign, requerimientos: needs || [] };
}

export async function submitPublicCampaignContribution(contribution) {
  if (!isSupabaseConfigured()) throw new Error("El registro de colaboraciones no está disponible.");
  const { error } = await supabase.from("campana_colaboraciones").insert({
    id: contribution.id,
    referencia: contribution.referencia,
    campana_id: contribution.campana_id,
    requerimiento_id: contribution.requerimiento_id,
    nombre_colaborador: contribution.nombre_colaborador,
    telefono: contribution.telefono || null,
    correo: contribution.correo || null,
    cantidad: contribution.cantidad,
    nota: contribution.nota || null,
    estado: "pendiente",
  });
  if (error) {
    console.error("Error submitting public campaign contribution:", { message: error.message, code: error.code });
    throw new Error("No se pudo registrar la colaboración. Verifica los datos e inténtalo nuevamente.");
  }
  return true;
}

// ─── LOAD DATA FOR ROLE ────────────────────────────────────────────
// RLS remains the security boundary; this limits unnecessary requests.
export async function loadAllData(role = "usuario") {
  if (!isSupabaseConfigured()) return null;
  const keysByRole = {
    admin: Object.keys(TABLE_MAP),
    teens: ["cronograma", "actas", "peticiones", "evaluaciones"],
    usuario: ["miembros", "eventos", "publicaciones", "cronograma"],
  };
  const keys = keysByRole[role] || keysByRole.usuario;
  const results = await Promise.allSettled(keys.map((k) => fetchAll(k)));
  const data = {};
  const errors = [];
  keys.forEach((key, index) => {
    const result = results[index];
    if (result.status === "fulfilled") data[key] = result.value;
    else errors.push(key);
  });
  return { data, errors };
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

export async function requestPasswordReset(email) {
  if (!isSupabaseConfigured()) throw new Error("Supabase no está configurado");
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login?recovery=1`,
  });
  if (error) {
    console.error("Password reset request error:", error.message);
    throw new Error("No se pudo enviar el enlace de recuperación");
  }
}

export async function updatePassword(password) {
  if (!isSupabaseConfigured()) throw new Error("Supabase no está configurado");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("Password update error:", error.message);
    throw new Error("No se pudo actualizar la contraseña");
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

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    // Volver directo al panel (debe estar permitido en Supabase → Auth → Redirect URLs: <origen>/**)
    options: { redirectTo: `${window.location.origin}/panel` },
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
    const fallback = {
      id: user.id,
      nombre: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario",
      rol: "usuario",
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
    return { ...data, email: user.email };
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

export async function updateUserRole(userId, rol) {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase
    .from("user_profiles")
    .update({ rol })
    .eq("id", userId);
  if (error) { console.error("Error updating role:", error.message); return false; }
  return true;
}

export async function getChurchSettings() {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("church_settings")
    .select("config")
    .eq("id", true)
    .maybeSingle();
  if (error) {
    console.error("Error fetching church settings:", { message: error.message, code: error.code, details: error.details, hint: error.hint });
    throw new Error("No se pudo cargar la configuración de la iglesia");
  }
  return data?.config || null;
}

export async function saveChurchSettings(config) {
  if (!isSupabaseConfigured()) throw new Error("Supabase no está configurado");
  const { data, error } = await supabase
    .from("church_settings")
    .upsert({ id: true, config }, { onConflict: "id" })
    .select("config")
    .single();
  if (error) {
    console.error("Error saving church settings:", { message: error.message, code: error.code, details: error.details, hint: error.hint });
    throw new Error("No se pudo guardar la configuración de la iglesia");
  }
  return data.config;
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured()) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
}

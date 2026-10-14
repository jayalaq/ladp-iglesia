-- ═══════════════════════════════════════════════════════════════════
-- LADP — ACCESOS POR SECCIÓN + INVITACIONES POR GMAIL · Seguro de re-ejecutar
-- Ejecutar DESPUÉS de supabase-seguridad-roles.sql y supabase-integracion.sql
--
--  1. Cada perfil tiene un estado (pendiente / activo / bloqueado) y permisos por sección:
--     {"adolescentes": "editar", "eventos": "ver", ...}
--  2. Invitaciones: el Super Administrador autoriza un correo (p. ej. Gmail) antes de que la
--     persona entre; al iniciar sesión con Google recibe esos permisos automáticamente.
--     Quien entra sin invitación queda "pendiente" hasta que el administrador lo apruebe.
--  3. Las políticas de cada tabla usan tiene_acceso(seccion): la base de datos respeta los checks.
--  El Super Administrador (rol = 'admin') siempre tiene acceso total.
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. PERFILES: ESTADO Y PERMISOS ─────────────────────────────────
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS estado TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS permisos JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Usuarios que ya existían conservan lo que veían antes (solo filas sin estado: la primera vez)
UPDATE user_profiles SET estado = 'activo', permisos = '{"adolescentes": "editar"}'::jsonb
WHERE estado IS NULL AND rol = 'teens';
UPDATE user_profiles SET estado = 'activo',
  permisos = '{"mi-perfil": "ver", "eventos": "ver", "adolescentes": "ver", "evangelismo": "ver", "blog": "ver"}'::jsonb
WHERE estado IS NULL AND rol = 'usuario';
UPDATE user_profiles SET estado = 'activo' WHERE estado IS NULL;

ALTER TABLE user_profiles ALTER COLUMN estado SET DEFAULT 'pendiente';
ALTER TABLE user_profiles ALTER COLUMN estado SET NOT NULL;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_estado_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_estado_check CHECK (estado IN ('pendiente', 'activo', 'bloqueado'));

CREATE OR REPLACE FUNCTION tiene_acceso(seccion TEXT, editar BOOLEAN DEFAULT FALSE)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
      AND (rol = 'admin' OR (estado = 'activo' AND (
        permisos ->> seccion = 'editar' OR (NOT editar AND permisos ->> seccion = 'ver')
      )))
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- El equipo de Adolescentes ahora se define con el check "Adolescentes · Editar"
CREATE OR REPLACE FUNCTION puede_editar_teens()
RETURNS BOOLEAN AS $$
  SELECT tiene_acceso('adolescentes', TRUE);
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ─── 2. INVITACIONES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invitaciones (
  email TEXT PRIMARY KEY CHECK (email = lower(email) AND email LIKE '%@%'),
  nombre TEXT,
  permisos JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE invitaciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin gestiona invitaciones" ON invitaciones;
CREATE POLICY "Admin gestiona invitaciones" ON invitaciones FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Al crear un perfil: aplica la invitación de su correo; sin invitación queda pendiente.
-- Se ignora lo que envíe el navegador, así nadie puede darse permisos a sí mismo.
CREATE OR REPLACE FUNCTION aplicar_invitacion()
RETURNS TRIGGER AS $$
DECLARE
  v_email TEXT;
  v_inv invitaciones%ROWTYPE;
BEGIN
  SELECT lower(coalesce(raw_user_meta_data ->> 'email', email)) INTO v_email FROM auth.users WHERE id = NEW.id;
  SELECT * INTO v_inv FROM invitaciones
  WHERE email IN (v_email, lower((SELECT email FROM auth.users WHERE id = NEW.id)));
  NEW.rol := 'usuario';
  IF v_inv.email IS NOT NULL THEN
    NEW.estado := 'activo';
    NEW.permisos := v_inv.permisos;
    NEW.nombre := coalesce(nullif(v_inv.nombre, ''), NEW.nombre);
    DELETE FROM invitaciones WHERE email = v_inv.email;
  ELSE
    NEW.estado := 'pendiente';
    NEW.permisos := '{}'::jsonb;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS aplicar_invitacion ON user_profiles;
CREATE TRIGGER aplicar_invitacion BEFORE INSERT ON user_profiles FOR EACH ROW EXECUTE FUNCTION aplicar_invitacion();

-- Crear el perfil en cuanto la cuenta se registra (Google o correo)
CREATE OR REPLACE FUNCTION crear_perfil_nuevo()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nombre, email)
  VALUES (NEW.id, coalesce(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1), 'Usuario'), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS crear_perfil_nuevo ON auth.users;
CREATE TRIGGER crear_perfil_nuevo AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION crear_perfil_nuevo();

-- Si se invita a un correo que ya tiene cuenta, se le aplican los permisos directamente
CREATE OR REPLACE FUNCTION invitar_cuenta_existente()
RETURNS TRIGGER AS $$
DECLARE v_id UUID;
BEGIN
  SELECT u.id INTO v_id FROM auth.users u JOIN user_profiles p ON p.id = u.id
  WHERE p.rol <> 'admin' AND (lower(u.email) = NEW.email OR lower(u.raw_user_meta_data ->> 'email') = NEW.email)
  LIMIT 1;
  IF v_id IS NULL THEN RETURN NEW; END IF;
  UPDATE user_profiles SET estado = 'activo', permisos = NEW.permisos,
    nombre = coalesce(nullif(NEW.nombre, ''), nombre)
  WHERE id = v_id;
  RETURN NULL; -- no se guarda la invitación: ya quedó aplicada
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS invitar_cuenta_existente ON invitaciones;
CREATE TRIGGER invitar_cuenta_existente BEFORE INSERT ON invitaciones FOR EACH ROW EXECUTE FUNCTION invitar_cuenta_existente();

-- Rol, estado y permisos solo los cambia el Super Administrador (o este SQL Editor)
CREATE OR REPLACE FUNCTION proteger_rol()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT is_admin() AND (
    NEW.rol IS DISTINCT FROM OLD.rol OR NEW.estado IS DISTINCT FROM OLD.estado OR NEW.permisos IS DISTINCT FROM OLD.permisos
  ) THEN
    RAISE EXCEPTION 'Solo el Super Administrador puede cambiar accesos';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ─── 3. POLÍTICAS POR SECCIÓN ───────────────────────────────────────
-- Gestión (crear / editar / borrar): requiere el check de esa sección
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('miembros', 'miembros'), ('donaciones', 'finanzas'), ('gastos', 'finanzas'), ('proyectos', 'proyectos'),
    ('eventos', 'eventos'), ('asistencia', 'asistencia'), ('celulas', 'celulas'), ('ministerios', 'ministerios'),
    ('productos', 'tienda'), ('publicaciones', 'blog')
  ) AS t(tabla, seccion) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admin insert" ON %I', r.tabla);
    EXECUTE format('DROP POLICY IF EXISTS "Admin update" ON %I', r.tabla);
    EXECUTE format('DROP POLICY IF EXISTS "Admin delete" ON %I', r.tabla);
    EXECUTE format('DROP POLICY IF EXISTS "Acceso insert" ON %I', r.tabla);
    EXECUTE format('DROP POLICY IF EXISTS "Acceso update" ON %I', r.tabla);
    EXECUTE format('DROP POLICY IF EXISTS "Acceso delete" ON %I', r.tabla);
    EXECUTE format('CREATE POLICY "Acceso insert" ON %I FOR INSERT WITH CHECK (tiene_acceso(%L, TRUE))', r.tabla, r.seccion);
    EXECUTE format('CREATE POLICY "Acceso update" ON %I FOR UPDATE USING (tiene_acceso(%L, TRUE)) WITH CHECK (tiene_acceso(%L, TRUE))', r.tabla, r.seccion, r.seccion);
    EXECUTE format('CREATE POLICY "Acceso delete" ON %I FOR DELETE USING (tiene_acceso(%L, TRUE))', r.tabla, r.seccion);
  END LOOP;
END $$;

-- Lectura de datos internos: solo con acceso a la sección (antes bastaba con tener sesión)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('donaciones', 'finanzas'), ('gastos', 'finanzas'), ('proyectos', 'proyectos'), ('asistencia', 'asistencia'),
    ('celulas', 'celulas'), ('ministerios', 'ministerios'), ('cronograma_adolescentes', 'adolescentes')
  ) AS t(tabla, seccion) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Lectura" ON %I', r.tabla);
    EXECUTE format('CREATE POLICY "Lectura" ON %I FOR SELECT USING (tiene_acceso(%L))', r.tabla, r.seccion);
  END LOOP;
END $$;
-- Miembros: con acceso a la sección, o cada persona su propio registro
DROP POLICY IF EXISTS "Lectura" ON miembros;
CREATE POLICY "Lectura" ON miembros FOR SELECT
  USING (tiene_acceso('miembros') OR lower(email) = lower(auth.jwt() ->> 'email'));

-- Bandeja y pedidos
DROP POLICY IF EXISTS "Admin gestiona mensajes" ON mensajes_contacto;
DROP POLICY IF EXISTS "Acceso gestiona mensajes" ON mensajes_contacto;
CREATE POLICY "Acceso gestiona mensajes" ON mensajes_contacto FOR ALL
  USING (tiene_acceso('bandeja', TRUE)) WITH CHECK (tiene_acceso('bandeja', TRUE));
DROP POLICY IF EXISTS "Admin gestiona pedidos" ON pedidos_tienda;
DROP POLICY IF EXISTS "Acceso gestiona pedidos" ON pedidos_tienda;
CREATE POLICY "Acceso gestiona pedidos" ON pedidos_tienda FOR ALL
  USING (tiene_acceso('bandeja', TRUE) OR tiene_acceso('tienda', TRUE))
  WITH CHECK (tiene_acceso('bandeja', TRUE) OR tiene_acceso('tienda', TRUE));
-- configuracion e invitaciones siguen siendo solo del Super Administrador

-- ─── Verificación ───────────────────────────────────────────────────
SELECT nombre, email, rol, estado, permisos FROM user_profiles ORDER BY created_at;

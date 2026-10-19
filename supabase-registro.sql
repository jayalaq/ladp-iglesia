-- ═══════════════════════════════════════════════════════════════════
-- LADP — REGISTRO CON GOOGLE POR ENLACE · Seguro de re-ejecutar
-- Ejecutar DESPUÉS de supabase-accesos.sql
--
--  1. Dos enlaces de registro con código (/unirse/<código>), solo el Super Administrador los ve:
--     · teens  → el adolescente completa sus datos y entra al momento con "Adolescentes · ver"
--     · equipo → la persona deja sus datos y queda Pendiente hasta que el administrador la apruebe
--  2. Datos extra del adolescente (celular, colegio, distrito, salud, permiso de los padres)
--  3. El registro se completa una sola vez por cuenta
--  4. Cumpleaños del mes para la vista de los adolescentes (solo primer nombre y día)
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. ENLACES DE REGISTRO ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enlaces_registro (
  tipo TEXT PRIMARY KEY CHECK (tipo IN ('teens', 'equipo')),
  codigo TEXT NOT NULL UNIQUE CHECK (codigo ~ '^[a-z0-9]{6,32}$'),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE enlaces_registro ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin gestiona enlaces" ON enlaces_registro;
CREATE POLICY "Admin gestiona enlaces" ON enlaces_registro FOR ALL USING (is_admin()) WITH CHECK (is_admin());

INSERT INTO enlaces_registro (tipo, codigo) VALUES
  ('teens', substr(md5(random()::text || clock_timestamp()::text), 1, 10)),
  ('equipo', substr(md5(random()::text || clock_timestamp()::text), 1, 10))
ON CONFLICT (tipo) DO NOTHING;

-- ─── 2. DATOS DEL REGISTRO ──────────────────────────────────────────
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS registrado_en TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS tipo_registro TEXT;

-- teens_integrantes: "telefono" es el celular del apoderado (así lo usa el panel)
ALTER TABLE teens_integrantes ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE teens_integrantes ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE teens_integrantes ADD COLUMN IF NOT EXISTS celular TEXT;
ALTER TABLE teens_integrantes ADD COLUMN IF NOT EXISTS colegio TEXT;
ALTER TABLE teens_integrantes ADD COLUMN IF NOT EXISTS distrito TEXT;
ALTER TABLE teens_integrantes ADD COLUMN IF NOT EXISTS salud TEXT;
ALTER TABLE teens_integrantes ADD COLUMN IF NOT EXISTS autorizacion_padres BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE teens_integrantes ADD COLUMN IF NOT EXISTS autorizacion_fecha TIMESTAMPTZ;

-- El registro (y solo él) puede asignar estado y permisos sin ser administrador
CREATE OR REPLACE FUNCTION proteger_rol()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT is_admin()
    AND coalesce(current_setting('ladp.registro', true), '') <> '1'
    AND (NEW.rol IS DISTINCT FROM OLD.rol OR NEW.estado IS DISTINCT FROM OLD.estado OR NEW.permisos IS DISTINCT FROM OLD.permisos
      OR NEW.registrado_en IS DISTINCT FROM OLD.registrado_en OR NEW.tipo_registro IS DISTINCT FROM OLD.tipo_registro)
  THEN
    RAISE EXCEPTION 'Solo el Super Administrador puede cambiar accesos';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ─── 3. FUNCIONES DEL REGISTRO ──────────────────────────────────────
-- Tipo de enlace (o NULL si no existe o está desactivado). Lo usa la página antes de iniciar sesión.
CREATE OR REPLACE FUNCTION info_enlace(p_codigo TEXT)
RETURNS TEXT AS $$
  SELECT tipo FROM enlaces_registro WHERE codigo = lower(trim(p_codigo)) AND activo;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION registrarse(p_codigo TEXT, p_datos JSONB)
RETURNS TEXT AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_tipo TEXT;
  v_email TEXT;
  v_perfil user_profiles%ROWTYPE;
  v_nombre TEXT := left(trim(coalesce(p_datos ->> 'nombre', '')), 120);
  v_celular TEXT := nullif(left(trim(coalesce(p_datos ->> 'celular', '')), 20), '');
  v_nac DATE;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Primero inicia sesión con Google'; END IF;
  SELECT tipo INTO v_tipo FROM enlaces_registro WHERE codigo = lower(trim(p_codigo)) AND activo;
  IF v_tipo IS NULL THEN RAISE EXCEPTION 'El enlace no es válido o fue desactivado'; END IF;
  IF char_length(v_nombre) < 3 THEN RAISE EXCEPTION 'Escribe tu nombre completo'; END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
  INSERT INTO user_profiles (id, nombre, email) VALUES (v_uid, v_nombre, v_email) ON CONFLICT (id) DO NOTHING;
  SELECT * INTO v_perfil FROM user_profiles WHERE id = v_uid;
  IF v_perfil.estado = 'bloqueado' THEN RAISE EXCEPTION 'Tu acceso está desactivado. Habla con el administrador.'; END IF;
  -- El registro se completa una sola vez
  IF v_perfil.registrado_en IS NOT NULL THEN RETURN v_perfil.tipo_registro; END IF;

  PERFORM set_config('ladp.registro', '1', true);

  IF v_tipo = 'teens' THEN
    BEGIN
      v_nac := (p_datos ->> 'fecha_nacimiento')::date;
    EXCEPTION WHEN others THEN
      v_nac := NULL;
    END;
    IF v_nac IS NULL OR v_nac > current_date - INTERVAL '8 years' OR v_nac < current_date - INTERVAL '25 years' THEN
      RAISE EXCEPTION 'Revisa tu fecha de nacimiento';
    END IF;
    IF char_length(trim(coalesce(p_datos ->> 'apoderado', ''))) < 3
      OR char_length(regexp_replace(coalesce(p_datos ->> 'apoderado_telefono', ''), '\D', '', 'g')) < 9 THEN
      RAISE EXCEPTION 'Completa el nombre y celular de tu papá, mamá o apoderado';
    END IF;
    IF coalesce((p_datos ->> 'autorizacion_padres')::boolean, FALSE) IS NOT TRUE THEN
      RAISE EXCEPTION 'Tu papá o mamá debe saber que te registras';
    END IF;

    INSERT INTO teens_integrantes (nombre, fecha_nacimiento, apoderado, telefono, celular, colegio, distrito, salud,
      email, user_id, autorizacion_padres, autorizacion_fecha, activo)
    VALUES (v_nombre, v_nac, left(trim(p_datos ->> 'apoderado'), 120), left(trim(p_datos ->> 'apoderado_telefono'), 20), v_celular,
      nullif(left(trim(coalesce(p_datos ->> 'colegio', '')), 120), ''), nullif(left(trim(coalesce(p_datos ->> 'distrito', '')), 80), ''),
      nullif(left(trim(coalesce(p_datos ->> 'salud', '')), 300), ''), v_email, v_uid, TRUE, NOW(), TRUE)
    ON CONFLICT (user_id) DO UPDATE SET nombre = EXCLUDED.nombre, fecha_nacimiento = EXCLUDED.fecha_nacimiento,
      apoderado = EXCLUDED.apoderado, telefono = EXCLUDED.telefono, celular = EXCLUDED.celular, colegio = EXCLUDED.colegio,
      distrito = EXCLUDED.distrito, salud = EXCLUDED.salud, autorizacion_padres = TRUE, autorizacion_fecha = NOW(), activo = TRUE;

    -- Entra al momento con "Adolescentes · ver" (sin quitar permisos que ya tuviera)
    UPDATE user_profiles SET nombre = v_nombre, telefono = v_celular, estado = 'activo',
      permisos = CASE WHEN rol = 'admin' OR permisos ->> 'adolescentes' = 'editar' THEN permisos
                      ELSE permisos || '{"adolescentes": "ver"}'::jsonb END,
      registrado_en = NOW(), tipo_registro = 'teens'
    WHERE id = v_uid;
  ELSE
    IF char_length(regexp_replace(coalesce(v_celular, ''), '\D', '', 'g')) < 9 THEN RAISE EXCEPTION 'Escribe tu celular'; END IF;
    IF char_length(trim(coalesce(p_datos ->> 'cargo', ''))) < 3 THEN RAISE EXCEPTION 'Indica tu ministerio o cargo'; END IF;
    -- Queda como estaba (Pendiente) hasta que el administrador marque sus secciones
    UPDATE user_profiles SET nombre = v_nombre, telefono = v_celular, cargo = left(trim(p_datos ->> 'cargo'), 120),
      registrado_en = NOW(), tipo_registro = 'equipo'
    WHERE id = v_uid;
  END IF;
  RETURN v_tipo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ─── 4. CUMPLEAÑOS DEL MES (vista de los adolescentes) ──────────────
-- Solo primer nombre + inicial y el día: el resto de datos de menores sigue privado
CREATE OR REPLACE FUNCTION cumpleanos_mes()
RETURNS TABLE (nombre TEXT, dia INT) AS $$
  SELECT split_part(t.nombre, ' ', 1) || CASE WHEN split_part(t.nombre, ' ', 2) <> '' THEN ' ' || left(split_part(t.nombre, ' ', 2), 1) || '.' ELSE '' END,
         extract(day FROM t.fecha_nacimiento)::int
  FROM teens_integrantes t
  WHERE t.activo AND t.fecha_nacimiento IS NOT NULL
    AND extract(month FROM t.fecha_nacimiento) = extract(month FROM NOW() AT TIME ZONE 'America/Lima')
    AND tiene_acceso('adolescentes')
  ORDER BY 2, 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

REVOKE EXECUTE ON FUNCTION registrarse(TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION info_enlace(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION registrarse(TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION cumpleanos_mes() TO authenticated;

-- ─── Verificación ───────────────────────────────────────────────────
SELECT tipo, codigo, activo FROM enlaces_registro ORDER BY tipo;

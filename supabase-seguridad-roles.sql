-- ═══════════════════════════════════════════════════════════════════
-- LADP — SEGURIDAD DE ROLES + ACTAS DE ADOLESCENTES
-- Ejecutar en Supabase → SQL Editor. Seguro de re-ejecutar.
--
-- Roles:
--   admin   → Super Administrador (UNO solo): acceso total
--   teens   → Miembro · Adolescentes: solo edita el ministerio de Adolescentes
--   usuario → Miembro: solo lectura
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. ROLES ───────────────────────────────────────────────────────
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_rol_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_rol_check CHECK (rol IN ('admin', 'teens', 'usuario'));

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND rol = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION puede_editar_teens()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND rol IN ('admin', 'teens'));
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ─── 2. PERFILES: nadie puede darse un rol a sí mismo ───────────────
DROP POLICY IF EXISTS "Crear propio perfil" ON user_profiles;
CREATE POLICY "Crear propio perfil" ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id AND rol = 'usuario');

DROP POLICY IF EXISTS "Editar propio perfil" ON user_profiles;
CREATE POLICY "Editar propio perfil" ON user_profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin()) WITH CHECK (auth.uid() = id OR is_admin());

-- El rol solo lo cambia el admin (o este SQL Editor, donde auth.uid() es NULL)
CREATE OR REPLACE FUNCTION proteger_rol()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rol IS DISTINCT FROM OLD.rol AND auth.uid() IS NOT NULL AND NOT is_admin() THEN
    RAISE EXCEPTION 'Solo el Super Administrador puede cambiar roles';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS proteger_rol ON user_profiles;
CREATE TRIGGER proteger_rol BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION proteger_rol();

-- ─── 3. UN SOLO SUPER ADMINISTRADOR ─────────────────────────────────
-- La cuenta debe existir (haber iniciado sesión al menos una vez).
DO $$
DECLARE
  v_email TEXT := 'jayala@tailoringconsult.pe';
  v_id UUID;
BEGIN
  -- Busca por email principal o por el email de Google (raw_user_meta_data), que pueden diferir
  SELECT id INTO v_id FROM auth.users
  WHERE lower(email) = lower(v_email) OR lower(raw_user_meta_data->>'email') = lower(v_email)
  ORDER BY last_sign_in_at DESC NULLS LAST LIMIT 1;
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'No existe la cuenta %. Inicia sesión una vez en la web y vuelve a ejecutar.', v_email;
  END IF;
  INSERT INTO user_profiles (id, nombre, rol, email)
  VALUES (v_id, 'Super Administrador', 'usuario', v_email)
  ON CONFLICT (id) DO NOTHING;
  UPDATE user_profiles SET rol = 'usuario' WHERE rol = 'admin' AND id <> v_id;
  UPDATE user_profiles SET rol = 'admin' WHERE id = v_id;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS un_solo_admin ON user_profiles ((rol)) WHERE rol = 'admin';

-- Usuario de pruebas: Miembro con acceso al ministerio de Adolescentes
UPDATE user_profiles SET rol = 'teens'
WHERE id = (SELECT id FROM auth.users WHERE lower(email) = 'teens@icv.pe');

-- ─── 4. ESCRITURA: solo admin en tablas generales ───────────────────
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['miembros', 'donaciones', 'gastos', 'proyectos', 'eventos', 'asistencia', 'celulas', 'ministerios', 'productos', 'publicaciones'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Auth insert" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Auth update" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Auth delete" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin insert" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin update" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin delete" ON %I', t);
    EXECUTE format('CREATE POLICY "Admin insert" ON %I FOR INSERT WITH CHECK (is_admin())', t);
    EXECUTE format('CREATE POLICY "Admin update" ON %I FOR UPDATE USING (is_admin()) WITH CHECK (is_admin())', t);
    EXECUTE format('CREATE POLICY "Admin delete" ON %I FOR DELETE USING (is_admin())', t);
  END LOOP;
END $$;

-- ─── 5. CRONOGRAMA DE ADOLESCENTES: admin + teens ───────────────────
ALTER TABLE cronograma_adolescentes ADD COLUMN IF NOT EXISTS ministerio TEXT;
ALTER TABLE cronograma_adolescentes ADD COLUMN IF NOT EXISTS hora TEXT;
ALTER TABLE cronograma_adolescentes ADD COLUMN IF NOT EXISTS reflexion TEXT;
DROP POLICY IF EXISTS "Auth insert" ON cronograma_adolescentes;
DROP POLICY IF EXISTS "Auth update" ON cronograma_adolescentes;
DROP POLICY IF EXISTS "Auth delete" ON cronograma_adolescentes;
DROP POLICY IF EXISTS "Teens insert" ON cronograma_adolescentes;
DROP POLICY IF EXISTS "Teens update" ON cronograma_adolescentes;
DROP POLICY IF EXISTS "Teens delete" ON cronograma_adolescentes;
CREATE POLICY "Teens insert" ON cronograma_adolescentes FOR INSERT WITH CHECK (puede_editar_teens());
CREATE POLICY "Teens update" ON cronograma_adolescentes FOR UPDATE USING (puede_editar_teens()) WITH CHECK (puede_editar_teens());
CREATE POLICY "Teens delete" ON cronograma_adolescentes FOR DELETE USING (puede_editar_teens());

-- ─── 6. ACTAS DE REUNIÓN (privadas: solo admin + teens) ─────────────
CREATE TABLE IF NOT EXISTS actas_adolescentes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TEXT,
  lugar TEXT,
  dirige TEXT,
  asistentes TEXT,
  temas TEXT,
  acuerdos TEXT,
  tareas JSONB NOT NULL DEFAULT '[]'::jsonb,
  creado_por UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE actas_adolescentes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teens leen actas" ON actas_adolescentes;
DROP POLICY IF EXISTS "Teens crean actas" ON actas_adolescentes;
DROP POLICY IF EXISTS "Teens editan actas" ON actas_adolescentes;
DROP POLICY IF EXISTS "Teens borran actas" ON actas_adolescentes;
CREATE POLICY "Teens leen actas" ON actas_adolescentes FOR SELECT USING (puede_editar_teens());
CREATE POLICY "Teens crean actas" ON actas_adolescentes FOR INSERT WITH CHECK (puede_editar_teens());
CREATE POLICY "Teens editan actas" ON actas_adolescentes FOR UPDATE USING (puede_editar_teens()) WITH CHECK (puede_editar_teens());
CREATE POLICY "Teens borran actas" ON actas_adolescentes FOR DELETE USING (puede_editar_teens());

-- ─── 7. PETICIONES PARA EL MATUTINO (privadas: solo admin + teens) ──
CREATE TABLE IF NOT EXISTS peticiones_oracion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  peticion TEXT NOT NULL,
  incluir_en_post BOOLEAN DEFAULT FALSE,
  creado_por UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE peticiones_oracion ADD COLUMN IF NOT EXISTS creado_por UUID DEFAULT auth.uid();
ALTER TABLE peticiones_oracion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teens leen peticiones" ON peticiones_oracion;
DROP POLICY IF EXISTS "Teens crean peticiones" ON peticiones_oracion;
DROP POLICY IF EXISTS "Teens editan peticiones" ON peticiones_oracion;
DROP POLICY IF EXISTS "Teens borran peticiones" ON peticiones_oracion;
CREATE POLICY "Teens leen peticiones" ON peticiones_oracion FOR SELECT USING (puede_editar_teens());
CREATE POLICY "Teens crean peticiones" ON peticiones_oracion FOR INSERT WITH CHECK (puede_editar_teens());
CREATE POLICY "Teens editan peticiones" ON peticiones_oracion FOR UPDATE USING (puede_editar_teens()) WITH CHECK (puede_editar_teens());
CREATE POLICY "Teens borran peticiones" ON peticiones_oracion FOR DELETE USING (puede_editar_teens());

-- ─── Verificación ───────────────────────────────────────────────────
SELECT u.email, p.rol FROM user_profiles p JOIN auth.users u ON u.id = p.id ORDER BY p.rol, u.email;

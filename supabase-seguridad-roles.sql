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

-- ─── 3.1. CONFIGURACIÓN DE LA IGLESIA ───────────────────────────────
CREATE TABLE IF NOT EXISTS church_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE church_settings ENABLE ROW LEVEL SECURITY;

-- ─── 4. ESCRITURA: solo admin en tablas generales ───────────────────
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['miembros', 'donaciones', 'gastos', 'proyectos', 'eventos', 'asistencia', 'celulas', 'ministerios', 'productos', 'publicaciones'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public read" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin read" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Auth insert" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Auth update" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Auth delete" ON %I', t);
    EXECUTE format('CREATE POLICY "Admin read" ON %I FOR SELECT USING (is_admin())', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin insert" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin update" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin delete" ON %I', t);
    EXECUTE format('CREATE POLICY "Admin insert" ON %I FOR INSERT WITH CHECK (is_admin())', t);
    EXECUTE format('CREATE POLICY "Admin update" ON %I FOR UPDATE USING (is_admin()) WITH CHECK (is_admin())', t);
    EXECUTE format('CREATE POLICY "Admin delete" ON %I FOR DELETE USING (is_admin())', t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Public read" ON church_settings;
DROP POLICY IF EXISTS "Admin read" ON church_settings;
DROP POLICY IF EXISTS "Admin insert" ON church_settings;
DROP POLICY IF EXISTS "Admin update" ON church_settings;
DROP POLICY IF EXISTS "Admin delete" ON church_settings;
CREATE POLICY "Public read" ON church_settings FOR SELECT USING (true);
CREATE POLICY "Admin insert" ON church_settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update" ON church_settings FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete" ON church_settings FOR DELETE USING (is_admin());

CREATE OR REPLACE FUNCTION email_verificado()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email_confirmed_at IS NOT NULL);
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, auth;
REVOKE ALL ON FUNCTION email_verificado() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION email_verificado() TO authenticated;

DROP POLICY IF EXISTS "Miembro lee su ficha" ON miembros;
CREATE POLICY "Miembro lee su ficha" ON miembros FOR SELECT
  USING (lower(email) = lower(auth.jwt() ->> 'email') AND email_verificado());

DROP POLICY IF EXISTS "Usuario autenticado lee eventos" ON eventos;
CREATE POLICY "Usuario autenticado lee eventos" ON eventos FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuario autenticado lee publicaciones publicadas" ON publicaciones;
CREATE POLICY "Usuario autenticado lee publicaciones publicadas" ON publicaciones FOR SELECT
  USING (auth.role() = 'authenticated' AND estado = 'publicado');

-- ─── 5. CRONOGRAMA DE ADOLESCENTES: admin + teens ───────────────────
ALTER TABLE cronograma_adolescentes ADD COLUMN IF NOT EXISTS ministerio TEXT;
ALTER TABLE cronograma_adolescentes ADD COLUMN IF NOT EXISTS hora TEXT;
ALTER TABLE cronograma_adolescentes ADD COLUMN IF NOT EXISTS reflexion TEXT;
DROP POLICY IF EXISTS "Public read" ON cronograma_adolescentes;
DROP POLICY IF EXISTS "Usuario autenticado lee cronograma" ON cronograma_adolescentes;
DROP POLICY IF EXISTS "Admin read" ON cronograma_adolescentes;
CREATE POLICY "Admin read" ON cronograma_adolescentes FOR SELECT USING (is_admin());
CREATE POLICY "Usuario autenticado lee cronograma" ON cronograma_adolescentes FOR SELECT
  USING (auth.role() = 'authenticated');
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

DROP POLICY IF EXISTS "Public read" ON peticiones_oracion;
DROP POLICY IF EXISTS "Admin read" ON peticiones_oracion;
CREATE POLICY "Admin read" ON peticiones_oracion FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "Teens leen peticiones" ON peticiones_oracion;
DROP POLICY IF EXISTS "Teens crean peticiones" ON peticiones_oracion;
DROP POLICY IF EXISTS "Teens editan peticiones" ON peticiones_oracion;
DROP POLICY IF EXISTS "Teens borran peticiones" ON peticiones_oracion;
CREATE POLICY "Teens leen peticiones" ON peticiones_oracion FOR SELECT USING (puede_editar_teens());
CREATE POLICY "Teens crean peticiones" ON peticiones_oracion FOR INSERT WITH CHECK (puede_editar_teens());
CREATE POLICY "Teens editan peticiones" ON peticiones_oracion FOR UPDATE USING (puede_editar_teens()) WITH CHECK (puede_editar_teens());
CREATE POLICY "Teens borran peticiones" ON peticiones_oracion FOR DELETE USING (puede_editar_teens());

-- ─── 8. SEGUIMIENTO MENSUAL TEENS (solo admin + rol teens) ──────────
CREATE TABLE IF NOT EXISTS evaluaciones_teens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  periodo DATE NOT NULL UNIQUE,
  asistencia_promedio NUMERIC(6,2) CHECK (asistencia_promedio IS NULL OR asistencia_promedio >= 0),
  nuevos INTEGER CHECK (nuevos IS NULL OR nuevos >= 0),
  constantes INTEGER CHECK (constantes IS NULL OR constantes >= 0),
  reuniones_realizadas INTEGER CHECK (reuniones_realizadas IS NULL OR reuniones_realizadas >= 0),
  observaciones TEXT NOT NULL DEFAULT '',
  creado_por UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE evaluaciones_teens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin read" ON evaluaciones_teens;
DROP POLICY IF EXISTS "Admin insert" ON evaluaciones_teens;
DROP POLICY IF EXISTS "Admin update" ON evaluaciones_teens;
DROP POLICY IF EXISTS "Admin delete" ON evaluaciones_teens;
DROP POLICY IF EXISTS "Teens leen evaluaciones" ON evaluaciones_teens;
DROP POLICY IF EXISTS "Teens crean evaluaciones" ON evaluaciones_teens;
DROP POLICY IF EXISTS "Teens editan evaluaciones" ON evaluaciones_teens;
DROP POLICY IF EXISTS "Teens borran evaluaciones" ON evaluaciones_teens;
CREATE POLICY "Teens leen evaluaciones" ON evaluaciones_teens FOR SELECT USING (puede_editar_teens());
CREATE POLICY "Teens crean evaluaciones" ON evaluaciones_teens FOR INSERT WITH CHECK (puede_editar_teens());
CREATE POLICY "Teens editan evaluaciones" ON evaluaciones_teens FOR UPDATE USING (puede_editar_teens()) WITH CHECK (puede_editar_teens());
CREATE POLICY "Teens borran evaluaciones" ON evaluaciones_teens FOR DELETE USING (puede_editar_teens());

-- ─── 9. CAMPAÑAS, COLABORACIONES Y ENTREGAS ────────────────────────
CREATE TABLE IF NOT EXISTS campanas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL CHECK (char_length(titulo) BETWEEN 3 AND 120),
  descripcion TEXT NOT NULL DEFAULT '',
  fecha_evento DATE,
  fecha_limite DATE,
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'abierta', 'cerrada', 'completada')),
  creado_por UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campana_requerimientos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campana_id UUID NOT NULL REFERENCES campanas(id),
  nombre TEXT NOT NULL CHECK (char_length(nombre) BETWEEN 2 AND 120),
  tipo TEXT NOT NULL CHECK (tipo IN ('dinero', 'insumo')),
  unidad TEXT NOT NULL DEFAULT 'unidad' CHECK (char_length(unidad) BETWEEN 1 AND 30),
  objetivo NUMERIC(12,2) NOT NULL CHECK (objetivo > 0),
  UNIQUE (campana_id, id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campana_colaboraciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referencia TEXT NOT NULL UNIQUE,
  campana_id UUID NOT NULL REFERENCES campanas(id),
  requerimiento_id UUID NOT NULL,
  nombre_colaborador TEXT NOT NULL CHECK (char_length(nombre_colaborador) BETWEEN 2 AND 120),
  telefono TEXT CHECK (telefono IS NULL OR char_length(telefono) <= 30),
  correo TEXT CHECK (correo IS NULL OR char_length(correo) <= 254),
  cantidad NUMERIC(12,2) NOT NULL CHECK (cantidad > 0 AND cantidad <= 100000),
  nota TEXT CHECK (nota IS NULL OR char_length(nota) <= 500),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'rechazada')),
  confirmada_por UUID REFERENCES auth.users(id),
  confirmada_en TIMESTAMPTZ,
  creada_por UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (campana_id, requerimiento_id) REFERENCES campana_requerimientos(campana_id, id)
);

CREATE TABLE IF NOT EXISTS campana_entregas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  colaboracion_id UUID NOT NULL REFERENCES campana_colaboraciones(id),
  cantidad NUMERIC(12,2) NOT NULL CHECK (cantidad > 0),
  fecha_entrega DATE NOT NULL DEFAULT CURRENT_DATE,
  recibida_por TEXT NOT NULL CHECK (char_length(recibida_por) BETWEEN 2 AND 120),
  nota TEXT CHECK (nota IS NULL OR char_length(nota) <= 500),
  registrada_por UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE campanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE campana_requerimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE campana_colaboraciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE campana_entregas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage campaigns" ON campanas;
DROP POLICY IF EXISTS "Public read open campaigns" ON campanas;
CREATE POLICY "Admin manage campaigns" ON campanas FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Public read open campaigns" ON campanas FOR SELECT
  USING (estado = 'abierta' AND (fecha_limite IS NULL OR fecha_limite >= CURRENT_DATE));

DROP POLICY IF EXISTS "Admin manage campaign needs" ON campana_requerimientos;
DROP POLICY IF EXISTS "Public read open campaign needs" ON campana_requerimientos;
CREATE POLICY "Admin manage campaign needs" ON campana_requerimientos FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Public read open campaign needs" ON campana_requerimientos FOR SELECT
  USING (EXISTS (SELECT 1 FROM campanas c WHERE c.id = campana_id AND c.estado = 'abierta' AND (c.fecha_limite IS NULL OR c.fecha_limite >= CURRENT_DATE)));

DROP POLICY IF EXISTS "Admin read campaign contributions" ON campana_colaboraciones;
DROP POLICY IF EXISTS "Admin update campaign contributions" ON campana_colaboraciones;
DROP POLICY IF EXISTS "Public submit campaign contribution" ON campana_colaboraciones;
CREATE POLICY "Admin read campaign contributions" ON campana_colaboraciones FOR SELECT USING (is_admin());
CREATE POLICY "Admin update campaign contributions" ON campana_colaboraciones FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "Admin delete campaign contributions" ON campana_colaboraciones;
CREATE POLICY "Admin delete campaign contributions" ON campana_colaboraciones FOR DELETE USING (is_admin());
CREATE POLICY "Public submit campaign contribution" ON campana_colaboraciones FOR INSERT
  WITH CHECK (
    estado = 'pendiente'
    AND creada_por IS NOT DISTINCT FROM auth.uid()
    AND confirmada_por IS NULL
    AND confirmada_en IS NULL
    AND EXISTS (
      SELECT 1 FROM campanas c
      JOIN campana_requerimientos r ON r.campana_id = c.id
      WHERE c.id = campana_colaboraciones.campana_id
        AND c.estado = 'abierta'
        AND (c.fecha_limite IS NULL OR c.fecha_limite >= CURRENT_DATE)
        AND r.id = campana_colaboraciones.requerimiento_id
    )
  );

DROP POLICY IF EXISTS "Admin read campaign deliveries" ON campana_entregas;
DROP POLICY IF EXISTS "Admin add campaign deliveries" ON campana_entregas;
CREATE POLICY "Admin read campaign deliveries" ON campana_entregas FOR SELECT USING (is_admin());
CREATE POLICY "Admin add campaign deliveries" ON campana_entregas FOR INSERT WITH CHECK (is_admin());

GRANT SELECT ON campanas, campana_requerimientos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON campanas, campana_requerimientos TO authenticated;
GRANT INSERT ON campana_colaboraciones TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON campana_colaboraciones TO authenticated;
-- Para tablas ya creadas: CREATE TABLE IF NOT EXISTS no añade el tope.
ALTER TABLE campana_colaboraciones DROP CONSTRAINT IF EXISTS campana_colaboraciones_cantidad_tope;
ALTER TABLE campana_colaboraciones ADD CONSTRAINT campana_colaboraciones_cantidad_tope CHECK (cantidad <= 100000) NOT VALID;
GRANT SELECT, INSERT ON campana_entregas TO authenticated;

CREATE OR REPLACE FUNCTION validar_entrega_campana()
RETURNS TRIGGER AS $$
DECLARE
  v_colaboracion campana_colaboraciones%ROWTYPE;
  v_recibido NUMERIC(12,2);
BEGIN
  SELECT * INTO v_colaboracion
  FROM campana_colaboraciones
  WHERE id = NEW.colaboracion_id
  FOR UPDATE;
  IF NOT FOUND OR v_colaboracion.estado <> 'confirmada' THEN
    RAISE EXCEPTION 'Solo se pueden registrar entregas de colaboraciones confirmadas';
  END IF;
  SELECT COALESCE(SUM(cantidad), 0) INTO v_recibido
  FROM campana_entregas
  WHERE colaboracion_id = NEW.colaboracion_id;
  IF v_recibido + NEW.cantidad > v_colaboracion.cantidad THEN
    RAISE EXCEPTION 'La entrega supera la cantidad comprometida';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS validar_entrega_campana ON campana_entregas;
CREATE TRIGGER validar_entrega_campana BEFORE INSERT ON campana_entregas
FOR EACH ROW EXECUTE FUNCTION validar_entrega_campana();

-- ─── Verificación ───────────────────────────────────────────────────
SELECT u.email, p.rol FROM user_profiles p JOIN auth.users u ON u.id = p.id ORDER BY p.rol, u.email;

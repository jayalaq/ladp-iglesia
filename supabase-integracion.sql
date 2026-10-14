-- ═══════════════════════════════════════════════════════════════════
-- LADP — INTEGRACIÓN (oct 2026) · Seguro de re-ejecutar
-- Ejecutar DESPUÉS de supabase-schema.sql y supabase-seguridad-roles.sql
--
--  1. Matutino de oración: columnas del cronograma + peticiones de oración
--  2. Configuración de la iglesia (editable por el Super Administrador)
--  3. Bandeja: mensajes de contacto y pedidos de la tienda (cualquiera envía, solo admin lee)
--  4. Adolescentes: integrantes (cumpleaños) y asistencia por sábado (admin + teens)
--  5. Lectura privada: datos sensibles ya no son públicos
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. MATUTINO DE ORACIÓN ─────────────────────────────────────────
ALTER TABLE cronograma_adolescentes ADD COLUMN IF NOT EXISTS ministerio TEXT;
ALTER TABLE cronograma_adolescentes ADD COLUMN IF NOT EXISTS hora TEXT;
ALTER TABLE cronograma_adolescentes ADD COLUMN IF NOT EXISTS reflexion TEXT;

CREATE TABLE IF NOT EXISTS peticiones_oracion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  peticion TEXT NOT NULL CHECK (char_length(peticion) <= 1000),
  incluir_en_post BOOLEAN DEFAULT FALSE,
  creado_por UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE peticiones_oracion ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teens peticiones" ON peticiones_oracion;
CREATE POLICY "Teens peticiones" ON peticiones_oracion FOR ALL
  USING (puede_editar_teens()) WITH CHECK (puede_editar_teens());

-- ─── 2. CONFIGURACIÓN DE LA IGLESIA ─────────────────────────────────
CREATE TABLE IF NOT EXISTS configuracion (
  id TEXT PRIMARY KEY DEFAULT 'general',
  datos JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Config lectura publica" ON configuracion;
DROP POLICY IF EXISTS "Config admin escribe" ON configuracion;
-- Lectura pública: la página de inicio muestra dirección, horarios y redes
CREATE POLICY "Config lectura publica" ON configuracion FOR SELECT USING (true);
CREATE POLICY "Config admin escribe" ON configuracion FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ─── 3. BANDEJA: MENSAJES Y PEDIDOS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS mensajes_contacto (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL CHECK (char_length(nombre) BETWEEN 2 AND 120),
  email TEXT CHECK (email IS NULL OR char_length(email) <= 160),
  telefono TEXT CHECK (telefono IS NULL OR char_length(telefono) <= 40),
  asunto TEXT CHECK (asunto IS NULL OR char_length(asunto) <= 120),
  mensaje TEXT NOT NULL CHECK (char_length(mensaje) BETWEEN 5 AND 3000),
  estado TEXT NOT NULL DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'atendido')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE mensajes_contacto ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Cualquiera envia mensaje" ON mensajes_contacto;
DROP POLICY IF EXISTS "Admin gestiona mensajes" ON mensajes_contacto;
CREATE POLICY "Cualquiera envia mensaje" ON mensajes_contacto FOR INSERT WITH CHECK (estado = 'nuevo');
CREATE POLICY "Admin gestiona mensajes" ON mensajes_contacto FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE TABLE IF NOT EXISTS pedidos_tienda (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL CHECK (char_length(numero) <= 40),
  cliente JSONB NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0 AND total < 100000),
  metodo TEXT CHECK (metodo IS NULL OR char_length(metodo) <= 40),
  estado TEXT NOT NULL DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'confirmado', 'entregado', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE pedidos_tienda ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Cualquiera envia pedido" ON pedidos_tienda;
DROP POLICY IF EXISTS "Admin gestiona pedidos" ON pedidos_tienda;
CREATE POLICY "Cualquiera envia pedido" ON pedidos_tienda FOR INSERT WITH CHECK (estado = 'nuevo');
CREATE POLICY "Admin gestiona pedidos" ON pedidos_tienda FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ─── 4. ADOLESCENTES: INTEGRANTES Y ASISTENCIA ──────────────────────
-- Datos de menores de edad: solo el equipo de Adolescentes y el Super Administrador
CREATE TABLE IF NOT EXISTS teens_integrantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  fecha_nacimiento DATE,
  apoderado TEXT,
  telefono TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE teens_integrantes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teens integrantes" ON teens_integrantes;
CREATE POLICY "Teens integrantes" ON teens_integrantes FOR ALL
  USING (puede_editar_teens()) WITH CHECK (puede_editar_teens());

CREATE TABLE IF NOT EXISTS teens_asistencia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL UNIQUE,
  presentes JSONB NOT NULL DEFAULT '[]'::jsonb,
  visitantes INTEGER NOT NULL DEFAULT 0 CHECK (visitantes >= 0),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE teens_asistencia ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teens asistencia" ON teens_asistencia;
CREATE POLICY "Teens asistencia" ON teens_asistencia FOR ALL
  USING (puede_editar_teens()) WITH CHECK (puede_editar_teens());

-- ─── 5. LECTURA PRIVADA ─────────────────────────────────────────────
-- Antes: todas las tablas tenían "Public read" (cualquiera, sin sesión, leía emails y donaciones).
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['miembros', 'donaciones', 'gastos', 'asistencia', 'celulas', 'ministerios', 'proyectos', 'cronograma_adolescentes'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public read" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Lectura" ON %I', t);
  END LOOP;
END $$;

-- Finanzas: solo el Super Administrador
CREATE POLICY "Lectura" ON donaciones FOR SELECT USING (is_admin());
CREATE POLICY "Lectura" ON gastos FOR SELECT USING (is_admin());
-- Miembros: el Super Administrador, o cada persona su propio registro
CREATE POLICY "Lectura" ON miembros FOR SELECT
  USING (is_admin() OR lower(email) = lower(auth.jwt() ->> 'email'));
-- Información interna: cualquier usuario con sesión
CREATE POLICY "Lectura" ON asistencia FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Lectura" ON celulas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Lectura" ON ministerios FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Lectura" ON proyectos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Lectura" ON cronograma_adolescentes FOR SELECT USING (auth.role() = 'authenticated');
-- eventos, publicaciones y productos siguen públicos (información para visitantes)

-- ─── Verificación ───────────────────────────────────────────────────
SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY 1, 3, 2;

-- ═══════════════════════════════════════════════════════════════════
-- LADP Iglesia — MIGRACIÓN (seguro de re-ejecutar)
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Úsalo si YA habías corrido supabase-schema.sql antes y solo quieres
-- aplicar lo nuevo: cronograma editable, datos del matutino y peticiones
-- de oración. Luego ejecuta supabase-seguridad-roles.sql para protegerlas
-- y habilitar el acceso exclusivo del equipo de Adolescentes.
-- (En una base nueva corre supabase-schema.sql completo en su lugar.)
-- ═══════════════════════════════════════════════════════════════════

-- 1) Columnas que la app usa y faltaban en varias tablas
ALTER TABLE donaciones ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'completado';
ALTER TABLE donaciones ADD COLUMN IF NOT EXISTS recibo TEXT;
ALTER TABLE donaciones ADD COLUMN IF NOT EXISTS notas TEXT;
ALTER TABLE gastos    ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'pagado';
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS avance INTEGER DEFAULT 0;
ALTER TABLE eventos   ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'planificado';
ALTER TABLE asistencia ADD COLUMN IF NOT EXISTS nuevos INTEGER DEFAULT 0;
ALTER TABLE celulas   ADD COLUMN IF NOT EXISTS lugar TEXT;

-- 2) Tabla del cronograma del Ministerio de Adolescentes
CREATE TABLE IF NOT EXISTS cronograma_adolescentes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE,
  actividad TEXT NOT NULL,
  responsable TEXT,
  ministerio TEXT,
  hora TEXT,
  reflexion TEXT,
  lugar TEXT,
  tipo TEXT,
  estado TEXT DEFAULT 'planificado',
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cronograma_adolescentes ADD COLUMN IF NOT EXISTS ministerio TEXT;
ALTER TABLE cronograma_adolescentes ADD COLUMN IF NOT EXISTS hora TEXT;
ALTER TABLE cronograma_adolescentes ADD COLUMN IF NOT EXISTS reflexion TEXT;

CREATE TABLE IF NOT EXISTS peticiones_oracion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  peticion TEXT NOT NULL,
  incluir_en_post BOOLEAN DEFAULT FALSE,
  creado_por UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cronograma_adolescentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE peticiones_oracion ENABLE ROW LEVEL SECURITY;

-- Políticas (DROP + CREATE para que sea seguro re-ejecutar)
DROP POLICY IF EXISTS "Public read" ON cronograma_adolescentes;
DROP POLICY IF EXISTS "Auth insert" ON cronograma_adolescentes;
DROP POLICY IF EXISTS "Auth update" ON cronograma_adolescentes;
DROP POLICY IF EXISTS "Auth delete" ON cronograma_adolescentes;
CREATE POLICY "Public read" ON cronograma_adolescentes FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON cronograma_adolescentes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON cronograma_adolescentes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON cronograma_adolescentes FOR DELETE USING (auth.role() = 'authenticated');

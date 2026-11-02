-- ═══════════════════════════════════════════════════════════════════
-- LADP Iglesia — MIGRACIÓN (seguro de re-ejecutar)
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Úsalo si YA habías corrido supabase-schema.sql antes y solo quieres
-- aplicar lo nuevo: cronograma editable, peticiones y seguimiento mensual
-- de Teens. Luego ejecuta supabase-seguridad-roles.sql para protegerlas
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

-- 1b) Contrato único: la app usa proyectos.avance y celulas.estado = 'activo'.
-- Copia datos de la columna antigua `progreso` (si existe) y normaliza 'activa'.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'proyectos' AND column_name = 'progreso') THEN
    EXECUTE 'UPDATE proyectos SET avance = progreso WHERE COALESCE(avance, 0) = 0 AND COALESCE(progreso, 0) <> 0';
  END IF;
END $$;
UPDATE celulas SET estado = 'activo' WHERE estado = 'activa';
ALTER TABLE celulas ALTER COLUMN estado SET DEFAULT 'activo';

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

-- Seguimiento mensual Teens: indicadores en blanco hasta que el equipo los registre.
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

-- Campañas públicas y registro privado de colaboraciones/entregas.
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
  cantidad NUMERIC(12,2) NOT NULL CHECK (cantidad > 0),
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

ALTER TABLE cronograma_adolescentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE peticiones_oracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones_teens ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE campana_requerimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE campana_colaboraciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE campana_entregas ENABLE ROW LEVEL SECURITY;

-- Políticas (DROP + CREATE para que sea seguro re-ejecutar)
DROP POLICY IF EXISTS "Public read" ON cronograma_adolescentes;
DROP POLICY IF EXISTS "Usuario autenticado lee cronograma" ON cronograma_adolescentes;
DROP POLICY IF EXISTS "Admin read" ON cronograma_adolescentes;
CREATE POLICY "Admin read" ON cronograma_adolescentes FOR SELECT USING (is_admin());
CREATE POLICY "Usuario autenticado lee cronograma" ON cronograma_adolescentes FOR SELECT
  USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth insert" ON cronograma_adolescentes;
DROP POLICY IF EXISTS "Auth update" ON cronograma_adolescentes;
DROP POLICY IF EXISTS "Auth delete" ON cronograma_adolescentes;
DROP POLICY IF EXISTS "Admin insert" ON cronograma_adolescentes;
DROP POLICY IF EXISTS "Admin update" ON cronograma_adolescentes;
DROP POLICY IF EXISTS "Admin delete" ON cronograma_adolescentes;
CREATE POLICY "Admin insert" ON cronograma_adolescentes FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update" ON cronograma_adolescentes FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete" ON cronograma_adolescentes FOR DELETE USING (is_admin());

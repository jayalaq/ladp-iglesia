-- ═══════════════════════════════════════════════════════════════════
-- LADP Iglesia - Schema SQL para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ─── MIEMBROS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS miembros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  rol TEXT DEFAULT 'Miembro',
  email TEXT,
  telefono TEXT,
  estado TEXT DEFAULT 'activo',
  desde DATE,
  direccion TEXT,
  grupo TEXT,
  celula TEXT,
  notas TEXT,
  bautizado BOOLEAN DEFAULT FALSE,
  foto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DONACIONES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  miembro TEXT NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  tipo TEXT DEFAULT 'Diezmo',
  fecha DATE DEFAULT CURRENT_DATE,
  metodo TEXT DEFAULT 'Efectivo',
  nota TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── GASTOS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gastos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  concepto TEXT NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  categoria TEXT,
  fecha DATE DEFAULT CURRENT_DATE,
  responsable TEXT,
  nota TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PROYECTOS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proyectos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  presupuesto NUMERIC(10,2) DEFAULT 0,
  gastado NUMERIC(10,2) DEFAULT 0,
  avance INTEGER DEFAULT 0,
  estado TEXT DEFAULT 'activo',
  prioridad TEXT DEFAULT 'media',
  responsable TEXT,
  inicio DATE,
  fin DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── EVENTOS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  fecha DATE,
  hora TEXT,
  lugar TEXT,
  tipo TEXT,
  capacidad INTEGER DEFAULT 0,
  inscritos INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ASISTENCIA ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asistencia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  servicio TEXT,
  total INTEGER DEFAULT 0,
  ninos INTEGER DEFAULT 0,
  jovenes INTEGER DEFAULT 0,
  adultos INTEGER DEFAULT 0,
  visitantes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CELULAS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS celulas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  lider TEXT,
  dia TEXT,
  hora TEXT,
  direccion TEXT,
  miembros INTEGER DEFAULT 0,
  zona TEXT,
  estado TEXT DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── MINISTERIOS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ministerios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  lider TEXT,
  miembros INTEGER DEFAULT 0,
  descripcion TEXT,
  estado TEXT DEFAULT 'activo',
  reuniones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PRODUCTOS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  autor TEXT,
  precio NUMERIC(10,2) DEFAULT 0,
  imagen TEXT,
  categoria TEXT,
  descripcion TEXT,
  stock INTEGER DEFAULT 0,
  editorial TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PUBLICACIONES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS publicaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  autor TEXT,
  fecha DATE DEFAULT CURRENT_DATE,
  categoria TEXT,
  imagen TEXT,
  extracto TEXT,
  contenido TEXT,
  visitas INTEGER DEFAULT 0,
  comentarios INTEGER DEFAULT 0,
  estado TEXT DEFAULT 'borrador',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CRONOGRAMA MINISTERIO DE ADOLESCENTES ─────────────────────────
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

CREATE TABLE IF NOT EXISTS peticiones_oracion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  peticion TEXT NOT NULL,
  incluir_en_post BOOLEAN DEFAULT FALSE,
  creado_por UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- ─── CAMPAÑAS Y COLABORACIONES ─────────────────────────────────────
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

-- ─── SINCRONIZACIÓN DE COLUMNAS (seguro de re-ejecutar) ────────────
-- Asegura que las columnas que usa la app existan, también en bases ya creadas.
ALTER TABLE donaciones ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'completado';
ALTER TABLE donaciones ADD COLUMN IF NOT EXISTS recibo TEXT;
ALTER TABLE donaciones ADD COLUMN IF NOT EXISTS notas TEXT;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'pagado';
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS avance INTEGER DEFAULT 0;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'planificado';
ALTER TABLE asistencia ADD COLUMN IF NOT EXISTS nuevos INTEGER DEFAULT 0;
ALTER TABLE celulas ADD COLUMN IF NOT EXISTS lugar TEXT;
ALTER TABLE cronograma_adolescentes ADD COLUMN IF NOT EXISTS ministerio TEXT;
ALTER TABLE cronograma_adolescentes ADD COLUMN IF NOT EXISTS hora TEXT;
ALTER TABLE cronograma_adolescentes ADD COLUMN IF NOT EXISTS reflexion TEXT;

-- ─── CONFIGURACIÓN DE LA IGLESIA ────────────────────────────────────
CREATE TABLE IF NOT EXISTS church_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────
-- Habilitar RLS en todas las tablas
ALTER TABLE miembros ENABLE ROW LEVEL SECURITY;
ALTER TABLE donaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE celulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministerios ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE publicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cronograma_adolescentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE peticiones_oracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones_teens ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE campana_requerimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE campana_colaboraciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE campana_entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_settings ENABLE ROW LEVEL SECURITY;

-- ─── USER PROFILES ──────────────────────────────────────────────────
-- Tabla para perfiles de usuario con roles (admin / usuario)
-- EJECUTAR en Supabase SQL Editor después del schema principal

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre TEXT NOT NULL DEFAULT 'Usuario',
  rol TEXT NOT NULL DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario')),
  email TEXT,
  miembro_id UUID REFERENCES miembros(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar columna email si la tabla ya existe
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Función helper para verificar si el usuario actual es admin
-- SECURITY DEFINER evita recursión infinita en las políticas RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND rol = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Políticas RLS: cada usuario ve su propio perfil; admin ve todos
CREATE POLICY "Ver propio perfil" ON user_profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Crear propio perfil" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id AND rol = 'usuario');
CREATE POLICY "Editar propio perfil" ON user_profiles FOR UPDATE USING (auth.uid() = id OR is_admin());

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

-- ─── POLÍTICAS DE ACCESO ────────────────────────────────────────────
-- Los datos administrativos y financieros son privados por defecto.
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['donaciones', 'gastos', 'proyectos', 'asistencia', 'celulas', 'ministerios', 'productos'] LOOP
    EXECUTE format('CREATE POLICY "Admin read" ON %I FOR SELECT USING (is_admin())', t);
    EXECUTE format('CREATE POLICY "Admin insert" ON %I FOR INSERT WITH CHECK (is_admin())', t);
    EXECUTE format('CREATE POLICY "Admin update" ON %I FOR UPDATE USING (is_admin()) WITH CHECK (is_admin())', t);
    EXECUTE format('CREATE POLICY "Admin delete" ON %I FOR DELETE USING (is_admin())', t);
  END LOOP;
END $$;

CREATE POLICY "Admin read" ON miembros FOR SELECT USING (is_admin());
CREATE OR REPLACE FUNCTION email_verificado()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email_confirmed_at IS NOT NULL);
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, auth;
REVOKE ALL ON FUNCTION email_verificado() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION email_verificado() TO authenticated;

CREATE POLICY "Miembro lee su ficha" ON miembros FOR SELECT
  USING (lower(email) = lower(auth.jwt() ->> 'email') AND email_verificado());
CREATE POLICY "Admin insert" ON miembros FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update" ON miembros FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete" ON miembros FOR DELETE USING (is_admin());

CREATE POLICY "Admin read" ON eventos FOR SELECT USING (is_admin());
CREATE POLICY "Usuario autenticado lee eventos" ON eventos FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "Admin insert" ON eventos FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update" ON eventos FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete" ON eventos FOR DELETE USING (is_admin());

CREATE POLICY "Admin read" ON publicaciones FOR SELECT USING (is_admin());
CREATE POLICY "Usuario autenticado lee publicaciones publicadas" ON publicaciones FOR SELECT
  USING (auth.role() = 'authenticated' AND estado = 'publicado');
CREATE POLICY "Admin insert" ON publicaciones FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update" ON publicaciones FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete" ON publicaciones FOR DELETE USING (is_admin());

CREATE POLICY "Usuario autenticado lee cronograma" ON cronograma_adolescentes FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "Admin insert" ON cronograma_adolescentes FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update" ON cronograma_adolescentes FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete" ON cronograma_adolescentes FOR DELETE USING (is_admin());

CREATE POLICY "Admin read" ON peticiones_oracion FOR SELECT USING (is_admin());
CREATE POLICY "Admin insert" ON peticiones_oracion FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update" ON peticiones_oracion FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete" ON peticiones_oracion FOR DELETE USING (is_admin());

CREATE POLICY "Admin read" ON evaluaciones_teens FOR SELECT USING (is_admin());
CREATE POLICY "Admin insert" ON evaluaciones_teens FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update" ON evaluaciones_teens FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete" ON evaluaciones_teens FOR DELETE USING (is_admin());

CREATE POLICY "Admin manage campaigns" ON campanas FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Public read open campaigns" ON campanas FOR SELECT
  USING (estado = 'abierta' AND (fecha_limite IS NULL OR fecha_limite >= CURRENT_DATE));
CREATE POLICY "Admin manage campaign needs" ON campana_requerimientos FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Public read open campaign needs" ON campana_requerimientos FOR SELECT
  USING (EXISTS (SELECT 1 FROM campanas c WHERE c.id = campana_id AND c.estado = 'abierta' AND (c.fecha_limite IS NULL OR c.fecha_limite >= CURRENT_DATE)));
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

CREATE POLICY "Public read" ON church_settings FOR SELECT USING (true);
CREATE POLICY "Admin insert" ON church_settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update" ON church_settings FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- ─── PROMOVER A ADMIN ────────────────────────────────────────────────
-- Ejecutar en Supabase SQL Editor para convertir tu cuenta en admin:
-- UPDATE user_profiles SET rol = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'tu@email.com');

-- NOTA: Para habilitar Google OAuth:
-- 1. Ve a Supabase Dashboard → Authentication → Providers → Google → Enable
-- 2. Añade las credenciales de tu Google OAuth App (Client ID + Secret)
-- 3. En Google Console, agrega como redirect URI: https://<tu-proyecto>.supabase.co/auth/v1/callback

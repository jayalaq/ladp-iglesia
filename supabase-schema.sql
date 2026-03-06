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
  progreso INTEGER DEFAULT 0,
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
  estado TEXT DEFAULT 'activa',
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

-- Políticas: lectura pública, escritura autenticada
CREATE POLICY "Public read" ON miembros FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON miembros FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON miembros FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON miembros FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Public read" ON donaciones FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON donaciones FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON donaciones FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON donaciones FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Public read" ON gastos FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON gastos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON gastos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON gastos FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Public read" ON proyectos FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON proyectos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON proyectos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON proyectos FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Public read" ON eventos FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON eventos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON eventos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON eventos FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Public read" ON asistencia FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON asistencia FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON asistencia FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON asistencia FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Public read" ON celulas FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON celulas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON celulas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON celulas FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Public read" ON ministerios FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON ministerios FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON ministerios FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON ministerios FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Public read" ON productos FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON productos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON productos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON productos FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Public read" ON publicaciones FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON publicaciones FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON publicaciones FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON publicaciones FOR DELETE USING (auth.role() = 'authenticated');

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
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Políticas RLS: cada usuario ve su propio perfil; admin ve todos
CREATE POLICY "Ver propio perfil" ON user_profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Crear propio perfil" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Editar propio perfil" ON user_profiles FOR UPDATE USING (auth.uid() = id OR is_admin());

-- ─── PROMOVER A ADMIN ────────────────────────────────────────────────
-- Ejecutar en Supabase SQL Editor para convertir tu cuenta en admin:
-- UPDATE user_profiles SET rol = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'tu@email.com');

-- NOTA: Para habilitar Google OAuth:
-- 1. Ve a Supabase Dashboard → Authentication → Providers → Google → Enable
-- 2. Añade las credenciales de tu Google OAuth App (Client ID + Secret)
-- 3. En Google Console, agrega como redirect URI: https://<tu-proyecto>.supabase.co/auth/v1/callback

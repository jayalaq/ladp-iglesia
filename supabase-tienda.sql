-- ═══════════════════════════════════════════════════════════════════
-- LADP — TIENDA CONECTADA A LA BASE DE DATOS · Seguro de re-ejecutar
-- Ejecutar DESPUÉS de supabase-accesos.sql
--
--  1. Campos nuevos: precio anterior (descuento), destacado (TOP), visible (publicado / borrador)
--  2. La tienda pública solo lee los productos visibles; quien gestiona la Tienda ve también borradores
--  3. Los 12 productos modelo se cargan como BORRADORES (solo si la tabla está vacía) para editarlos
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE productos ADD COLUMN IF NOT EXISTS precio_antes NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS destacado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS visible BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS paginas INTEGER;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS isbn TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP POLICY IF EXISTS "Public read" ON productos;
DROP POLICY IF EXISTS "Lectura" ON productos;
CREATE POLICY "Lectura" ON productos FOR SELECT USING (visible OR tiene_acceso('tienda'));

INSERT INTO productos (titulo, autor, precio, precio_antes, imagen, categoria, descripcion, stock, editorial, destacado, paginas, visible)
SELECT * FROM (VALUES
  ('Fundamentos de la Fe', 'Dr. Jorge Ramírez', 45, 55, '📖', 'Doctrina', 'Estudio profundo de las doctrinas fundamentales pentecostales. Cubre los 16 puntos cardinales de la fe pentecostal con aplicaciones prácticas para la vida diaria.', 50, 'LADP Publishing', FALSE, 320, FALSE),
  ('Avivamiento en el Perú', 'Pastor Juan Ríos', 38, 0, '🔥', 'Historia', 'Recorrido histórico de 106 años del movimiento pentecostal en Perú, desde los misioneros Barker hasta la iglesia contemporánea.', 30, 'Editorial Cristiana', FALSE, 280, FALSE),
  ('Liderazgo Cristiano', 'Dra. María González', 52, 65, '👥', 'Liderazgo', 'Principios bíblicos para líderes de iglesia con casos prácticos y estudios de liderazgo transformacional basado en las Escrituras.', 40, 'LADP Publishing', FALSE, 256, FALSE),
  ('Devocional Diario 2025', 'Varios Autores', 28, 0, '🙏', 'Devocional', '365 reflexiones espirituales para cada día del año con lecturas bíblicas, oraciones guiadas y aplicaciones prácticas.', 100, 'Librería LADP', TRUE, 400, FALSE),
  ('Teología Pentecostal', 'Rev. Carlos Méndez', 65, 80, '✝️', 'Teología', 'Introducción académica a la teología pentecostal latinoamericana con perspectiva bíblica y contextual.', 25, 'Seminario Bíblico Andino', FALSE, 450, FALSE),
  ('Ministerio de Niños', 'Hna. Patricia Vega', 35, 0, '👧', 'Ministerio', 'Guía práctica con 52 lecciones para el ministerio infantil, actividades manuales y recursos multimedia descargables.', 60, 'LADP Publishing', FALSE, 200, FALSE),
  ('Biblia de Estudio LADP', 'Comité Editorial', 120, 150, '📕', 'Biblia', 'Biblia Reina-Valera 1960 con 15,000 notas de estudio, concordancia completa, mapas a color y artículos teológicos.', 80, 'LADP Publishing', TRUE, 1800, FALSE),
  ('Himnario Digital + Físico', 'LADP Music', 55, 0, '🎵', 'Música', 'Colección completa de 500 himnos con partituras, acordes de guitarra y acceso a audio digital MP3.', 45, 'LADP Music', FALSE, 600, FALSE),
  ('Cómo Plantar Iglesias', 'Rev. Andrés Fuentes', 48, 58, '🌱', 'Ministerio', 'Manual paso a paso para la plantación de iglesias en contextos urbanos y rurales del Perú.', 35, 'LADP Publishing', FALSE, 220, FALSE),
  ('Consejería Pastoral', 'Dra. Carmen López', 58, 0, '💬', 'Ministerio', 'Herramientas bíblicas y psicológicas para la consejería en la iglesia local, crisis y acompañamiento espiritual.', 28, 'Seminario Bíblico Andino', FALSE, 380, FALSE),
  ('Adoración sin Límites', 'Worship Team LADP', 42, 0, '🎶', 'Música', '20 canciones originales LADP con partituras, pistas de acompañamiento y tutoriales en video.', 70, 'LADP Music', TRUE, 120, FALSE),
  ('Escuela Dominical Vol.1', 'Equipo Educativo', 32, 40, '🎓', 'Educación', 'Curriculum trimestral para escuela dominical con material para maestros, alumnos y recursos visuales.', 90, 'LADP Publishing', FALSE, 160, FALSE)
) AS v(titulo, autor, precio, precio_antes, imagen, categoria, descripcion, stock, editorial, destacado, paginas, visible)
WHERE NOT EXISTS (SELECT 1 FROM productos);

-- ─── Verificación ───────────────────────────────────────────────────
SELECT titulo, precio, stock, CASE WHEN visible THEN 'Publicado' ELSE 'Borrador' END AS estado FROM productos ORDER BY titulo;

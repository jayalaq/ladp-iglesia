# LADP Iglesia — contexto para Claude Code

## Propósito

Aplicación web administrativa y pública para LADP Iglesia. Permite gestionar miembros, finanzas, proyectos, eventos, asistencia, células, ministerios, tienda, publicaciones y el ministerio de adolescentes.

## Stack y comandos

- React 18 con Vite; JavaScript y JSX.
- Supabase para autenticación, datos y políticas RLS.
- `npm run dev`: servidor local.
- `npm run build`: compilación de producción.
- No hay scripts de pruebas, lint ni verificación de tipos definidos en `package.json`.

## Mapa del repositorio

- `src/App.jsx`: páginas, componentes y navegación de la aplicación.
- `src/dataService.js`: lecturas/escrituras en Supabase y autenticación.
- `src/supabase.js`: inicialización del cliente Supabase desde variables de entorno.
- `supabase-schema.sql`: esquema base, políticas y perfiles.
- `supabase-seguridad-roles.sql`: políticas de roles y tablas de adolescentes.
- `supabase-migracion.sql`: migración para instalaciones existentes.
- `GUIA-DESPLIEGUE.md`: documentación de despliegue; verificar sus pasos contra la configuración real antes de seguirlos.
- `docs/ANALISIS-PENDIENTES.md`: hallazgos iniciales y prioridades de desarrollo.

## Instrucciones de trabajo

- Antes de editar, revisa `git status` y conserva los cambios preexistentes.
- Usa `docs/ANALISIS-PENDIENTES.md` como punto de partida, no como verdad permanente: confirma cada hallazgo contra el código y la configuración vigentes.
- Distingue los problemas confirmados por el código de los que requieren validar el proyecto/configuración real de Supabase o del proveedor de despliegue.
- Para proponer trabajo, indica prioridad, evidencia (archivo y líneas), impacto, dependencias y un criterio de aceptación verificable.
- Antes de modificar SQL o permisos, sigue las políticas de roles existentes y comprueba coherencia con la autorización de la interfaz. Nunca relajes RLS para hacer que una operación funcione.
- No inventes que una operación se guardó: inspecciona el resultado de Supabase y muestra los errores al usuario.
- No trates datos de ejemplo como datos reales ni agregues información personal o credenciales a documentación, código o logs.
- Nunca leas, imprimas ni incluyas `.env`, `.env.local`, claves de API o tokens en cambios o respuestas. Las claves privadas no deben ir en variables `VITE_*` ni en el navegador.
- Haz cambios acotados, mantén los estilos y patrones existentes, y ejecuta `npm run build` para validar cambios de aplicación.
- No afirmes que hay pruebas automatizadas si no existen; registra las limitaciones de validación.

## Analizar pendientes

Usa `/analizar-pendientes` para volver a revisar el repositorio y obtener un análisis actualizado. La instrucción está en `.claude/skills/analizar-pendientes/SKILL.md`.

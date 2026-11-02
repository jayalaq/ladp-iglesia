# Guía de despliegue — LADP Iglesia Admin

Aplicación React + Vite que usa Supabase (autenticación, datos y RLS). Es un sitio estático: no hay backend propio (la carpeta `api/` está vacía).

## Estructura relevante

```
├── index.html, vite.config.js, package.json, .node-version (22)
├── src/            App.jsx, dataService.js, supabase.js, main.jsx
├── supabase-schema.sql           ← esquema base (proyecto nuevo)
├── supabase-migracion.sql        ← migración (proyecto existente)
├── supabase-seguridad-roles.sql  ← roles y políticas RLS
├── vercel.json · netlify.toml · wrangler.toml
└── .github/workflows/deploy-cloudflare.yml
```

`supabase-usuarios-prueba.sql` es local, contiene credenciales de prueba y está en `.gitignore`: no lo subas al repositorio.

## Requisitos

- Node.js 22 (ver `.node-version`; el workflow de CI usa 22) y npm.
- Un proyecto de Supabase.
- Una cuenta en el proveedor de despliegue elegido.

## 1. Probar en local

```bash
npm ci
cp .env.example .env.local   # completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev                  # http://localhost:5173
npm run build                # genera dist/
```

Sin variables de Supabase la app funciona con datos de muestra. No hay scripts de pruebas ni de lint.

## 2. Configurar Supabase

Variables (públicas; la protección real son las políticas RLS):

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-o-publishable
```

`src/supabase.js` también acepta `SUPABASE_URL`/`SUPABASE_ANON_KEY` (o `*_PUBLISHABLE_KEY`) y las variantes `NEXT_PUBLIC_*` de la integración Supabase↔Vercel; usa la primera pareja URL+clave completa, empezando por `VITE_*`. **Nunca** pongas una clave `service_role` ni otro secreto en estas variables.

En Supabase → SQL Editor, ejecuta en este orden:

1. **Proyecto nuevo:** `supabase-schema.sql` y luego `supabase-seguridad-roles.sql`.
2. **Proyecto existente:** `supabase-migracion.sql` y luego `supabase-seguridad-roles.sql`.

Las migraciones no se aplican solas al desplegar. `supabase-seguridad-roles.sql` asigna el rol de administrador a la cuenta definida en `v_email` (por defecto `jayala@tailoringconsult.pe`); esa cuenta debe haber iniciado sesión antes. Confirma que sigue siendo la cuenta autorizada o cambia `v_email`.

Recuperación de contraseña: en Supabase → Authentication → URL Configuration agrega `https://tu-dominio/login?recovery=1` (y la URL local, p. ej. `http://localhost:5173/login?recovery=1`) a las URLs de redirección permitidas. Si usas Google, configura también su proveedor en Authentication → Providers.

## 3. Desplegar

Todas las opciones requieren definir las dos variables `VITE_*` en el proveedor (o como secretos en GitHub para CI). Comando de build `npm run build`, salida `dist`.

### Cloudflare Pages/Workers (CI incluida)

`.github/workflows/deploy-cloudflare.yml` se ejecuta en cada push a `main`/`master`: `npm ci`, `npm run build` y `wrangler deploy` (`wrangler.toml`, assets en `./dist`).

Secretos de GitHub necesarios: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `CLOUDFLARE_API_TOKEN`.

### Vercel

Importa el repositorio; `vercel.json` ya fija framework Vite, build, salida y la reescritura a `index.html` (necesaria para rutas como `/login`). Define las variables en Settings → Environment Variables, o conecta la integración de Supabase.

### Netlify

`netlify.toml` define build, publicación y la redirección SPA. Define las variables en Site settings → Environment variables.

### Otros proveedores

Cualquier hosting estático sirve si reescribe todas las rutas a `index.html`. En GitHub Pages hay que fijar `base` en `vite.config.js` y gestionar la reescritura SPA; no está configurado en el repositorio.

Verifica que solo haya un despliegue activo por rama para no confundir qué URL es la oficial.

## Estado de funcionalidades

- Implementado: landing pública, autenticación Supabase, panel de gestión con roles (`admin`, `teens`, usuario normal), configuración institucional, búsqueda y exportación de miembros.
- Las pantallas administrativas requieren el esquema y las políticas RLS instalados.
- La tienda permite explorar el catálogo, pero **pedidos y pagos están deshabilitados**: no hay backend de pedidos ni proveedor de pago. Antes de abrir compras, define proveedor de pago, inventario, envíos y confirmaciones, y valida pedidos en el servidor.
- No hay pruebas automatizadas.

## Solución de problemas

- **"Module not found":** `npm ci`.
- **Error de build:** `npm run build 2>&1 | tail -20`.
- **El build se queda colgado en macOS con el proyecto en Escritorio/iCloud:** archivos de `node_modules` evictados por iCloud. Mueve `node_modules` fuera y ejecuta `npm ci`, o mantén el proyecto fuera de carpetas sincronizadas.
- **Página en blanco o 404 en `/login`:** falta la reescritura a `index.html` o `base` es incorrecto.
- **La app muestra datos de muestra en producción:** las variables `VITE_*` no estaban definidas al compilar; defínelas y vuelve a desplegar (se leen en build, no en ejecución).
- **Fallan lecturas o escrituras:** revisa que se ejecutaron los SQL y las políticas RLS; la app muestra los errores de Supabase.
- **Fuentes:** se cargan desde Google Fonts y requieren conexión.

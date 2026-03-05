# 🚀 Guía de Despliegue — LADP Iglesia Admin

## Estructura del Proyecto

```
ladp-deploy/
├── index.html              ← Página entrada
├── package.json            ← Dependencias
├── vite.config.js          ← Config de Vite
├── netlify.toml            ← Config para Netlify
├── vercel.json             ← Config para Vercel
├── .gitignore
└── src/
    ├── main.jsx            ← Punto de entrada React
    └── App.jsx             ← Tu aplicación completa
```

---

## Requisitos Previos

1. **Node.js** v18+ → [nodejs.org](https://nodejs.org)
2. **Git** → [git-scm.com](https://git-scm.com)
3. Cuenta gratuita en **GitHub** → [github.com](https://github.com)

Verifica instalación:
```bash
node --version    # debe mostrar v18+
npm --version     # debe mostrar v9+
git --version
```

---

## Paso 1 — Preparar el Proyecto Local

```bash
# 1. Descomprime o coloca la carpeta ladp-deploy en tu computadora

# 2. Abre terminal en la carpeta del proyecto
cd ladp-deploy

# 3. Instala dependencias
npm install

# 4. Prueba en local
npm run dev
# → Abre http://localhost:5173 en tu navegador

# 5. Genera la versión de producción
npm run build
# → Crea la carpeta /dist con los archivos optimizados
```

---

## Paso 2 — Subir a GitHub

```bash
# Inicializar repositorio
git init
git add .
git commit -m "LADP Iglesia - versión inicial"

# Crear repositorio en GitHub (desde github.com → New Repository)
# Nombre sugerido: ladp-iglesia-admin

# Conectar y subir
git remote add origin https://github.com/TU_USUARIO/ladp-iglesia-admin.git
git branch -M main
git push -u origin main
```

---

## Opción A — Desplegar en Vercel (Recomendado) ⭐

**Vercel** es la opción más rápida y fácil. Gratis para proyectos personales.

### Pasos:

1. Ve a [vercel.com](https://vercel.com) → Regístrate con tu cuenta de GitHub
2. Click en **"Add New Project"**
3. Selecciona tu repositorio `ladp-iglesia-admin`
4. Vercel detectará automáticamente que es un proyecto Vite
5. Verifica la configuración:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Click en **"Deploy"**
7. En ~60 segundos tendrás tu URL: `https://ladp-iglesia-admin.vercel.app`

### Dominio personalizado (opcional):
- En Vercel → Settings → Domains → Agrega `tuiglesia.com`
- Configura los DNS de tu dominio apuntando a Vercel

### Actualizaciones automáticas:
Cada vez que hagas `git push` a GitHub, Vercel desplegará automáticamente.

---

## Opción B — Desplegar en Netlify

**Netlify** también es excelente y gratuito.

### Pasos:

1. Ve a [netlify.com](https://www.netlify.com) → Regístrate con GitHub
2. Click en **"Add new site"** → **"Import an existing project"**
3. Selecciona GitHub → Selecciona tu repositorio
4. Configuración de build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click en **"Deploy site"**
6. Obtendrás una URL como: `https://random-name.netlify.app`
7. Puedes cambiar el nombre en: Site settings → Change site name
   - Ejemplo: `https://ladp-iglesia.netlify.app`

### El archivo `netlify.toml` ya está incluido con la configuración correcta.

---

## Opción C — Desplegar en GitHub Pages (100% gratis)

### Pasos:

1. Modifica `vite.config.js`:
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/ladp-iglesia-admin/',  // ← nombre de tu repositorio
  build: {
    outDir: 'dist',
  },
});
```

2. Instala el plugin de despliegue:
```bash
npm install -D gh-pages
```

3. Agrega el script en `package.json`:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "deploy": "npm run build && gh-pages -d dist"
}
```

4. Despliega:
```bash
npm run deploy
```

5. En GitHub → Settings → Pages:
   - Source: **Deploy from a branch**
   - Branch: **gh-pages** / **root**
   
6. Tu URL será: `https://TU_USUARIO.github.io/ladp-iglesia-admin/`

---

## Opción D — Desplegar en Cloudflare Pages (muy rápido)

1. Ve a [pages.cloudflare.com](https://pages.cloudflare.com) → Regístrate gratis
2. **Create a project** → Connect to Git → Selecciona tu repo
3. Configuración:
   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Click en **Deploy**
5. URL: `https://ladp-iglesia.pages.dev`

**Ventaja:** CDN global ultra-rápido + SSL gratis + dominio personalizado gratis.

---

## Opción E — Desplegar en Railway

1. Ve a [railway.app](https://railway.app) → Login con GitHub
2. **New Project** → **Deploy from GitHub repo**
3. Selecciona tu repositorio
4. Railway detectará el proyecto automáticamente
5. Agrega estas variables si es necesario:
   - `PORT`: 3000
6. Deploy automático

---

## Comparativa de Opciones Gratuitas

| Plataforma        | SSL  | Dominio Custom | Deploys Auto | Límite        | Velocidad |
|-------------------|------|----------------|--------------|---------------|-----------|
| **Vercel** ⭐      | ✅   | ✅ Gratis      | ✅           | 100GB/mes     | ⚡⚡⚡      |
| **Netlify**       | ✅   | ✅ Gratis      | ✅           | 100GB/mes     | ⚡⚡⚡      |
| **Cloudflare**    | ✅   | ✅ Gratis      | ✅           | Ilimitado     | ⚡⚡⚡⚡     |
| **GitHub Pages**  | ✅   | ✅ Gratis      | ✅           | 1GB repo      | ⚡⚡       |
| **Railway**       | ✅   | ✅             | ✅           | $5 crédito    | ⚡⚡⚡      |

**Mi recomendación: Vercel o Cloudflare Pages** — Son los más rápidos, fáciles y con mejor rendimiento.

---

## Después del Despliegue

### Credenciales de acceso al Admin:
- **Email:** admin@ladp.pe
- **Password:** admin123

### Lo que funciona:
- ✅ Landing page pública (cualquier visitante)
- ✅ Tienda online pública (página independiente)
- ✅ Login de administración
- ✅ Dashboard con 11 módulos de gestión
- ✅ CRUD completo de miembros, finanzas, eventos, etc.

### Para producción real necesitarás:
- **Backend/API** (Firebase, Supabase, o Node.js) para persistir datos
- **Base de datos** (Firestore, PostgreSQL, etc.)
- **Autenticación real** (Firebase Auth, Supabase Auth)
- **Pasarela de pagos** (Culqi, MercadoPago, Stripe) para la tienda
- **Almacenamiento** (Cloudinary, S3) para imágenes

### Servicios backend gratuitos recomendados:
| Servicio    | Base de Datos | Auth  | Storage | Límite Gratis         |
|-------------|---------------|-------|---------|-----------------------|
| **Supabase**| PostgreSQL    | ✅    | ✅      | 500MB DB, 1GB storage |
| **Firebase**| Firestore     | ✅    | ✅      | 1GB DB, 5GB storage   |
| **Neon**    | PostgreSQL    | ❌    | ❌      | 512MB DB              |
| **PlanetScale** | MySQL    | ❌    | ❌      | 5GB DB                |

---

## Solución de Problemas

**Error: "Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Error en el build**
```bash
npm run build 2>&1 | tail -20
# Lee el error específico y corrígelo
```

**Página en blanco después de deploy**
- Verifica que `base` en `vite.config.js` sea correcto
- En GitHub Pages debe ser `'/nombre-del-repo/'`
- En Vercel/Netlify debe ser `'/'` (por defecto)

**Fuentes no cargan**
- Las fuentes se cargan desde Google Fonts vía CSS
- Requiere conexión a internet del usuario

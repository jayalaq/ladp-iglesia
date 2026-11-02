# Análisis inicial de pendientes de desarrollo

**Revisado:** 2026-10-28  
**Alcance:** inspección estática del código y SQL del repositorio. No se verificaron credenciales, datos ni políticas del proyecto remoto de Supabase o de los proveedores de despliegue. Los números de línea son referencias para volver a localizar el código y pueden cambiar.

Este documento es una línea base para Claude Code, no una confirmación de que el sistema remoto esté configurado igual. Revalidar cada punto antes de implementarlo.

## Hallazgos confirmados por código

### P0 — Restringir la lectura de datos personales y financieros

**Estado:** migraciones y carga por rol ajustadas en el repositorio; pendiente ejecutar y verificar en Supabase.

- **Evidencia:** antes del cambio, `supabase-schema.sql` declaraba lectura pública. La configuración actual limita miembros al administrador o su propia ficha, restringe datos administrativos al administrador y deja eventos, publicaciones publicadas y cronograma accesibles solo a sesiones autenticadas. `src/dataService.js` carga tablas según el rol.
- **Trabajo restante:** ejecutar `supabase-seguridad-roles.sql` sobre una base existente (o usar el esquema actualizado en una base nueva) y comprobar las políticas reales. No se accedió a Supabase desde este análisis.
- **Aceptación:** una sesión anónima no puede leer información protegida; un usuario normal solo ve su ficha, eventos, publicaciones publicadas y cronograma; `teens` ve y edita el ministerio permitido; `admin` conserva el acceso de gestión.

### P1 — Evitar confirmar guardados fallidos como exitosos

**Estado:** corregido en el cliente; validar con errores reales de conexión y permisos.

- **Evidencia:** las mutaciones de las pantallas usan `saveRecord`/`deleteRecord`; los errores ya no se convierten en guardados locales exitosos. La carga por rol devuelve errores por tabla y los informa en el dashboard. Los ID nuevos ahora son UUID válidos para las columnas de Supabase.
- **Aceptación:** al simular una falla de red o permisos, la interfaz muestra error y no refleja un cambio como persistido.

### P1 — Recuperar el acceso a la cuenta

**Estado:** flujo de recuperación añadido; requiere probar el correo y la URL permitida en Supabase.

- **Evidencia:** la pantalla de inicio permite solicitar un enlace y establecer una contraseña nueva tras validar el enlace de Supabase. Las contraseñas no se escriben en archivos ni se guardan en la aplicación.
- **Trabajo restante:** permitir la redirección `https://tu-dominio/login?recovery=1` en Supabase → Authentication → URL Configuration y verificar entrega del correo.
- **Aceptación:** el enlace recibido abre el formulario de nueva contraseña y la cuenta puede iniciar sesión con ella.

### P1 — Separar datos de demostración de datos reales

**Estado:** corregido en el cliente; requiere comprobación manual con una base vacía.

- **Evidencia:** `src/App.jsx` ahora inicia las colecciones vacías cuando Supabase está configurado y reemplaza cada colección por el resultado remoto, incluso si está vacía. Los datos de muestra quedan para el modo sin Supabase.
- **Aceptación:** validar manualmente con Supabase configurado y tablas vacías que no aparezcan registros de demostración.

### P1 — Completar el flujo real de pedidos y pagos de la tienda

**Estado:** bloqueado de forma segura hasta definir backend y proveedor de pago.

- **Evidencia:** `src/App.jsx:3412-3425,3451-3457` mantiene pedidos solo en estado React. El checkout ofrece varios métodos, pero confirmar únicamente crea un número local (`src/App.jsx:3565-3573`); la confirmación promete emails y seguimiento (`src/App.jsx:3600-3610`).
- **Impacto:** los pedidos desaparecen al recargar o cerrar la página y la interfaz comunica pagos/avisos que no se procesan desde el código encontrado.
- **Trabajo necesario:** acordar proveedor de pago, logística y correo; luego persistir pedidos en backend, validar precios/inventario del lado servidor y enviar confirmaciones reales. El acceso a checkout está deshabilitado y muestra que no se ingresen datos mientras no exista esta integración.
- **Aceptación:** un pedido sobrevive a una nueva sesión, su total se calcula con datos confiables y la confirmación refleja el estado de pago real.

### P1 — Alinear los contratos de datos entre React y Supabase

**Estado (2026-11-01):** contrato fijado en `proyectos.avance` y `celulas.estado = 'activo'`. `supabase-schema.sql` crea `avance` en lugar de `progreso` y usa `'activo'` por defecto; `supabase-migracion.sql` copia `progreso`→`avance` (si existe la columna antigua) y normaliza `'activa'`. Pendiente ejecutar la migración en Supabase y verificar lectura/escritura en una instalación nueva y una actualizada. La columna `progreso` antigua no se elimina.

- **Evidencia:** el frontend usa campos como `proyectos.avance` y `celulas.estado: "activo"` (`src/App.jsx:1425-1490,1647-1700`); el esquema base también declara `proyectos.progreso` y `celulas.estado DEFAULT 'activa'` (`supabase-schema.sql:42-53,79-90`). El servicio CRUD usa los objetos tal cual (`src/dataService.js:38-96`).
- **Impacto:** columnas duplicadas o valores distintos entre cliente y base pueden producir datos incoherentes, ordenamientos erróneos o fallos de escritura que el frontend no siempre comunica.
- **Trabajo necesario:** definir un contrato único por entidad, migrar instalaciones existentes con compatibilidad y validar los datos en los límites del cliente/servidor.
- **Aceptación:** las columnas y valores persistidos corresponden al modelo acordado; una instalación nueva y una actualizada pasan los mismos casos de lectura y escritura.

### P2 — Persistir la configuración y completar controles visibles

**Estado:** configuración, búsqueda y exportación implementadas; la configuración pública se comparte con la landing y el dashboard. Falta validar con Supabase real.

- **Evidencia:** los ajustes institucionales de contacto, identidad y redes se guardan en `church_settings`; la landing y el dashboard los cargan. La lectura pública de esa tabla solo es apropiada mientras contenga exclusivamente información institucional destinada a publicarse. La búsqueda encuentra registros de secciones accesibles; la exportación de miembros genera CSV del resultado filtrado y neutraliza fórmulas.
- **Trabajo restante:** ejecutar el SQL de roles para instalar `church_settings` y su lectura pública; validar persistencia, permisos y exportación en navegador.
- **Aceptación:** ajustes permanecen tras recargar, los datos institucionales se reflejan en la landing/dashboard, la búsqueda respeta los permisos del rol y el CSV se descarga.

### P2 — Quitar indicadores de muestra del dashboard

**Estado:** corregido.

- **Evidencia:** se retiraron las variaciones no calculadas y el gráfico usa los últimos cinco meses respecto de la fecha actual.
- **Aceptación:** las estadísticas visibles se derivan de los registros disponibles.

### P2 — Actualizar la guía de despliegue

**Estado (2026-11-01):** `GUIA-DESPLIEGUE.md` reescrita contra el repositorio (estructura real, variables que lee `src/supabase.js`, orden de SQL, CI de Cloudflare, `vercel.json`, `netlify.toml`, estado de la tienda y problema de iCloud). No se probó un despliegue desde cero; los pasos con proveedores externos no se verificaron.

- **Evidencia:** `GUIA-DESPLIEGUE.md` describe una estructura antigua y afirma que el backend/Supabase y la autenticación real aún están por implementar, aunque el repositorio ya contiene cliente, autenticación, CRUD y SQL (`src/dataService.js`, `src/supabase.js`, `supabase-schema.sql`).
- **Impacto:** quien despliegue puede seguir pasos incompletos o configurar mal el entorno.
- **Trabajo necesario:** documentar el flujo real de configuración de variables, migraciones, autenticación, roles y proveedor soportado; separar lo implementado de lo pendiente y retirar instrucciones obsoletas.
- **Aceptación:** una persona puede desplegar desde cero siguiendo solo la guía vigente, sin contradicciones con los archivos del repositorio.

### P2 — Validar experiencia móvil con usuarios

**Estado:** corregidos el scroll del panel, la búsqueda móvil y los objetivos táctiles; falta probar en dispositivos reales.

- **Evidencia:** `src/App.jsx` ya tenía breakpoints para la landing, el panel y el calendario Teens, pero el buscador global se ocultaba en móviles y el contenedor interno del panel limitaba el desplazamiento vertical. Ahora el buscador se muestra a ancho completo y el panel puede crecer/desplazarse en página; la navegación conserva etiquetas accesibles.
- **Trabajo restante:** probar login/OAuth, navegación por secciones, calendario, formularios, tablas y flujo de recuperación en Safari iOS y Chrome Android, con anchos de 320–430 px.
- **Aceptación:** no hay contenido cortado ni scroll horizontal de página; navegación y controles son utilizables con toque; los formularios y el calendario conservan el desplazamiento vertical normal.

### P3 — Añadir pruebas y reducir el acoplamiento del frontend

- **Evidencia:** `package.json` solo declara `dev`, `build` y `preview`; `src/App.jsx` concentra páginas y estado de la aplicación en un único archivo extenso.
- **Impacto:** cambios en persistencia, permisos y checkout carecen de una red de pruebas automatizadas y son difíciles de modificar con confianza.
- **Trabajo necesario:** definir pruebas prioritarias para permisos, persistencia y compra; después extraer módulos/componentes en cambios graduales.
- **Aceptación:** los flujos críticos cuentan con pruebas ejecutables desde scripts del repositorio y la extracción no altera el comportamiento existente.

## Revisión de código del PR #32 (2026-11-02)

**Corregido:** fechas vacías a `null`; RLS de colaboraciones con sesión iniciada; `deleteRow` falla si no borra filas; CSV de teléfonos; ficha propia exige correo verificado (`email_verificado()`); cierre del flujo de recuperación de contraseña; borrado admin y tope de `cantidad` (≤ 100 000) en `campana_colaboraciones`; búsqueda global sin "null" y bajo demanda; aviso "Excede el objetivo" en campañas.

**Pendiente:**
- **P1 — Formulario anónimo de colaboraciones sin límite de frecuencia.** Evidencia: `submitPublicCampaignContribution` en `src/dataService.js` y `GRANT INSERT ... TO anon` en los SQL. Mitigación actual: moderación manual con el borrado admin. Siguiente paso recomendado si aparece spam: captcha (p. ej. Turnstile) verificado en el servidor. Aceptación: un script que repite el POST no puede llenar la tabla.
- **P2 — Decidir si las entregas que superan el objetivo se bloquean** (hoy solo se avisa).
- **P3 — Carga por sección.** `loadAllData` pide hasta 18 tablas al admin en cada montaje; mover a carga bajo demanda tras validar el PR.
- **Validación:** ejecutar los SQL en Supabase y probar con una cuenta de cada rol (cuenta con y sin correo confirmado, y recuperación de contraseña con `/login?recovery=1` permitido).

## Por validar fuera del repositorio

- Qué migraciones y políticas RLS están realmente instaladas en el proyecto Supabase.
- Qué tablas contienen datos reales y si el proyecto desplegado utiliza credenciales/variables de producción.
- Qué métodos de pago, proveedor de correo y alcance logístico aprobó la iglesia.
- Qué partes de las pantallas con contenido fijo son datos institucionales aprobados y cuáles son solo ejemplos.
- Qué registros de los archivos operativos de OneDrive deben convertirse en módulos de la plataforma. No se copiaron listas de adolescentes, familiares ni colaboradores.

## Procesos identificados en OneDrive

- **Ministerio Adolescentes/2026:** `Plan_Ministerio_Adolescentes_2026.xlsx` sirve como plantilla de identidad, diagnóstico, objetivos, programación, actividades, presupuesto y evaluación; esas secciones no contienen metas completas. Se añadió seguimiento mensual para registrar cifras reales y observaciones, sin precargar objetivos inventados. `Planificacion_Teens_2026.xlsx` contiene una planificación semanal y de enseñanza.
- **Cristo Viene/ACTIVIDAD2026:** `Chuletada_Junio_2026_ICV.xlsx` y `Estado_Colaboradores_Chuletada28Jun2026.xlsx` describen control de insumos requeridos, compromisos y entregas en especie o dinero, tarjetas, pendientes y resumen de estado. La carpeta contiene esos archivos en su raíz; no existe una subcarpeta duplicada `ACTIVIDAD2026/ACTIVIDAD2026`.
- **Siguiente integración sugerida:** un módulo reutilizable de campañas/eventos para gestionar requerimientos, cantidades y montos comprometidos/entregados, pendientes y resumen de avance. El archivo corresponde a una actividad del 28 de junio de 2026 y no se importaron sus listas nominales; confirmar el flujo para futuras campañas antes de cargar nombres o datos personales.

## Orden sugerido

1. Ejecutar y verificar `supabase-seguridad-roles.sql` en Supabase; confirmar que `church_settings` solo contiene campos institucionales públicos.
2. Probar guardados, eliminación, configuración, búsqueda y exportación con una cuenta de cada rol.
3. Actualizar la guía de despliegue y acordar proveedor/backend antes de reactivar el checkout.

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Heart, Users, Target, Calendar, BarChart2, Plus, Search, DollarSign, Award, Clock, Trash2, Menu, ArrowRight, Mail, Lock, Eye, EyeOff, Check, LogOut, Bell, Phone, MapPin, Play, Facebook, Youtube, Instagram, Download, Send, UserPlus, UserCheck, FileText, Activity, MessageCircle, AlertCircle, Edit, Settings, Globe, Palette, Save, ShoppingCart, BookOpen, CreditCard, Package, Grid, List, Share2, Bookmark, ChevronDown, ChevronRight, X, Filter, TrendingUp, PieChart, Home, Layers, Printer, MoreVertical, RefreshCw, ChevronLeft, Star, Upload, Copy, ExternalLink, Mic } from "lucide-react";
import { isSupabaseConfigured } from "./supabase";
import { loadAllData, insertRow, updateRow, deleteRow, upsertRecord, removeRecord, signIn, signOut, signInWithGoogle, signUp, getUserProfile, getSession, onAuthStateChange, getUsers, updateUserRole } from "./dataService";

// ─── PALETA DE COLORES ──────────────────────────────────────────────
const G = {
  primary: "#1a3a5c",
  primaryLight: "#2a5f8f",
  primaryDark: "#0e2440",
  accent: "#c8913a",
  accentLight: "#e0b066",
  accentDark: "#a07028",
  dark: "#0f1923",
  darkMedium: "#1a2836",
  gray: "#6b7f8e",
  grayLight: "#f3f6f8",
  grayMid: "#d4dce3",
  white: "#ffffff",
  success: "#2a9d6e",
  successLight: "#e8f7f0",
  warning: "#d4940a",
  warningLight: "#fef8e7",
  danger: "#c9392b",
  dangerLight: "#fdeae8",
  purple: "#6b4fa0",
  purpleLight: "#f0ecf7",
  bg: "#f7f9fb",
};

// ─── ESTILOS GLOBALES ───────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { margin: 0; background: ${G.bg}; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
    @keyframes scaleIn { from { opacity:0; transform: scale(0.95); } to { opacity:1; transform: scale(1); } }
    @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
    .fadein { animation: fadeIn 0.35s ease both; }
    .fadeup { animation: fadeUp 0.45s ease both; }
    .slideIn { animation: slideIn 0.3s ease both; }
    .scaleIn { animation: scaleIn 0.25s ease both; }
    .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
    .card-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(26,58,92,0.1); }
    .sidebar-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 14px; border-radius: 10px; border: none;
      background: transparent; width: 100%; cursor: pointer;
      font-size: 13.5px; font-weight: 500; transition: all 0.2s;
      font-family: 'DM Sans', sans-serif; color: ${G.gray}; text-align: left;
    }
    .sidebar-item:hover { background: ${G.grayLight}; color: ${G.dark}; }
    .sidebar-item.active { background: ${G.primary}12; color: ${G.primary}; font-weight: 700; }
    input, textarea, select { font-family: 'DM Sans', sans-serif; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${G.grayMid}; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: ${G.gray}; }
    ::selection { background: ${G.primary}30; }
    @media print {
      .no-print { display: none !important; }
    }
    /* ═══ RESPONSIVE: TABLET (max 1024px) ═══ */
    @media (max-width: 1024px) {
      .nav-links { gap: 0 !important; }
      .nav-links .nbtn { padding: 8px 10px !important; font-size: 12.5px !important; }
      .nav-actions { gap: 6px !important; }
      .nav-actions button { padding: 8px 14px !important; font-size: 12px !important; }
      .landing-section { padding: 80px 24px !important; }
      .grid-2col { grid-template-columns: 1fr !important; gap: 40px !important; }
      .events-grid { grid-template-columns: 1fr !important; }
      .digital-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
      .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
      .dashboard-sidebar { width: 68px !important; }
      .dashboard-sidebar .sidebar-label { display: none; }
      .sidebar-item { justify-content: center !important; }
    }
    /* ═══ RESPONSIVE: MOBILE (max 768px) ═══ */
    @media (max-width: 768px) {
      .nav-links { display: none !important; }
      .nav-actions .donar-btn { display: none !important; }
      .hamburger-btn { display: flex !important; }
      .mobile-menu { display: flex !important; }
      .landing-section { padding: 60px 16px !important; }
      .section-title { font-size: 28px !important; letter-spacing: -1px !important; }
      .section-subtitle { font-size: 14px !important; }
      .hero-section { min-height: 90vh !important; padding: 100px 16px 60px !important; }
      .hero-title { font-size: 36px !important; letter-spacing: -1px !important; }
      .hero-subtitle { font-size: 15px !important; }
      .hero-buttons { flex-direction: column !important; align-items: stretch !important; }
      .hero-buttons button { justify-content: center !important; }
      .visit-cards { flex-direction: column !important; }
      .visit-features { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
      .sermon-grid { grid-template-columns: 1fr !important; }
      .ministry-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .como-grid { grid-template-columns: 1fr 1fr !important; gap: 16px !important; }
      .digital-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
      .digital-box { padding: 28px 20px !important; }
      .groups-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
      .tienda-cta { flex-direction: column !important; text-align: center !important; padding: 36px 24px !important; }
      .tienda-cta-stats { justify-content: center !important; }
      .testimonials-grid { grid-template-columns: 1fr !important; }
      .donar-section h2 { font-size: 32px !important; }
      .contacto-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
      .footer-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
      .footer-bottom { flex-direction: column !important; text-align: center !important; }
      .login-split { flex-direction: column !important; }
      .login-left { display: none !important; }
      .login-right { padding: 24px 16px !important; }
      .dashboard-layout { flex-direction: column !important; height: auto !important; min-height: 100vh !important; }
      .dashboard-sidebar { width: 100% !important; flex-direction: row !important; border-right: none !important; border-bottom: 1px solid ${G.grayMid}40 !important; overflow-x: auto !important; overflow-y: hidden !important; }
      .dashboard-sidebar nav { flex-direction: row !important; padding: 6px 8px !important; flex: 1 !important; }
      .dashboard-sidebar .sidebar-bottom { flex-direction: row !important; border-top: none !important; border-left: 1px solid ${G.grayMid}40 !important; padding: 6px 8px !important; }
      .sidebar-item { padding: 8px 10px !important; font-size: 0 !important; justify-content: center !important; min-width: 40px !important; }
      .sidebar-item svg { margin: 0 !important; }
      .dashboard-header { padding: 10px 16px !important; }
      .dashboard-header .search-box { display: none !important; }
      .dashboard-main { padding: 16px !important; }
      .stat-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
      .teens-cal-grid { grid-template-columns: minmax(0, 1fr) !important; }
      .teens-agenda { height: auto !important; min-height: 0 !important; max-height: 70vh !important; }
      .admin-table { overflow-x: auto !important; }
      .shop-product-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important; }
      .shop-header { flex-direction: column !important; gap: 16px !important; }
    }
    /* La agenda toma la altura del calendario y hace scroll por dentro */
    .teens-agenda { height: 0; min-height: 100%; }
    /* ═══ RESPONSIVE: PANEL COMPACTO ═══ */
    @media (max-width: 900px) {
      .split-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
    }
    @media (max-width: 768px) {
      .ui-card { padding: 14px !important; border-radius: 12px !important; }
      .page-header { margin-bottom: 12px !important; }
      .page-header h1 { font-size: 19px !important; }
      .page-header > div:last-child button { padding: 7px 12px !important; font-size: 12px !important; }
      .modal-head { padding: 12px 16px !important; }
      .modal-body { padding: 14px 16px !important; }
      .list-row { flex-wrap: wrap !important; row-gap: 6px !important; }
      .list-row .list-main { flex-basis: calc(100% - 64px) !important; }
      .list-row { column-gap: 10px !important; }
      .list-row > * { min-width: 0 !important; }
      .list-row > div[style*="font-size: 18px"] { font-size: 15px !important; }
      .dashboard-sidebar > div:first-child { display: none !important; }
      .dashboard-sidebar nav { display: flex !important; overflow-x: auto !important; overflow-y: hidden !important; gap: 2px; }
      .dashboard-sidebar .sidebar-bottom { display: flex !important; }
      .dashboard-sidebar .sidebar-item { width: auto !important; flex-shrink: 0 !important; margin: 0 !important; }
      .tabs-bar { flex-wrap: nowrap !important; overflow-x: auto !important; padding-bottom: 4px; }
      .tabs-bar button { flex-shrink: 0 !important; padding: 7px 12px !important; }
    }
    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr !important; }
    }
    /* ═══ RESPONSIVE: SMALL MOBILE (max 480px) ═══ */
    @media (max-width: 480px) {
      .hero-title { font-size: 28px !important; }
      .ministry-grid { grid-template-columns: 1fr !important; }
      .como-grid { grid-template-columns: 1fr !important; }
      .visit-features { grid-template-columns: 1fr !important; }
      .stat-grid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
      .shop-product-grid { grid-template-columns: 1fr !important; }
    }
    .hamburger-btn { display: none; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; padding: 8px; cursor: pointer; color: #fff; }
    .hamburger-btn:hover { background: rgba(255,255,255,0.2); }
  `}</style>
);

// ─── UTILIDADES ─────────────────────────────────────────────────────
const ROLES = { admin: "Super Administrador", teens: "Miembro · Adolescentes", usuario: "Miembro" };
const rolLabel = (rol) => ROLES[rol] || ROLES.usuario;

// ─── RUTAS ──────────────────────────────────────────────────────────
// /  ·  /login  ·  /registro  ·  /tienda  ·  /panel/<sección>   (vercel.json reescribe todo a index.html)
const navegar = (ruta, { reemplazar = false } = {}) => {
  if (ruta === window.location.pathname + window.location.hash) return;
  window.history[reemplazar ? "replaceState" : "pushState"]({}, "", ruta);
  window.dispatchEvent(new PopStateEvent("popstate"));
};
const useRuta = () => {
  const [ruta, setRuta] = useState(window.location.pathname);
  useEffect(() => {
    const h = () => setRuta(window.location.pathname);
    window.addEventListener("popstate", h);
    return () => window.removeEventListener("popstate", h);
  }, []);
  return ruta;
};
// Clic normal navega sin recargar; Ctrl/Cmd+clic abre en otra pestaña como un link normal
const alClicLink = (ruta, extra) => (e) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault(); extra?.(); navegar(ruta);
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,8);
const fmt = (n) => typeof n === "number" ? n.toLocaleString("es-PE") : n;
const fmtMoney = (n) => `S/. ${fmt(n)}`;
const fmtDate = (d) => d ? new Date(d + "T12:00").toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtDateShort = (d) => d ? new Date(d + "T12:00").toLocaleDateString("es-PE", { day: "numeric", month: "short" }) : "—";
const today = () => new Date().toISOString().slice(0,10);
const monthName = (m) => ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][m];

// ─── DATOS DE IGLESIA ───────────────────────────────────────────────
const CHURCH_DEFAULT = {
  nombre: "Las Asambleas de Dios del Perú",
  abreviatura: "LADP",
  lema: "Iglesia de Avivamiento y Evangelismo",
  direccion: "Av. Colombia 325, Pueblo Libre, Lima",
  telefono: "+51 913 629 693",
  email: "sedenacional@ladp.org.pe",
  pastor: "Rev. Daniel Caballero",
  fundacion: 1919,
  facebook: "https://www.facebook.com/ladpicv",
  youtube: "https://www.youtube.com/c/LasAsambleasdeDiosdelPerú",
  instagram: "https://www.instagram.com/lasasambleasdediosdelperu/",
};

// ─── DATOS INICIALES ────────────────────────────────────────────────
const initMiembros = [
  { id: uid(), nombre: "Carlos Mendoza Ríos", rol: "Diácono", email: "carlos@ladp.pe", telefono: "999111222", estado: "activo", desde: "2019-03-01", direccion: "Jr. Lima 456", grupo: "Adultos", celula: "Célula Esperanza", notas: "", bautizado: true, foto: "CM" },
  { id: uid(), nombre: "María García Fuentes", rol: "Líder de Célula", email: "maria@ladp.pe", telefono: "999333444", estado: "activo", desde: "2020-06-15", direccion: "Av. Arequipa 1200", grupo: "Mujeres", celula: "Célula Gracia", notas: "", bautizado: true, foto: "MG" },
  { id: uid(), nombre: "Pedro Rodríguez Soto", rol: "Miembro", email: "pedro@ladp.pe", telefono: "999555666", estado: "activo", desde: "2022-01-10", direccion: "Calle San Martín 89", grupo: "Jóvenes", celula: "Célula Roca", notas: "Interesado en servir en alabanza", bautizado: true, foto: "PR" },
  { id: uid(), nombre: "Ana Soto Vega", rol: "Maestra Esc. Dominical", email: "ana@ladp.pe", telefono: "999777888", estado: "inactivo", desde: "2018-08-20", direccion: "Av. Brasil 567", grupo: "Adultos", celula: "Célula Fe", notas: "Se mudó temporalmente", bautizado: true, foto: "AS" },
  { id: uid(), nombre: "Roberto Flores López", rol: "Ujier", email: "roberto@ladp.pe", telefono: "999000111", estado: "activo", desde: "2021-04-05", direccion: "Jr. Cusco 234", grupo: "Hombres", celula: "Célula Esperanza", notas: "", bautizado: true, foto: "RF" },
  { id: uid(), nombre: "Lucía Ramírez Torres", rol: "Líder de Alabanza", email: "lucia@ladp.pe", telefono: "998776655", estado: "activo", desde: "2017-02-14", direccion: "Calle Los Olivos 78", grupo: "Jóvenes", celula: "Célula Roca", notas: "Dirige equipo de alabanza dominical", bautizado: true, foto: "LR" },
  { id: uid(), nombre: "Juan Pérez Medina", rol: "Miembro Nuevo", email: "juan@ladp.pe", telefono: "997665544", estado: "activo", desde: "2025-01-15", direccion: "Av. La Marina 900", grupo: "Jóvenes", celula: "", notas: "Visitante recurrente, consolidación en proceso", bautizado: false, foto: "JP" },
  { id: uid(), nombre: "Rosario Díaz Huamán", rol: "Tesorera", email: "rosario@ladp.pe", telefono: "996554433", estado: "activo", desde: "2016-06-01", direccion: "Jr. Junín 456", grupo: "Mujeres", celula: "Célula Gracia", notas: "Encargada de finanzas de la iglesia local", bautizado: true, foto: "RD" },
];

const initDonaciones = [
  { id: uid(), miembro: "Carlos Mendoza Ríos", monto: 3000, tipo: "Diezmo", metodo: "Transferencia", fecha: "2025-02-10", estado: "completado", recibo: "REC-001", notas: "" },
  { id: uid(), miembro: "María García Fuentes", monto: 500, tipo: "Ofrenda", metodo: "Efectivo", fecha: "2025-02-09", estado: "completado", recibo: "REC-002", notas: "" },
  { id: uid(), miembro: "Anónimo", monto: 1200, tipo: "Donación Especial", metodo: "Yape", fecha: "2025-02-08", estado: "completado", recibo: "REC-003", notas: "Para misiones" },
  { id: uid(), miembro: "Pedro Rodríguez Soto", monto: 200, tipo: "Ofrenda", metodo: "Efectivo", fecha: "2025-02-07", estado: "pendiente", recibo: "", notas: "" },
  { id: uid(), miembro: "Roberto Flores López", monto: 1500, tipo: "Diezmo", metodo: "Transferencia", fecha: "2025-02-06", estado: "completado", recibo: "REC-004", notas: "" },
  { id: uid(), miembro: "Lucía Ramírez Torres", monto: 800, tipo: "Ofrenda Misionera", metodo: "Plin", fecha: "2025-02-05", estado: "completado", recibo: "REC-005", notas: "Campaña misionera Selva" },
  { id: uid(), miembro: "Rosario Díaz Huamán", monto: 2500, tipo: "Diezmo", metodo: "Transferencia", fecha: "2025-01-28", estado: "completado", recibo: "REC-006", notas: "" },
  { id: uid(), miembro: "Juan Pérez Medina", monto: 100, tipo: "Ofrenda", metodo: "Efectivo", fecha: "2025-01-25", estado: "completado", recibo: "REC-007", notas: "Primera ofrenda" },
];

const initProyectos = [
  { id: uid(), nombre: "Ampliación Templo Central", presupuesto: 120000, gastado: 93600, avance: 78, estado: "activo", responsable: "Pastor Daniel Caballero", inicio: "2024-06-01", fin: "2025-12-31", descripcion: "Ampliación de 200 asientos adicionales con nuevo sistema de sonido e iluminación", prioridad: "alta" },
  { id: uid(), nombre: "Centro Educativo LADP", presupuesto: 75000, gastado: 31500, avance: 42, estado: "activo", responsable: "Hna. Carmen López", inicio: "2024-09-01", fin: "2025-08-31", descripcion: "Instituto bíblico con aulas, biblioteca y sala de cómputo", prioridad: "alta" },
  { id: uid(), nombre: "Misión Selva Amazónica", presupuesto: 45000, gastado: 9000, avance: 20, estado: "en inicio", responsable: "Rev. José Martínez", inicio: "2025-01-15", fin: "2025-07-31", descripcion: "Evangelismo y plantación de iglesias en comunidades nativas del Ucayali", prioridad: "media" },
  { id: uid(), nombre: "Sistema de Sonido Profesional", presupuesto: 8000, gastado: 8000, avance: 100, estado: "completado", responsable: "Hno. David Torres", inicio: "2024-11-01", fin: "2025-01-15", descripcion: "Instalación de consola digital, monitores y sistema de PA", prioridad: "media" },
  { id: uid(), nombre: "Programa de Becas Jóvenes", presupuesto: 15000, gastado: 4200, avance: 28, estado: "activo", responsable: "Dra. Patricia Vega", inicio: "2025-02-01", fin: "2025-12-31", descripcion: "Becas parciales para jóvenes en formación universitaria y técnica", prioridad: "baja" },
];

const initEventos = [
  { id: uid(), nombre: "106 Aniversario LADP", fecha: "2025-03-22", hora: "18:00", lugar: "Ciudad de Huánuco", capacidad: 2000, inscritos: 1450, tipo: "Celebración", descripcion: "Gran celebración nacional con delegaciones de todas las regiones", estado: "confirmado" },
  { id: uid(), nombre: "Conferencia Evangelística", fecha: "2025-02-28", hora: "19:00", lugar: "Templo Central Lima", capacidad: 500, inscritos: 380, tipo: "Conferencia", descripcion: "Conferencia con el evangelista internacional Rev. Samuel Torres", estado: "confirmado" },
  { id: uid(), nombre: "Retiro de Jóvenes", fecha: "2025-04-15", hora: "08:00", lugar: "Centro de Retiros Cieneguilla", capacidad: 150, inscritos: 98, tipo: "Retiro", descripcion: "Retiro espiritual de fin de semana para jóvenes de 15-30 años", estado: "confirmado" },
  { id: uid(), nombre: "Escuela Bíblica Vacacional", fecha: "2025-07-14", hora: "09:00", lugar: "Templo Central Lima", capacidad: 200, inscritos: 0, tipo: "Educación", descripcion: "Programa de verano para niños de 4-12 años con actividades recreativas y bíblicas", estado: "planificado" },
  { id: uid(), nombre: "Vigilia de Oración", fecha: "2025-03-07", hora: "21:00", lugar: "Templo Central Lima", capacidad: 300, inscritos: 120, tipo: "Oración", descripcion: "Vigilia de oración e intercesión por las naciones", estado: "confirmado" },
];

const initAsistencia = [
  { id: uid(), fecha: "2025-02-23", servicio: "Culto Dominical AM", total: 412, nuevos: 18, ninos: 65, jovenes: 120, adultos: 227 },
  { id: uid(), fecha: "2025-02-23", servicio: "Culto Dominical PM", total: 275, nuevos: 5, ninos: 30, jovenes: 85, adultos: 160 },
  { id: uid(), fecha: "2025-02-16", servicio: "Culto Dominical AM", total: 387, nuevos: 12, ninos: 58, jovenes: 110, adultos: 219 },
  { id: uid(), fecha: "2025-02-16", servicio: "Culto Dominical PM", total: 256, nuevos: 5, ninos: 28, jovenes: 78, adultos: 150 },
  { id: uid(), fecha: "2025-02-19", servicio: "Culto de Oración (Miércoles)", total: 145, nuevos: 3, ninos: 10, jovenes: 45, adultos: 90 },
  { id: uid(), fecha: "2025-02-09", servicio: "Culto Dominical AM", total: 395, nuevos: 15, ninos: 60, jovenes: 115, adultos: 220 },
  { id: uid(), fecha: "2025-02-12", servicio: "Culto de Oración (Miércoles)", total: 132, nuevos: 2, ninos: 8, jovenes: 40, adultos: 84 },
];

const initCelulas = [
  { id: uid(), nombre: "Célula Esperanza", lider: "Carlos Mendoza Ríos", dia: "Martes", hora: "19:30", lugar: "Jr. Lima 456, Pueblo Libre", miembros: 12, estado: "activo", zona: "Pueblo Libre" },
  { id: uid(), nombre: "Célula Gracia", lider: "María García Fuentes", dia: "Jueves", hora: "19:00", lugar: "Av. Arequipa 1200, Lince", miembros: 8, estado: "activo", zona: "Lince" },
  { id: uid(), nombre: "Célula Roca", lider: "Pedro Rodríguez Soto", dia: "Viernes", hora: "20:00", lugar: "Calle San Martín 89, Jesús María", miembros: 10, estado: "activo", zona: "Jesús María" },
  { id: uid(), nombre: "Célula Fe", lider: "Ana Soto Vega", dia: "Miércoles", hora: "19:00", lugar: "Av. Brasil 567, Magdalena", miembros: 6, estado: "inactivo", zona: "Magdalena" },
  { id: uid(), nombre: "Célula Avivamiento", lider: "Roberto Flores López", dia: "Sábado", hora: "16:00", lugar: "Jr. Cusco 234, Breña", miembros: 15, estado: "activo", zona: "Breña" },
];

const initMinisterios = [
  { id: uid(), nombre: "Alabanza y Adoración", lider: "Lucía Ramírez Torres", miembros: 18, descripcion: "Equipo de músicos y cantantes para los servicios dominicales y eventos especiales", estado: "activo", reuniones: "Sábados 15:00" },
  { id: uid(), nombre: "Escuela Dominical", lider: "Ana Soto Vega", miembros: 8, descripcion: "Enseñanza bíblica para niños de 4-12 años durante el servicio dominical", estado: "activo", reuniones: "Domingos 09:00" },
  { id: uid(), nombre: "Jóvenes LADP", lider: "Pedro Rodríguez Soto", miembros: 45, descripcion: "Ministerio juvenil con actividades, discipulado y servicio comunitario", estado: "activo", reuniones: "Viernes 19:00" },
  { id: uid(), nombre: "Misiones", lider: "Rev. José Martínez", miembros: 12, descripcion: "Coordinación de campañas misioneras nacionales e internacionales", estado: "activo", reuniones: "1er Sábado del mes" },
  { id: uid(), nombre: "Damas de Fe", lider: "Rosario Díaz Huamán", miembros: 30, descripcion: "Ministerio de mujeres con encuentros, retiros y servicio social", estado: "activo", reuniones: "Martes 10:00" },
  { id: uid(), nombre: "Ujieres", lider: "Roberto Flores López", miembros: 15, descripcion: "Servicio de bienvenida, orden y atención durante los cultos", estado: "activo", reuniones: "Domingos 07:30" },
  { id: uid(), nombre: "Adolescentes ICV", lider: "Jorge / Priscila", miembros: 25, descripcion: "Ministerio de adolescentes con reuniones semanales, actividades de integración, evangelismo y discipulado para chicos de 12-17 años", estado: "activo", reuniones: "Sábados 15:00" },
];

const initProductos = [
  { id: uid(), titulo: "Fundamentos de la Fe", autor: "Dr. Jorge Ramírez", precio: 45, imagen: "📖", categoria: "Doctrina", descripcion: "Estudio profundo de las doctrinas fundamentales pentecostales", stock: 50, editorial: "LADP Publishing" },
  { id: uid(), titulo: "Avivamiento en el Perú", autor: "Pastor Juan Ríos", precio: 38, imagen: "🔥", categoria: "Historia", descripcion: "Historia del movimiento pentecostal en Perú desde 1919", stock: 30, editorial: "Editorial Cristiana" },
  { id: uid(), titulo: "Liderazgo Cristiano", autor: "Dra. María González", precio: 52, imagen: "👥", categoria: "Liderazgo", descripcion: "Principios bíblicos para líderes de iglesia", stock: 40, editorial: "LADP Publishing" },
  { id: uid(), titulo: "Devocional Diario", autor: "Varios Autores", precio: 28, imagen: "🙏", categoria: "Devocional", descripcion: "365 reflexiones espirituales para cada día del año", stock: 100, editorial: "Librería LADP" },
  { id: uid(), titulo: "Teología Pentecostal", autor: "Rev. Carlos Méndez", precio: 65, imagen: "✝️", categoria: "Teología", descripcion: "Introducción a la teología pentecostal latinoamericana", stock: 25, editorial: "Seminario Bíblico Andino" },
  { id: uid(), titulo: "Ministerio de Niños", autor: "Hna. Patricia Vega", precio: 35, imagen: "👧", categoria: "Ministerio", descripcion: "Guía práctica para el ministerio infantil en la iglesia local", stock: 60, editorial: "LADP Publishing" },
];

const initPublicaciones = [
  { id: uid(), titulo: "El Poder del Espíritu Santo en Nuestros Tiempos", autor: "Pastor Juan Ríos", fecha: "2025-02-15", categoria: "Enseñanza", imagen: "🕊️", extracto: "Reflexión sobre la obra del Espíritu Santo en la iglesia contemporánea y cómo manifestar sus dones en la vida diaria del creyente.", visitas: 1250, comentarios: 34, estado: "publicado" },
  { id: uid(), titulo: "106 Años: De la Persecución al Avivamiento", autor: "Dr. Miguel Flores", fecha: "2025-02-10", categoria: "Historia", imagen: "📜", extracto: "Recorrido histórico por más de un siglo de evangelismo en el Perú, desde los misioneros pioneros hasta la iglesia de hoy.", visitas: 890, comentarios: 28, estado: "publicado" },
  { id: uid(), titulo: "Cómo Implementar Células en tu Iglesia Local", autor: "Hna. Carmen López", fecha: "2025-02-05", categoria: "Ministerio", imagen: "🏠", extracto: "Guía práctica para iniciar y mantener grupos celulares efectivos que multipliquen la congregación.", visitas: 2100, comentarios: 67, estado: "publicado" },
  { id: uid(), titulo: "La Nueva Generación: Alcanzando a la Juventud", autor: "Líder Andrés Mendoza", fecha: "2025-01-28", categoria: "Jóvenes", imagen: "🎵", extracto: "Estrategias contemporáneas para conectar el evangelio con los jóvenes del siglo XXI sin perder la esencia bíblica.", visitas: 1450, comentarios: 52, estado: "publicado" },
];

// ─── CRONOGRAMA MINISTERIO DE ADOLESCENTES ──────────────────────────
// El cronograma base ahora vive en TEENS_2026 (ver AdolescentesView).
// Esta lista queda vacía: solo guarda actividades que el admin agregue desde la plataforma.
const initCronograma = [];

// ─── PLAN ESTRATÉGICO: EVANGELISMO Y MISIONES ───────────────────────
// Fuente: Plan de Liderazgo III — Jorge Luis Ayala Quispe (ICV, 2026)
const PLAN_EM = {
  meta: {
    ministerio: "Evangelismo y Misiones",
    iglesia: "Iglesia Cristo Viene – LADP",
    eje: "Eje 5: Expansión — Evangelismo, Misiones y Plantación de Iglesias",
    cobertura: "Pra. Sara Coronel",
    autor: "Jorge Luis Ayala Quispe",
    curso: "Liderazgo III · Maestro: Miguel Távara Coronel",
    fecha: "Lima, 28 de junio de 2026",
  },
  vision: "En tres años, ver un ministerio de Evangelismo y Misiones consolidado, con un equipo estable y capacitado, que impacte de manera intencional a Lima y a comunidades no alcanzadas del interior del Perú —especialmente las comunidades nativas Yánesha de Eneñas y Azulis en Villa Rica— formando a cada miembro de la iglesia como un evangelizador en su entorno cotidiano.",
  convicciones: [
    { texto: "El evangelismo no es opcional, es obediencia a la Gran Comisión.", cita: "Mateo 28:19–20" },
    { texto: "Toda persona necesita escuchar el evangelio con claridad.", cita: "Romanos 10:14–15" },
    { texto: "El poder está en el Espíritu Santo, no en mis técnicas.", cita: "Hechos 1:8" },
  ],
  foda: {
    fortalezas: ["Pasión genuina del equipo por compartir el evangelio", "Respaldo pastoral claro y doctrina sólida", "Experiencia previa en salidas y campañas evangelísticas"],
    debilidades: ["Alta rotación de voluntarios; falta un equipo estable", "Pocos miembros capacitados formalmente", "Planificación reactiva y no estratégica"],
    oportunidades: ["Apertura espiritual creciente en Lima y el Perú", "Redes sociales: alcance masivo y de bajo costo", "Comunidades nativas Yánesha de Villa Rica (Eneñas y Azulis)"],
    amenazas: ["Cultura urbana secularizada e indiferente", "Sectas que distorsionan el mensaje del evangelio", "Inseguridad ciudadana en zonas de SJL"],
  },
  problemas: [
    { problema: "Baja participación constante del equipo", causa: "Sin roles definidos ni seguimiento individual; muchos se sienten reemplazables", solucion: "Roles claros, reuniones quincenales fijas y mentoría uno a uno" },
    { problema: "Falta de seguimiento a los evangelizados", causa: "No se registran datos tras el primer contacto; no hay puente a los grupos", solucion: "Ficha digital por salida, equipo de seguimiento y derivación a grupos pequeños" },
    { problema: "Pocas capacitaciones formales", causa: "Tiempo limitado, poco material contextualizado y presupuesto reducido", solucion: "Programa trimestral, recursos digitales gratuitos y alianzas con otras iglesias" },
  ],
  objetivosCorto: [
    { n: "12", t: "miembros activos con reuniones quincenales fijas" },
    { n: "6", t: "salidas evangelísticas al año con seguimiento de contactos" },
    { n: "4", t: "capacitaciones trimestrales abiertas a toda la iglesia" },
  ],
  objetivosLargo: [
    { n: "3", t: "zonas estratégicas de SJL con presencia sostenida" },
    { n: "15", t: "hermanos en el viaje misionero anual a Villa Rica (Yánesha)" },
    { n: "5", t: "nuevos líderes formados que multipliquen el trabajo" },
  ],
  villaRica: {
    titulo: "Comunidades Yánesha de Villa Rica",
    ubicacion: "Distrito de Villa Rica · Provincia de Oxapampa · Región Pasco",
    stats: [
      { n: "12", t: "comunidades nativas Yánesha en el distrito", sub: "cuencas del Cacazú, Bocaz, Entaz y Ñagazú" },
      { n: "<5,000", t: "personas Yánesha a nivel nacional", sub: "cada vida alcanzada tiene un peso particular" },
      { n: "2", t: "comunidades priorizadas: Eneñas y Azulis", sub: "viaje anual en temporada seca (julio–agosto)" },
    ],
    estrategia: "Alianza con presbiterios e iglesias hermanas ya presentes en la zona · capacitación previa en cultura y cosmovisión Yánesha · evangelización con sensibilidad cultural + ayuda social + seguimiento posterior",
  },
  roles: [
    { rol: "Líder general", desc: "Visión, coordinación pastoral y formación de líderes", detalle: ["Cuidar la visión y dirección del ministerio", "Coordinar con la pastoral y dirección de la iglesia", "Conducir reuniones de planificación quincenales", "Acompañar y formar a los demás líderes"] },
    { rol: "Co-líder operativo", desc: "Ejecución en tiempo y forma; coordina las áreas", detalle: ["Asegurar ejecución de actividades", "Reemplazar al líder general en su ausencia", "Coordinar entre responsables de área"] },
    { rol: "Coord. de oración", desc: "Reuniones semanales; oración en cada salida", detalle: ["Convocar reuniones de oración semanales", "Oración antes, durante y después de cada salida", "Vínculo con el área de Intercesión"] },
    { rol: "Coord. de seguimiento", desc: "Registro de contactos y derivación a discipulado", detalle: ["Registrar contactos de cada salida", "Contactar interesados en dos semanas", "Derivar nuevos creyentes a Escuela Dominical o grupo"] },
    { rol: "Coord. contenido digital", desc: "Videos, posts y documentación de campañas", detalle: ["Producir contenido evangelístico breve", "Documentar salidas con foto y video", "Coordinar con Comunicaciones"] },
    { rol: "Coord. de capacitación", desc: "4 capacitaciones trimestrales al año", detalle: ["Diseñar las capacitaciones del año", "Curar recursos formativos", "Coordinar formadores internos o externos"] },
    { rol: "Coord. de logística", desc: "Permisos, transporte, materiales y presupuesto", detalle: ["Permisos, transporte y refrigerios por salida", "Manejo del presupuesto operativo", "Coordinación con Economía de la iglesia"] },
  ],
  lineaBase: [
    { ind: "Miembros activos del equipo", hoy: "6", a1: "12", a3: "17", resp: "Líder general" },
    { ind: "Salidas evangelísticas al año", hoy: "2–3", a1: "6", a3: "36 (3 zonas)", resp: "Co-líder operativo" },
    { ind: "Contactos registrados por salida", hoy: "0", a1: "10", a3: "15", resp: "Coord. seguimiento" },
    { ind: "Personas derivadas a discipulado", hoy: "0", a1: "20/año", a3: "60/año", resp: "Coord. seguimiento" },
    { ind: "Capacitaciones internas", hoy: "0–1", a1: "4", a3: "4 + retiro", resp: "Coord. capacitación" },
    { ind: "Viajes misioneros realizados", hoy: "0", a1: "1 (15 pers.)", a3: "3 acumulados", resp: "Líder general" },
    { ind: "Publicaciones en redes", hoy: "Esporádicas", a1: "8/mes", a3: "12+/mes", resp: "Coord. contenido" },
    { ind: "Líderes en formación", hoy: "0", a1: "2", a3: "5", resp: "Líder general" },
  ],
  cronograma: [
    { grupo: "Permanentes (todos los trimestres)", color: G.primary, items: ["Reuniones de oración semanales", "Mentoría uno a uno", "Recaudación de ofrendas misioneras", "Evaluación interna trimestral"] },
    { grupo: "Recurrentes (varias veces al año)", color: G.success, items: ["Salidas evangelísticas mensuales (T2 en adelante)", "Capacitaciones trimestrales (4/año)", "Cultos misioneros y feria (2/año)", "Talleres evangelísticos (2/año)", "Contenido digital mensual"] },
    { grupo: "Estacionales (fechas clave)", color: G.accent, items: ["Viaje misionero a Villa Rica (T3: julio–agosto)", "Aniversario CV + Semana Santa (T2)", "Campaña evangelística de Navidad (T4)", "Evaluación anual con la Pra. Sara Coronel (T4)"] },
  ],
  evaluacion: {
    ritmos: [
      { t: "Mensual", d: "Revisión rápida de 20 min: salidas, oración, redes y seguimiento" },
      { t: "Trimestral", d: "Avance de objetivos e indicadores de línea base; ajustes" },
      { t: "Semestral", d: "Desarrollo de líderes en formación y clima del equipo" },
      { t: "Anual", d: "Balance con la Pra. Sara Coronel y plan del año siguiente" },
    ],
    quien: ["Cada coordinador reporta los indicadores de su área", "El co-líder consolida el reporte mensual y trimestral", "El líder general revisa el cumplimiento global", "La Pra. Sara Coronel aprueba el balance anual"],
    instrumentos: ["Ficha de registro por salida (fecha, zona, contactos)", "Planilla de línea base actualizada trimestralmente", "Registro de asistencia a reuniones y capacitaciones", "Acta breve de cada evaluación con acuerdos y fechas"],
  },
};

const initGastos = [
  { id: uid(), concepto: "Servicios básicos (luz, agua, internet)", monto: 1200, categoria: "Operativo", fecha: "2025-02-01", responsable: "Rosario Díaz", estado: "pagado" },
  { id: uid(), concepto: "Materiales Escuela Dominical", monto: 350, categoria: "Educación", fecha: "2025-02-05", responsable: "Ana Soto Vega", estado: "pagado" },
  { id: uid(), concepto: "Mantenimiento templo", monto: 800, categoria: "Mantenimiento", fecha: "2025-02-10", responsable: "Roberto Flores", estado: "pagado" },
  { id: uid(), concepto: "Viáticos equipo misionero", monto: 2500, categoria: "Misiones", fecha: "2025-02-12", responsable: "Rev. José Martínez", estado: "pendiente" },
  { id: uid(), concepto: "Equipos de sonido (repuestos)", monto: 450, categoria: "Equipamiento", fecha: "2025-02-15", responsable: "David Torres", estado: "pagado" },
];

// ─── COMPONENTES BASE ───────────────────────────────────────────────
const font = "'DM Sans', sans-serif";
const fontTitle = "'Playfair Display', serif";

const Avatar = ({ initials, size = 40, color = G.primary }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${color}dd, ${color})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0, fontFamily: font, letterSpacing: 0.5 }}>
    {initials}
  </div>
);

const Badge = ({ children, variant = "default", size = "sm" }) => {
  const v = {
    default: { bg: G.grayLight, color: G.gray },
    primary: { bg: G.primary + "14", color: G.primary },
    success: { bg: G.successLight, color: G.success },
    warning: { bg: G.warningLight, color: G.warning },
    danger: { bg: G.dangerLight, color: G.danger },
    purple: { bg: G.purpleLight, color: G.purple },
  };
  const s = v[variant] || v.default;
  const pad = size === "lg" ? "6px 14px" : "3px 10px";
  const fs = size === "lg" ? 13 : 11.5;
  return <span style={{ background: s.bg, color: s.color, padding: pad, borderRadius: 6, fontSize: fs, fontWeight: 600, fontFamily: font, whiteSpace: "nowrap", display: "inline-block" }}>{children}</span>;
};

const Button = ({ children, variant = "primary", size = "md", icon: Icon, onClick, fullWidth, disabled, style: extraStyle }) => {
  const sizes = { sm: "7px 14px", md: "10px 20px", lg: "13px 28px" };
  const fs = { sm: 12.5, md: 13.5, lg: 15 };
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const isGhost = variant === "ghost";
  const bg = isPrimary ? `linear-gradient(135deg, ${G.primary}, ${G.primaryLight})` : isDanger ? `linear-gradient(135deg, ${G.danger}, #e05545)` : isGhost ? "transparent" : "transparent";
  const color = isPrimary || isDanger ? "#fff" : G.primary;
  const border = isPrimary || isDanger || isGhost ? "none" : `2px solid ${G.primary}30`;
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: sizes[size], fontSize: fs[size], display: "inline-flex", alignItems: "center", gap: 7, justifyContent: "center", width: fullWidth ? "100%" : "auto", opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer", background: bg, color, border, borderRadius: 10, fontWeight: 600, fontFamily: font, transition: "all 0.2s", ...extraStyle }} onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = isPrimary ? `0 6px 20px ${G.primary}30` : "none"; }}} onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
};

const Card = ({ children, hover, onClick, style: s, className = "" }) => (
  <div onClick={onClick} className={`ui-card ${hover ? "card-hover" : ""} ${className}`} style={{ background: "#fff", borderRadius: 14, padding: 18, border: `1px solid ${G.grayMid}40`, cursor: onClick ? "pointer" : "default", ...s }}>
    {children}
  </div>
);

const Input = ({ label, value, onChange, placeholder, type = "text", icon: Icon, required, disabled, style: s }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5, ...s }}>
    {label && <label style={{ fontSize: 12.5, color: G.dark, fontWeight: 600, fontFamily: font }}>{label}{required && <span style={{ color: G.danger }}> *</span>}</label>}
    <div style={{ position: "relative" }}>
      {Icon && <Icon size={14} color={G.gray} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} style={{ width: "100%", padding: Icon ? "10px 12px 10px 36px" : "10px 14px", borderRadius: 10, border: `1.5px solid ${G.grayMid}`, fontSize: 13.5, outline: "none", background: disabled ? G.grayLight : "#fff", transition: "all 0.2s", fontFamily: font, color: G.dark, boxSizing: "border-box" }} onFocus={e => { e.target.style.borderColor = G.primary; e.target.style.boxShadow = `0 0 0 3px ${G.primary}10`; }} onBlur={e => { e.target.style.borderColor = G.grayMid; e.target.style.boxShadow = "none"; }} />
    </div>
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, rows = 3, required }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <label style={{ fontSize: 12.5, color: G.dark, fontWeight: 600, fontFamily: font }}>{label}{required && <span style={{ color: G.danger }}> *</span>}</label>}
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${G.grayMid}`, fontSize: 13.5, outline: "none", resize: "vertical", fontFamily: font, color: G.dark, transition: "all 0.2s" }} onFocus={e => { e.target.style.borderColor = G.primary; e.target.style.boxShadow = `0 0 0 3px ${G.primary}10`; }} onBlur={e => { e.target.style.borderColor = G.grayMid; e.target.style.boxShadow = "none"; }} />
  </div>
);

const Select = ({ label, value, onChange, options, required }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <label style={{ fontSize: 12.5, color: G.dark, fontWeight: 600, fontFamily: font }}>{label}{required && <span style={{ color: G.danger }}> *</span>}</label>}
    <select value={value} onChange={onChange} style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${G.grayMid}`, fontSize: 13.5, outline: "none", fontFamily: font, color: G.dark, background: "#fff", cursor: "pointer", appearance: "auto" }}>
      {options.map(o => <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>{typeof o === "string" ? o : o.label}</option>)}
    </select>
  </div>
);

const Modal = ({ children, onClose, title, width = 560 }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(15,25,35,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }} className="fadein" onClick={onClose}>
    <div className="scaleIn" style={{ background: "#fff", borderRadius: 18, maxWidth: width, width: "100%", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
      <div className="modal-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: `1px solid ${G.grayMid}40` }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: fontTitle, color: G.dark }}>{title}</h3>
        <button onClick={onClose} style={{ background: G.grayLight, border: "none", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex" }}><X size={18} color={G.gray} /></button>
      </div>
      <div className="modal-body" style={{ padding: "18px 22px", overflowY: "auto", flex: 1 }}>
        {children}
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, icon: Icon, color, trend, onClick }) => (
  <Card hover={!!onClick} onClick={onClick} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
    <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={18} color={color} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: G.dark, fontFamily: fontTitle, letterSpacing: -0.5, lineHeight: 1.1 }}>{value}</span>
        {trend && <span style={{ fontSize: 11, fontWeight: 700, color: G.success, background: G.successLight, padding: "1px 6px", borderRadius: 6 }}>{trend}</span>}
      </div>
      <div style={{ fontSize: 12, color: G.gray, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
    </div>
  </Card>
);

const MiniBarChart = ({ data, height = 120 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height, padding: "8px 0" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: G.primary }}>{d.value > 0 ? fmt(d.value) : "—"}</div>
          <div style={{ width: "100%", background: d.value > 0 ? `linear-gradient(180deg, ${G.primary}, ${G.primaryLight})` : G.grayMid + "40", borderRadius: "5px 5px 0 0", height: `${Math.max((d.value / max) * 85, 3)}%`, transition: "height 0.8s ease" }} />
          <div style={{ fontSize: 10.5, color: G.gray, fontWeight: 600 }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
};

const STag = ({ children }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: G.accent + "12", padding: "5px 16px", borderRadius: 24, marginBottom: 18 }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: G.accent }} />
    <span style={{ fontSize: 11, fontWeight: 800, color: G.accent, letterSpacing: 2, textTransform: "uppercase" }}>{children}</span>
  </div>
);

const EmptyState = ({ icon: Icon, message, action, onAction }) => (
  <div style={{ textAlign: "center", padding: "48px 24px" }}>
    <div style={{ width: 64, height: 64, borderRadius: 16, background: G.grayLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
      <Icon size={28} color={G.grayMid} />
    </div>
    <p style={{ fontSize: 14, color: G.gray, marginBottom: action ? 16 : 0 }}>{message}</p>
    {action && <Button variant="primary" size="sm" onClick={onAction}>{action}</Button>}
  </div>
);

const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <Modal title="Confirmar acción" onClose={onCancel} width={420}>
    <p style={{ fontSize: 14, color: G.dark, lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
    <div style={{ display: "flex", gap: 10 }}>
      <Button variant="outline" size="md" onClick={onCancel} fullWidth>Cancelar</Button>
      <Button variant="danger" size="md" onClick={onConfirm} fullWidth icon={Trash2}>Eliminar</Button>
    </div>
  </Modal>
);

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: G.success, error: G.danger, warning: G.warning, info: G.primary };
  const bgs = { success: G.successLight, error: G.dangerLight, warning: G.warningLight, info: G.primary + "10" };
  return (
    <div className="slideIn" style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: bgs[type], border: `1px solid ${colors[type]}30`, borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxWidth: 380 }}>
      <Check size={18} color={colors[type]} />
      <span style={{ fontSize: 13.5, fontWeight: 600, color: G.dark, fontFamily: font }}>{message}</span>
    </div>
  );
};

const TabBar = ({ tabs, active, onChange }) => (
  <div style={{ display: "flex", gap: 2, marginBottom: 24, borderBottom: `2px solid ${G.grayMid}40`, overflowX: "auto" }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: "8px 8px 0 0", border: "none", background: active === t.id ? "#fff" : "transparent", color: active === t.id ? G.primary : G.gray, cursor: "pointer", fontWeight: active === t.id ? 700 : 500, fontSize: 13.5, borderBottom: active === t.id ? `3px solid ${G.primary}` : "3px solid transparent", marginBottom: "-2px", transition: "all 0.2s", fontFamily: font, whiteSpace: "nowrap" }}>
        {t.icon && <t.icon size={16} />}{t.label}
      </button>
    ))}
  </div>
);

const PageHeader = ({ title, subtitle, actions }) => (
  <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
    <div>
      <h1 style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 800, color: G.dark, fontFamily: fontTitle, letterSpacing: -0.5 }}>{title}</h1>
      <p style={{ margin: 0, fontSize: 13, color: G.gray }}>{subtitle}</p>
    </div>
    {actions && <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{actions}</div>}
  </div>
);

// ─── LANDING PAGE ──────────────────────────────────────────────────
const LandingPage = ({ onLogin, onTienda }) => {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredMin, setHoveredMin] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const scrollTo = id => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 68, behavior: "smooth" });
    window.history.replaceState({}, "", `/#${id}`);
  };
  // Al entrar con /#seccion (p. ej. un link compartido) baja a esa sección
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) setTimeout(() => { const el = document.getElementById(id); if (el) window.scrollTo({ top: el.offsetTop - 68 }); }, 100);
  }, []);
  const footerLinks = { Nosotros: "#visitanos", Creencias: "#como-funciona", Liderazgo: "#ministerios", Contacto: "#contacto", "Visítanos": "#visitanos", "Grupos de Vida": "#ministerios", Servir: "#ministerios", Bautismo: "#contacto", Sermones: "#sermones", Blog: "#sermones", Devocionales: "#sermones", Tienda: "/tienda" };
  const irA = (destino) => destino.startsWith("#") ? scrollTo(destino.slice(1)) : navegar(destino);

  const sermons = [
    { title: "El Poder que Transforma", speaker: "Pastor Daniel Caballero", series: "Avivamiento", date: "23 Feb", emoji: "🔥" },
    { title: "Fe para Tiempos Difíciles", speaker: "Rev. José Martínez", series: "Esperanza", date: "16 Feb", emoji: "⚡" },
    { title: "El Llamado del Discípulo", speaker: "Pastora Carmen López", series: "Discipulado", date: "9 Feb", emoji: "✝️" },
  ];
  const minis = [
    { name: "Niños", emoji: "🧒", desc: "Un lugar donde los niños descubren el amor de Dios", color: "#ec4899" },
    { name: "Jóvenes", emoji: "🎸", desc: "Comunidad y propósito para la próxima generación", color: "#8b5cf6" },
    { name: "Mujeres", emoji: "💜", desc: "Encuentros, retiros y discipulado femenino", color: "#f59e0b" },
    { name: "Hombres", emoji: "💪", desc: "Fortaleciendo líderes y hombres de integridad", color: "#2563eb" },
    { name: "Misiones", emoji: "🌎", desc: "Llevando el evangelio hasta lo último de la tierra", color: "#10b981" },
    { name: "Alabanza", emoji: "🎵", desc: "Adoración que transforma vidas y toca el cielo", color: "#ef4444" },
  ];
  const testimonials = [
    { name: "María G.", text: "Llegué rota y encontré una familia. La célula cambió mi vida completamente.", role: "Miembro desde 2020" },
    { name: "Carlos M.", text: "Aquí aprendí que Dios tenía un propósito. Me bauticé y ahora sirvo como diácono.", role: "Diácono" },
    { name: "Ana S.", text: "El ministerio de niños impactó tanto a mis hijos que ahora toda la familia sirve.", role: "Maestra Esc. Dominical" },
  ];
  const events = [
    { name: "106 Aniversario LADP", date: "22 Mar", place: "Huánuco", emoji: "🎉", featured: true },
    { name: "Vigilia de Oración", date: "7 Mar", place: "Templo Central", emoji: "🙏" },
    { name: "Retiro de Jóvenes", date: "15 Abr", place: "Cieneguilla", emoji: "⛺" },
  ];

  return (
    <div style={{ fontFamily: font, color: G.dark, background: "#fff", overflowX: "hidden" }}>
      <GlobalStyles />
      <style>{`
        @keyframes heroFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .hero-float { animation: heroFloat 5s ease-in-out infinite; }
        .gradient-animate { background-size: 200% 200%; animation: gradientShift 6s ease infinite; }
        .lcard { transition: all 0.4s cubic-bezier(.4,0,.2,1); }
        .lcard:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 24px 48px rgba(15,25,35,0.12); }
        .scard { transition: all 0.35s ease; position: relative; overflow: hidden; }
        .scard::before { content:''; position:absolute; inset:0; background: linear-gradient(135deg,rgba(26,58,92,0.03),rgba(200,145,58,0.06)); opacity:0; transition:opacity 0.35s; }
        .scard:hover::before { opacity:1; }
        .scard:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(15,25,35,0.1); }
        .nbtn { position:relative; overflow:hidden; }
        .nbtn::after { content:''; position:absolute; bottom:0; left:50%; width:0; height:2px; background:${G.accent}; transition:all 0.3s; transform:translateX(-50%); }
        .nbtn:hover::after { width:70%; }
        .tcard { transition: all 0.3s ease; border: 2px solid transparent; }
        .tcard:hover { border-color: ${G.accent}40; transform: translateY(-4px); }
      `}</style>
      {/* ═══ NAV — Elevation style: dark, minimal + responsive ═══ */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 999, background: scrolled ? "rgba(15,25,35,0.96)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", transition: "all 0.45s cubic-bezier(.4,0,.2,1)", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: scrolled ? 64 : 80, transition: "height 0.35s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${G.accent}, ${G.accentLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 22, fontFamily: fontTitle, boxShadow: `0 4px 16px ${G.accent}40` }}>L</div>
            <div><div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: fontTitle }}>LADP</div><div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 3, marginTop: -1 }}>Iglesia - ICV</div></div>
          </div>
          <div className="nav-links" style={{ display: "flex", gap: 4 }}>
            {[{ l: "Visítanos", h: "visitanos" },{ l: "Sermones", h: "sermones" },{ l: "Ministerios", h: "ministerios" },{ l: "Cómo Funciona", h: "como-funciona" },{ l: "Eventos", h: "eventos" }].map(item => (
              <a key={item.l} href={`#${item.h}`} onClick={e => { e.preventDefault(); scrollTo(item.h); }} className="nbtn" style={{ display: "inline-block", textDecoration: "none", background: "none", border: "none", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.75)", cursor: "pointer", padding: "10px 18px", fontFamily: font, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}>{item.l}</a>
            ))}
            <button onClick={onTienda} className="nbtn" style={{ background: "none", border: "none", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.75)", cursor: "pointer", padding: "10px 18px", fontFamily: font, transition: "color 0.2s", display: "flex", alignItems: "center", gap: 5 }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}><ShoppingCart size={14} /> Tienda</button>
          </div>
          <div className="nav-actions" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="donar-btn" onClick={() => scrollTo("donar")} style={{ padding: "10px 22px", fontSize: 13.5, fontWeight: 700, background: G.accent, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s", boxShadow: `0 4px 16px ${G.accent}30` }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}><Heart size={15} /> Donar</button>
            <button onClick={onLogin} style={{ padding: "10px 22px", fontSize: 13.5, fontWeight: 700, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, cursor: "pointer", fontFamily: font, transition: "all 0.2s", backdropFilter: "blur(8px)" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>Ingresar</button>
            <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}</button>
          </div>
        </div>
        {/* ═══ MOBILE MENU OVERLAY ═══ */}
        {mobileMenuOpen && (
          <div className="fadein" style={{ background: "rgba(15,25,35,0.98)", backdropFilter: "blur(20px)", padding: "20px 24px 28px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 6 }}>
            {[{ l: "Visítanos", h: "visitanos" },{ l: "Sermones", h: "sermones" },{ l: "Ministerios", h: "ministerios" },{ l: "Cómo Funciona", h: "como-funciona" },{ l: "Eventos", h: "eventos" }].map(item => (
              <button key={item.l} onClick={() => { scrollTo(item.h); setMobileMenuOpen(false); }} style={{ background: "rgba(255,255,255,0.04)", border: "none", fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.85)", cursor: "pointer", padding: "14px 18px", fontFamily: font, textAlign: "left", borderRadius: 12, transition: "background 0.2s" }}>{item.l}</button>
            ))}
            <button onClick={() => { onTienda(); setMobileMenuOpen(false); }} style={{ background: "rgba(255,255,255,0.04)", border: "none", fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.85)", cursor: "pointer", padding: "14px 18px", fontFamily: font, textAlign: "left", borderRadius: 12, display: "flex", alignItems: "center", gap: 8 }}><ShoppingCart size={16} /> Tienda</button>
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button onClick={() => { scrollTo("donar"); setMobileMenuOpen(false); }} style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 700, background: G.accent, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}><Heart size={15} /> Donar</button>
              <button onClick={() => { onLogin(); setMobileMenuOpen(false); }} style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 700, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, cursor: "pointer", fontFamily: font }}>Ingresar</button>
            </div>
          </div>
        )}
      </nav>
      {/* ═══ HERO — Hillsong/Vous dark cinematic fullscreen ═══ */}
      <section className="hero-section" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", background: `linear-gradient(160deg, ${G.primaryDark} 0%, #0a1628 30%, #111827 60%, ${G.primaryDark} 100%)` }}>
        <div className="hero-float" style={{ position: "absolute", top: "10%", right: "8%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${G.accent}15, transparent 70%)`, pointerEvents: "none" }} />
        <div className="hero-float" style={{ position: "absolute", bottom: "5%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${G.primaryLight}12, transparent 70%)`, pointerEvents: "none", animationDelay: "-2.5s" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 940, margin: "0 auto", textAlign: "center", position: "relative", padding: "0 32px" }} className="fadeup">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 20px", borderRadius: 30, marginBottom: 36, backdropFilter: "blur(10px)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s ease infinite", boxShadow: "0 0 8px #ef4444" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: 2, textTransform: "uppercase" }}>En Vivo · Domingos 9:00 AM & 6:00 PM</span>
          </div>
          <h1 className="hero-title" style={{ margin: "0 0 28px", fontSize: "clamp(48px, 7vw, 96px)", fontWeight: 800, lineHeight: 1.02, letterSpacing: -4, color: "#fff", fontFamily: fontTitle }}>Un lugar donde<br /><span className="gradient-animate" style={{ background: `linear-gradient(135deg, ${G.accent}, ${G.accentLight}, #fff, ${G.accent})`, backgroundSize: "200% 200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>todo cambia</span></h1>
          <p className="hero-subtitle" style={{ margin: "0 auto 48px", fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.7, color: "rgba(255,255,255,0.6)", maxWidth: 580 }}>Somos una iglesia llena del Espíritu Santo donde cualquier persona puede encontrar esperanza, comunidad y propósito.</p>
          <div className="hero-buttons" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
            <button onClick={() => scrollTo("visitanos")} style={{ padding: "16px 40px", fontSize: 16, fontWeight: 800, background: G.accent, color: "#fff", border: "none", borderRadius: 14, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 10, transition: "all 0.3s", boxShadow: `0 8px 32px ${G.accent}40` }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.03)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>Planifica tu Visita <ArrowRight size={18} /></button>
            <button onClick={() => scrollTo("sermones")} style={{ padding: "16px 40px", fontSize: 16, fontWeight: 700, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 10, backdropFilter: "blur(10px)", transition: "all 0.3s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}><Play size={18} /> Ver Último Sermón</button>
          </div>
          <div style={{ display: "flex", gap: 0, maxWidth: 680, margin: "0 auto", borderRadius: 18, overflow: "hidden", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
            {[{ n: "75", l: "Regiones" },{ n: "6,000+", l: "Ministros" },{ n: "6,000+", l: "Congregaciones" },{ n: "106", l: "Años" }].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: "26px 16px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: G.accent, fontFamily: fontTitle, letterSpacing: -1 }}>{s.n}</div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginTop: 4, textTransform: "uppercase", letterSpacing: 1.5 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", opacity: 0.5 }} onClick={() => scrollTo("visitanos")}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: 2, textTransform: "uppercase" }}>Descubre más</span>
          <ChevronDown size={20} color="rgba(255,255,255,0.4)" style={{ animation: "heroFloat 2s ease-in-out infinite" }} />
        </div>
      </section>
      {/* ═══ VISIT — Bethel/Life.Church Plan a Visit ═══ */}
      <section id="visitanos" className="landing-section" style={{ padding: "120px 32px", background: "#fff" }}>
        <div className="grid-2col" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <STag>Visítanos</STag>
            <h2 style={{ margin: "0 0 20px", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: G.dark, lineHeight: 1.08, letterSpacing: -2, fontFamily: fontTitle }}>Tu primera visita será <span style={{ color: G.accent }}>inolvidable</span></h2>
            <p style={{ margin: "0 0 36px", fontSize: 17, lineHeight: 1.8, color: G.gray }}>No importa de dónde vengas. Aquí encontrarás una comunidad genuina con los brazos abiertos.</p>
            {[{ icon: Clock, label: "Horarios", value: "Domingos 9:00 AM y 6:00 PM · Miércoles 7:00 PM" },{ icon: MapPin, label: "Dirección", value: "Av. Colombia 325, Pueblo Libre, Lima" },{ icon: Users, label: "¿Qué esperar?", value: "Alabanza contemporánea · Mensaje relevante · Ministerio infantil" }].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: G.accent + "10", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><item.icon size={22} color={G.accent} /></div>
                <div><div style={{ fontSize: 13, fontWeight: 800, color: G.dark, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{item.label}</div><div style={{ fontSize: 15, color: G.gray, lineHeight: 1.6 }}>{item.value}</div></div>
              </div>
            ))}
            <button onClick={() => scrollTo("contacto")} style={{ marginTop: 16, padding: "16px 36px", fontSize: 15, fontWeight: 800, background: `linear-gradient(135deg, ${G.primary}, ${G.primaryLight})`, color: "#fff", border: "none", borderRadius: 14, cursor: "pointer", fontFamily: font, display: "inline-flex", alignItems: "center", gap: 10, transition: "all 0.3s", boxShadow: `0 8px 24px ${G.primary}25` }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>Planifica tu Visita <ArrowRight size={17} /></button>
          </div>
          <div className="visit-features" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[{ emoji: "⛪", title: "Ambiente\nAcogedor", bg: `linear-gradient(135deg, ${G.primary}, ${G.primaryLight})`, col: "#fff" },{ emoji: "🎶", title: "Alabanza\nQue Inspira", bg: `linear-gradient(135deg, ${G.accent}, ${G.accentLight})`, col: "#fff" },{ emoji: "📖", title: "Mensaje\nRelevante", bg: G.grayLight, col: G.dark },{ emoji: "👶", title: "Ministerio\nInfantil", bg: G.grayLight, col: G.dark }].map((c, i) => (
              <div key={i} className="lcard" style={{ background: c.bg, borderRadius: 20, padding: "40px 28px", textAlign: "center", cursor: "default" }}><div style={{ fontSize: 48, marginBottom: 14 }}>{c.emoji}</div><div style={{ fontSize: 16, fontWeight: 800, color: c.col, fontFamily: fontTitle, lineHeight: 1.3, whiteSpace: "pre-line" }}>{c.title}</div></div>
            ))}
          </div>
        </div>
      </section>
      {/* ═══ SERMONS — Elevation style: content first ═══ */}
      <section id="sermones" className="landing-section" style={{ padding: "120px 32px", background: G.dark, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(rgba(200,145,58,0.04) 1px, transparent 1px)`, backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <STag>Últimos Sermones</STag>
            <h2 style={{ margin: "0 0 16px", fontSize: "clamp(36px, 4.5vw, 56px)", fontWeight: 800, color: "#fff", letterSpacing: -2, fontFamily: fontTitle }}>La Palabra que transforma</h2>
            <p style={{ margin: "0 auto", fontSize: 17, color: "rgba(255,255,255,0.5)", maxWidth: 500 }}>Mira nuestros mensajes más recientes</p>
          </div>
          <div className="sermon-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
            {sermons.map((s, i) => (
              <div key={i} className="scard" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, cursor: "pointer", overflow: "hidden" }}>
                <div style={{ background: `linear-gradient(135deg, ${G.primaryDark}, ${G.primary}80)`, padding: "48px 32px 40px", position: "relative" }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>{s.emoji}</div>
                  <div style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}><Play size={14} color="#fff" /><span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Ver</span></div>
                  <Badge variant="default"><span style={{ color: G.accent }}>{s.series}</span></Badge>
                </div>
                <div style={{ padding: "28px 32px 32px" }}>
                  <h3 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.25, fontFamily: fontTitle }}>{s.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.4)" }}><span style={{ fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{s.speaker}</span><span>·</span><span>{s.date}</span></div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <button style={{ padding: "14px 36px", fontSize: 15, fontWeight: 700, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, cursor: "pointer", fontFamily: font, display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>Ver Todos los Sermones <ArrowRight size={16} /></button>
          </div>
        </div>
      </section>
      {/* ═══ MINISTRIES — Life.Church/Saddleback pathways ═══ */}
      <section id="ministerios" className="landing-section" style={{ padding: "120px 32px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}><STag>Ministerios</STag><h2 style={{ margin: "0 0 16px", fontSize: "clamp(36px, 4vw, 54px)", fontWeight: 800, color: G.dark, letterSpacing: -2, fontFamily: fontTitle }}>Hay un lugar para <span style={{ color: G.accent }}>ti</span></h2><p style={{ margin: "0 auto", fontSize: 17, color: G.gray, maxWidth: 520 }}>Encuentra tu comunidad, descubre tus dones y sirve con propósito</p></div>
          <div className="ministry-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 18 }}>
            {minis.map((m, i) => (
              <div key={i} className="lcard" style={{ background: "#fff", border: `1px solid ${G.grayMid}40`, borderRadius: 20, padding: "36px 24px", textAlign: "center", cursor: "pointer", position: "relative", overflow: "hidden" }} onMouseEnter={() => setHoveredMin(i)} onMouseLeave={() => setHoveredMin(null)}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: hoveredMin === i ? m.color : "transparent", transition: "all 0.3s", borderRadius: "20px 20px 0 0" }} />
                <div style={{ fontSize: 48, marginBottom: 16, transition: "transform 0.3s", transform: hoveredMin === i ? "scale(1.15)" : "scale(1)" }}>{m.emoji}</div>
                <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>{m.name}</h3>
                <p style={{ margin: 0, fontSize: 13, color: G.gray, lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ═══ GROUPS — Transformation/Elevation community ═══ */}
      <section className="landing-section" style={{ padding: "100px 32px", background: G.grayLight }}>
        <div className="groups-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <div style={{ background: `linear-gradient(135deg, ${G.primaryDark}, ${G.primary})`, borderRadius: 24, padding: "64px 48px", textAlign: "center", color: "#fff", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${G.accent}20, transparent)` }} />
              <div style={{ fontSize: 72, marginBottom: 20 }}>🏠</div>
              <h3 style={{ margin: "0 0 12px", fontSize: 32, fontWeight: 800, fontFamily: fontTitle, letterSpacing: -1 }}>Grupos de Vida</h3>
              <p style={{ fontSize: 16, opacity: 0.75, lineHeight: 1.6, maxWidth: 340, margin: "0 auto 28px" }}>La vida cristiana se vive en comunidad durante la semana.</p>
              <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
                {[{ n: "25+", l: "Células" },{ n: "200+", l: "Conectados" }].map((s, i) => (<div key={i} style={{ textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 800, color: G.accent, fontFamily: fontTitle }}>{s.n}</div><div style={{ fontSize: 11, fontWeight: 600, opacity: 0.6, textTransform: "uppercase", letterSpacing: 1.5 }}>{s.l}</div></div>))}
              </div>
            </div>
          </div>
          <div>
            <STag>Grupos de Vida</STag>
            <h2 style={{ margin: "0 0 20px", fontSize: "clamp(32px, 3.5vw, 48px)", fontWeight: 800, color: G.dark, lineHeight: 1.08, letterSpacing: -1.5, fontFamily: fontTitle }}>La vida es mejor en <span style={{ color: G.accent }}>comunidad</span></h2>
            <p style={{ margin: "0 0 32px", fontSize: 17, lineHeight: 1.8, color: G.gray }}>Nuestros Grupos de Vida se reúnen semanalmente en hogares por toda Lima.</p>
            {["Grupos para todas las edades y etapas de la vida","Reuniones semanales en hogares de toda Lima","Estudio bíblico, oración y compañerismo genuino","Líderes capacitados que te acompañan"].map((txt, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}><div style={{ width: 28, height: 28, borderRadius: 8, background: G.accent + "14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Check size={15} color={G.accent} /></div><span style={{ fontSize: 15, color: G.dark, fontWeight: 500 }}>{txt}</span></div>
            ))}
            <button style={{ marginTop: 20, padding: "14px 32px", fontSize: 15, fontWeight: 700, background: `linear-gradient(135deg, ${G.primary}, ${G.primaryLight})`, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: font, display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>Encuentra tu Grupo <ArrowRight size={16} /></button>
          </div>
        </div>
      </section>
      {/* ═══ CÓMO FUNCIONA ═══ */}
      <section id="como-funciona" className="landing-section" style={{ padding: "120px 32px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <STag>Cómo Funciona</STag>
            <h2 style={{ margin: "0 0 16px", fontSize: "clamp(36px, 4vw, 54px)", fontWeight: 800, color: G.dark, letterSpacing: -2, fontFamily: fontTitle }}>Tu camino para <span style={{ color: G.accent }}>conectarte</span></h2>
            <p style={{ margin: "0 auto", fontSize: 17, color: G.gray, maxWidth: 520, lineHeight: 1.7 }}>Cuatro pasos sencillos para ser parte de nuestra familia y crecer en la fe</p>
          </div>
          <div className="como-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32, position: "relative" }}>
            {[
              { step: "01", emoji: "🚪", title: "Visítanos", desc: "Ven cualquier domingo a las 9:00 AM o 6:00 PM. No necesitas registro previo — ¡solo ven como eres!", detail: "Estamos ubicados en Av. Principal 123. El ambiente es acogedor y el equipo de recepción te dará la bienvenida.", color: G.primary },
              { step: "02", emoji: "🤝", title: "Conéctate", desc: "Únete a un Grupo de Vida cerca de tu hogar. Comparte vida real con personas que te acompañan en la fe.", detail: "Los Grupos de Vida se reúnen entre semana en diferentes distritos. Puedes encontrar el más cercano en nuestra plataforma.", color: G.accent },
              { step: "03", emoji: "📖", title: "Crece", desc: "Participa en la Escuela Bíblica, retiros y talleres diseñados para fortalecer tu relación con Dios.", detail: "La Escuela Bíblica ofrece niveles desde principiante hasta avanzado. Los retiros se realizan trimestralmente.", color: G.success },
              { step: "04", emoji: "✨", title: "Sirve", desc: "Descubre tus dones y úsalos en uno de nuestros ministerios. ¡Hay un lugar especial para ti aquí!", detail: "Contamos con ministerios de alabanza, jóvenes, niños, ayuda social, comunicaciones y más. Todos son bienvenidos.", color: G.purple },
            ].map((item, i) => (
              <div key={i} className="card-hover" style={{ background: G.grayLight, borderRadius: 24, padding: "40px 32px", textAlign: "center", position: "relative", zIndex: 1, border: `1px solid ${G.grayMid}` }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: item.color + "14", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 36 }}>{item.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: item.color, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>PASO {item.step}</div>
                <h3 style={{ margin: "0 0 14px", fontSize: 22, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>{item.title}</h3>
                <p style={{ margin: "0 0 14px", fontSize: 14.5, color: G.gray, lineHeight: 1.7 }}>{item.desc}</p>
                <p style={{ margin: 0, fontSize: 13, color: G.gray, lineHeight: 1.6, borderTop: `1px solid ${G.grayMid}`, paddingTop: 14, fontStyle: "italic" }}>{item.detail}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 56 }}>
            <button style={{ padding: "16px 40px", fontSize: 15, fontWeight: 800, background: `linear-gradient(135deg, ${G.accent}, ${G.accentLight})`, color: "#fff", border: "none", borderRadius: 14, cursor: "pointer", fontFamily: font, display: "inline-flex", alignItems: "center", gap: 10, boxShadow: `0 8px 28px ${G.accent}35`, transition: "all 0.25s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              Comenzar mi Camino <ArrowRight size={18} />
            </button>
          </div>

          {/* ─── Plataforma Digital ─── */}
          <div className="digital-box" style={{ marginTop: 96, background: `linear-gradient(135deg, ${G.primary}08, ${G.primaryLight}10)`, borderRadius: 28, padding: "56px 48px", border: `1px solid ${G.primary}15` }}>
            <div className="digital-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
              <div>
                <STag>Plataforma Digital</STag>
                <h3 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 800, color: G.dark, letterSpacing: -1.5, fontFamily: fontTitle, lineHeight: 1.2 }}>Tu iglesia, <span style={{ color: G.accent }}>siempre contigo</span></h3>
                <p style={{ margin: "0 0 28px", fontSize: 16, color: G.gray, lineHeight: 1.8 }}>
                  Accede a la plataforma LADP ICV con tu cuenta de Google o correo electrónico. Gestiona tu membresía, inscríbete a eventos, sigue el blog y mantente conectado desde cualquier dispositivo.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { icon: "🔐", title: "Acceso seguro", desc: "Inicia sesión con Google o crea una cuenta — sin contraseñas difíciles de recordar." },
                    { icon: "📋", title: "Tu perfil de miembro", desc: "Visualiza tu carnet digital, historial de diezmos y participación en ministerios." },
                    { icon: "🗓️", title: "Inscripción a eventos", desc: "Regístrate a retiros, talleres y actividades directamente desde la plataforma." },
                    { icon: "📣", title: "Blog y anuncios", desc: "Lee las últimas noticias, reflexiones y comunicados de la iglesia en tiempo real." },
                  ].map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: G.accent + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{f.icon}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: G.dark, marginBottom: 2 }}>{f.title}</div>
                        <div style={{ fontSize: 13.5, color: G.gray, lineHeight: 1.6 }}>{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", boxShadow: "0 4px 24px rgba(26,58,92,0.08)", border: `1px solid ${G.grayMid}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: G.accent, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14 }}>Preguntas frecuentes</div>
                  {[
                    { q: "¿Necesito una cuenta para visitar la iglesia?", a: "No. Puedes visitar en cualquier momento sin registro. La cuenta es solo para acceder a funciones digitales como eventos e historial." },
                    { q: "¿Cómo creo mi cuenta?", a: "Haz clic en 'Ingresar' → 'Crear cuenta'. Puedes registrarte con tu correo de Google en un solo clic." },
                    { q: "¿Mis datos están seguros?", a: "Sí. Usamos Supabase con cifrado en tránsito y en reposo, y Google OAuth para autenticación segura." },
                    { q: "¿Puedo acceder desde el celular?", a: "La plataforma está diseñada para funcionar perfectamente en cualquier dispositivo — móvil, tablet o computadora." },
                  ].map((faq, i) => (
                    <div key={i} style={{ borderBottom: i < 3 ? `1px solid ${G.grayMid}` : "none", paddingBottom: i < 3 ? 16 : 0, marginBottom: i < 3 ? 16 : 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: G.dark, marginBottom: 6, display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ color: G.accent, fontWeight: 800, flexShrink: 0 }}>Q.</span>{faq.q}
                      </div>
                      <div style={{ fontSize: 13.5, color: G.gray, lineHeight: 1.65, paddingLeft: 20 }}>{faq.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ═══ EVENTS ═══ */}
      <section id="eventos" className="landing-section" style={{ padding: "120px 32px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}><STag>Eventos</STag><h2 style={{ margin: "0 0 16px", fontSize: "clamp(36px, 4vw, 54px)", fontWeight: 800, color: G.dark, letterSpacing: -2, fontFamily: fontTitle }}>Lo que se viene</h2><p style={{ margin: "0 auto", fontSize: 17, color: G.gray, maxWidth: 480 }}>No te pierdas las actividades que Dios tiene preparadas</p></div>
          <div className="events-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
            {events.filter(e => e.featured).map((e, i) => (
              <div key={i} className="lcard" style={{ background: `linear-gradient(135deg, ${G.primaryDark}, ${G.primary})`, borderRadius: 24, padding: "56px 48px", color: "#fff", position: "relative", overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: 380 }}>
                <div style={{ position: "absolute", top: "10%", right: "8%", fontSize: 120, opacity: 0.12, pointerEvents: "none" }}>{e.emoji}</div>
                <Badge variant="default"><span style={{ color: G.accent, fontWeight: 800 }}>Evento Destacado</span></Badge>
                <h3 style={{ margin: "16px 0 12px", fontSize: 38, fontWeight: 800, fontFamily: fontTitle, letterSpacing: -1.5, lineHeight: 1.1 }}>{e.name}</h3>
                <div style={{ display: "flex", gap: 20, fontSize: 15, color: "rgba(255,255,255,0.7)" }}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><Calendar size={16} /> {e.date}</span><span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={16} /> {e.place}</span></div>
                <button style={{ marginTop: 28, padding: "14px 28px", fontSize: 14, fontWeight: 700, background: G.accent, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: font, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8 }}>Inscríbete <ArrowRight size={16} /></button>
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {events.filter(e => !e.featured).map((e, i) => (
                <div key={i} className="lcard" style={{ background: G.grayLight, borderRadius: 20, padding: "32px 28px", cursor: "pointer", flex: 1, display: "flex", gap: 20, alignItems: "center" }}>
                  <div style={{ fontSize: 48, flexShrink: 0 }}>{e.emoji}</div>
                  <div><h4 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>{e.name}</h4><div style={{ display: "flex", gap: 14, fontSize: 13, color: G.gray }}><span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={13} /> {e.date}</span><span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={13} /> {e.place}</span></div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* ═══ TIENDA CTA ═══ */}
      <section className="landing-section" style={{ padding: "80px 32px", background: G.grayLight }}>
        <div className="tienda-cta" style={{ maxWidth: 1000, margin: "0 auto", background: `linear-gradient(135deg, ${G.primary}, ${G.primaryLight})`, borderRadius: 28, padding: "56px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, flexWrap: "wrap", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: `radial-gradient(circle, ${G.accent}20, transparent)`, pointerEvents: "none" }} />
          <div style={{ flex: 1, minWidth: 280, position: "relative" }}>
            <h2 style={{ margin: "0 0 12px", fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 800, color: "#fff", fontFamily: fontTitle, letterSpacing: -1 }}>Tienda Cristiana LADP - ICV</h2>
            <p style={{ margin: 0, fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>Biblias, libros, devocionales, música y más. Envío a todo el Perú con pago seguro por Yape, Plin o tarjeta.</p>
          </div>
          <div className="tienda-cta-stats" style={{ display: "flex", gap: 36, flexShrink: 0 }}>
            {[{ n: "50+", l: "Productos" },{ n: "4.8★", l: "Valoración" }].map((s,i) => (<div key={i} style={{ textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 800, color: G.accent, fontFamily: fontTitle }}>{s.n}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>{s.l}</div></div>))}
          </div>
          <button onClick={onTienda} style={{ padding: "16px 36px", fontSize: 15, fontWeight: 800, background: G.accent, color: "#fff", border: "none", borderRadius: 14, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 10, transition: "all 0.3s", boxShadow: `0 6px 24px ${G.accent}40`, flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
            <ShoppingCart size={18} /> Ir a la Tienda <ArrowRight size={16} />
          </button>
        </div>
      </section>
      {/* ═══ TESTIMONIALS ═══ */}
      <section className="landing-section" style={{ padding: "100px 32px", background: G.grayLight }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}><STag>Testimonios</STag><h2 style={{ margin: "0 0 16px", fontSize: "clamp(32px, 3.5vw, 48px)", fontWeight: 800, color: G.dark, letterSpacing: -1.5, fontFamily: fontTitle }}>Historias que inspiran</h2></div>
          <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="tcard" style={{ background: "#fff", borderRadius: 20, padding: "36px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>{[1,2,3,4,5].map(s => <Star key={s} size={16} color={G.accent} fill={G.accent} />)}</div>
                <p style={{ margin: "0 0 24px", fontSize: 16, color: G.dark, lineHeight: 1.7, fontStyle: "italic", fontFamily: fontTitle, fontWeight: 400 }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}><Avatar initials={t.name.split(" ").map(n => n[0]).join("")} size={42} color={G.primary} /><div><div style={{ fontSize: 14, fontWeight: 800, color: G.dark }}>{t.name}</div><div style={{ fontSize: 12, color: G.gray }}>{t.role}</div></div></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ═══ GIVING — Elevation/Hillsong bold CTA ═══ */}
      <section id="donar" className="landing-section donar-section" style={{ padding: "120px 32px", position: "relative", overflow: "hidden", background: `linear-gradient(150deg, ${G.primaryDark}, #0a1628 40%, ${G.primaryDark})` }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(rgba(200,145,58,0.06) 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
        <div className="hero-float" style={{ position: "absolute", top: "-10%", left: "10%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${G.accent}10, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", color: "#fff" }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: `linear-gradient(135deg, ${G.accent}, ${G.accentLight})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", boxShadow: `0 8px 32px ${G.accent}30` }}><Heart size={36} color="#fff" /></div>
          <h2 style={{ margin: "0 0 20px", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, fontFamily: fontTitle, letterSpacing: -2, lineHeight: 1.05 }}>Tu generosidad<br />cambia vidas</h2>
          <p style={{ margin: "0 auto 44px", fontSize: 18, opacity: 0.7, lineHeight: 1.7, maxWidth: 540 }}>Cada ofrenda permite que miles conozcan a Cristo y llevemos esperanza a comunidades necesitadas.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {["Diezmo","Ofrenda","Misiones"].map((opt, i) => (
              <button key={i} style={{ padding: "20px 36px", background: i === 0 ? G.accent : "rgba(255,255,255,0.06)", color: "#fff", border: i === 0 ? "none" : "1px solid rgba(255,255,255,0.12)", borderRadius: 16, cursor: "pointer", fontFamily: font, textAlign: "center", transition: "all 0.3s", minWidth: 140, boxShadow: i === 0 ? `0 8px 28px ${G.accent}40` : "none" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}><div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 0.5 }}>{opt}</div><div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>Dar ahora</div></button>
            ))}
          </div>
          <p style={{ marginTop: 32, fontSize: 13, opacity: 0.4 }}>Transferencia · Yape · Plin · Tarjeta de crédito</p>
        </div>
      </section>
      {/* ═══ CONTACT ═══ */}
      <section id="contacto" className="landing-section" style={{ padding: "100px 32px", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}><STag>Contáctanos</STag><h2 style={{ margin: "0 0 14px", fontSize: "clamp(32px, 3.5vw, 48px)", fontWeight: 800, color: G.dark, letterSpacing: -1.5, fontFamily: fontTitle }}>¿Tienes preguntas?</h2><p style={{ margin: 0, fontSize: 17, color: G.gray }}>Nos encantaría saber de ti</p></div>
          <div className="contacto-grid" style={{ background: G.grayLight, borderRadius: 24, padding: "48px 44px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <Input label="Nombre" placeholder="Tu nombre" />
            <Input label="Email" placeholder="tu@email.com" type="email" icon={Mail} />
            <Input label="Teléfono" placeholder="+51 999 123 456" icon={Phone} />
            <Select label="Asunto" options={["Quiero visitar la iglesia","Información de células","Necesito oración","Quiero servir","Otro"]} />
            <div style={{ gridColumn: "1/-1" }}><TextArea label="Mensaje" placeholder="Cuéntanos cómo podemos ayudarte..." rows={4} /></div>
            <div style={{ gridColumn: "1/-1", display: "flex", justifyContent: "center", marginTop: 8 }}>
              <button style={{ padding: "16px 48px", fontSize: 15, fontWeight: 800, background: `linear-gradient(135deg, ${G.primary}, ${G.primaryLight})`, color: "#fff", border: "none", borderRadius: 14, cursor: "pointer", fontFamily: font, display: "inline-flex", alignItems: "center", gap: 10, transition: "all 0.2s", boxShadow: `0 6px 24px ${G.primary}20` }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}><Send size={17} /> Enviar Mensaje</button>
            </div>
          </div>
        </div>
      </section>
      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: G.dark, color: "#fff", padding: "72px 32px 36px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 1fr", gap: 48, marginBottom: 52 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${G.accent}, ${G.accentLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20, fontFamily: fontTitle }}>L</div>
                <div><span style={{ fontSize: 18, fontWeight: 800, fontFamily: fontTitle }}>LADP</span><div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2 }}>Las Asambleas de Dios del Perú - ICV</div></div>
              </div>
              <p style={{ margin: "0 0 24px", fontSize: 14, color: "#64748b", lineHeight: 1.7, maxWidth: 300 }}>Más de 106 años proclamando el evangelio de Jesucristo en el Perú y el mundo.</p>
              <div style={{ display: "flex", gap: 10 }}>
                {[[Facebook, CHURCH_DEFAULT.facebook], [Youtube, CHURCH_DEFAULT.youtube], [Instagram, CHURCH_DEFAULT.instagram]].map(([Icon, url], i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", transition: "all 0.2s", textDecoration: "none" }} onMouseEnter={e => { e.currentTarget.style.background = G.accent; e.currentTarget.style.color = "#fff"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#64748b"; }}><Icon size={18} /></a>
                ))}
              </div>
            </div>
            {[{ title: "Iglesia", links: ["Nosotros","Creencias","Liderazgo","Contacto"] },{ title: "Conecta", links: ["Visítanos","Grupos de Vida","Servir","Bautismo"] },{ title: "Recursos", links: ["Sermones","Blog","Devocionales","Tienda"] }].map((col, i) => (
              <div key={i}><h4 style={{ margin: "0 0 18px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: G.accent }}>{col.title}</h4>
                {col.links.map((link, j) => (<div key={j} style={{ marginBottom: 12 }}><a href={footerLinks[link] === "/tienda" ? "/tienda" : `/${footerLinks[link] || ""}`} onClick={e => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); irA(footerLinks[link] || "#visitanos"); }} style={{ fontSize: 14, color: "#64748b", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#64748b"}>{link}</a></div>))}
              </div>
            ))}
          </div>
          <div className="footer-bottom" style={{ paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, color: "#475569", flexWrap: "wrap", gap: 12 }}>
            <span>© {new Date().getFullYear()} Las Asambleas de Dios del Perú</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>Hecho con <Heart size={12} color={G.accent} fill={G.accent} /> en Lima, Perú</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ─── LOGIN ──────────────────────────────────────────────────────────
const Login = ({ onSuccess, onBack, onRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Completa todos los campos"); return; }
    setLoading(true);
    try {
      const result = await signIn(email, password);
      if (!result) { setError("Correo o contraseña incorrectos"); return; }
      let profile = null;
      try { profile = await getUserProfile(); } catch (e) { console.error("Perfil:", e); }
      onSuccess(profile);
    } catch (e) {
      console.error("Login:", e);
      setError("No se pudo iniciar sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signInWithGoogle();
    // El redireccionamiento OAuth es manejado por onAuthStateChange en App
    setGoogleLoading(false);
  };

  return (
    <div className="login-split" style={{ minHeight: "100vh", display: "flex", fontFamily: font }}>
      <GlobalStyles />
      <div className="login-left" style={{ flex: "0 0 44%", background: `linear-gradient(150deg, ${G.primaryDark}, ${G.primary} 60%, ${G.primaryLight})`, display: "flex", alignItems: "center", justifyContent: "center", padding: 48, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div style={{ position: "relative", color: "#fff", textAlign: "center", maxWidth: 360 }} className="fadeup">
          <div style={{ width: 72, height: 72, borderRadius: 18, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontFamily: fontTitle, fontWeight: 900, fontSize: 40 }}>L</div>
          <h1 style={{ margin: "0 0 14px", fontSize: 28, fontWeight: 700, fontFamily: fontTitle }}>Las Asambleas de Dios del Perú - ICV</h1>
          <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7 }}>Plataforma de administración integral para la iglesia local</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 36 }}>
            {["Gestión de miembros", "Control financiero", "Células y ministerios", "Reportes y métricas"].map((f, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px", fontSize: 12.5, fontWeight: 600, textAlign: "left", display: "flex", alignItems: "center", gap: 7 }}>
                <Check size={14} /> {f}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="login-right" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40, background: G.bg }}>
        <div style={{ width: "100%", maxWidth: 380 }} className="fadeup">
          <button onClick={onBack} style={{ background: "none", border: "none", color: G.gray, fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 36, display: "flex", alignItems: "center", gap: 6, fontFamily: font }}>
            <ChevronLeft size={16} /> Volver al inicio
          </button>
          <div style={{ background: "#fff", padding: 36, borderRadius: 18, border: `1px solid ${G.grayMid}40`, boxShadow: `0 8px 32px ${G.primary}08` }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>Bienvenido</h2>
            <p style={{ margin: "0 0 28px", color: G.gray, fontSize: 13.5 }}>Accede a la plataforma administrativa</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Input label="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" type="email" icon={Mail} required />
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 12.5, color: G.dark, fontWeight: 600, fontFamily: font }}>Contraseña <span style={{ color: G.danger }}>*</span></label>
                <div style={{ position: "relative" }}>
                  <Lock size={14} color={G.gray} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ width: "100%", padding: "10px 40px 10px 36px", borderRadius: 10, border: `1.5px solid ${G.grayMid}`, fontSize: 13.5, outline: "none", fontFamily: font, boxSizing: "border-box" }} />
                  <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                    {showPass ? <EyeOff size={16} color={G.gray} /> : <Eye size={16} color={G.gray} />}
                  </button>
                </div>
              </div>
              {error && <div style={{ background: G.dangerLight, border: `1px solid ${G.danger}20`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: G.danger, fontWeight: 500 }}>{error}</div>}
              <Button variant="primary" size="lg" onClick={handleLogin} disabled={loading || googleLoading} fullWidth>
                {loading ? "Iniciando sesión…" : "Iniciar Sesión"}
              </Button>
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
                <div style={{ flex: 1, height: 1, background: G.grayMid + "60" }} />
                <span style={{ fontSize: 12, color: G.gray, fontWeight: 500 }}>o continúa con</span>
                <div style={{ flex: 1, height: 1, background: G.grayMid + "60" }} />
              </div>
              <button onClick={handleGoogle} disabled={loading || googleLoading} style={{ width: "100%", padding: "11px 16px", borderRadius: 10, border: `1.5px solid ${G.grayMid}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 13.5, fontWeight: 600, color: G.dark, fontFamily: font, transition: "border-color 0.2s" }}>
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-7.9 19.6-20 0-1.3-.1-2.7-.4-4z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.2L6 33.7C9.3 39.5 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.3 4-4.3 5.2l6.2 5.2C40.8 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z" /></svg>
                {googleLoading ? "Redirigiendo…" : "Continuar con Google"}
              </button>
            </div>
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <span style={{ fontSize: 13, color: G.gray }}>¿No tienes cuenta? </span>
              <button onClick={onRegister} style={{ background: "none", border: "none", color: G.primary, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Crear cuenta</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ─── DASHBOARD VIEWS ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

// ─── VISTA PRINCIPAL DASHBOARD ──────────────────────────────────────
const DashboardView = ({ data }) => {
  const { miembros, donaciones, proyectos, eventos, asistencia, gastos } = data;
  const totalIngresos = donaciones.filter(d => d.estado === "completado").reduce((a, d) => a + d.monto, 0);
  const totalGastos = gastos.filter(g => g.estado === "pagado").reduce((a, g) => a + g.monto, 0);
  const balance = totalIngresos - totalGastos;
  const activos = miembros.filter(m => m.estado === "activo").length;
  const promAsist = asistencia.length > 0 ? Math.round(asistencia.reduce((a, d) => a + d.total, 0) / asistencia.length) : 0;

  const donByMonth = {};
  donaciones.filter(d => d.estado === "completado").forEach(d => {
    const m = new Date(d.fecha + "T12:00").getMonth();
    donByMonth[m] = (donByMonth[m] || 0) + d.monto;
  });
  const chartData = [10, 11, 0, 1, 2].map(m => ({ label: monthName(m), value: donByMonth[m] || 0 }));

  return (
    <div className="fadein">
      <PageHeader title="Dashboard" subtitle={`Resumen general — ${CHURCH_DEFAULT.nombre}`} />
      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 16 }}>
        <StatCard label="Miembros Activos" value={activos} icon={Users} color={G.primary} trend={`+${miembros.filter(m => m.desde >= "2025-01").length}`} />
        <StatCard label="Ingresos (S/.)" value={`${(totalIngresos / 1000).toFixed(1)}K`} icon={TrendingUp} color={G.success} trend="+8%" />
        <StatCard label="Balance (S/.)" value={fmtMoney(balance)} icon={DollarSign} color={balance >= 0 ? G.success : G.danger} />
        <StatCard label="Asistencia Promedio" value={promAsist} icon={Activity} color={G.purple} trend="+5%" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20, marginBottom: 20 }}>
        <Card hover={false}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14.5, fontWeight: 700, color: G.dark }}>Ingresos Mensuales</h3>
          <MiniBarChart data={chartData} />
        </Card>
        <Card hover={false}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14.5, fontWeight: 700, color: G.dark }}>Actividad Reciente</h3>
          {[
            { icon: Heart, text: `Donación de ${fmtMoney(donaciones[0]?.monto || 0)}`, time: fmtDateShort(donaciones[0]?.fecha), color: G.success },
            { icon: UserCheck, text: `${miembros.filter(m => m.desde >= "2025-01").length} nuevos miembros este año`, time: "2025", color: G.primary },
            { icon: Target, text: `${proyectos.filter(p => p.estado === "activo").length} proyectos activos`, time: "En curso", color: G.warning },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? `1px solid ${G.grayMid}20` : "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: item.color + "14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <item.icon size={16} color={item.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: G.dark }}>{item.text}</div>
                <div style={{ fontSize: 11, color: G.gray, marginTop: 1 }}>{item.time}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
        <Card hover={false}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14.5, fontWeight: 700, color: G.dark }}>Próximos Eventos</h3>
          {eventos.filter(e => e.fecha >= today()).slice(0, 3).map(e => (
            <div key={e.id} style={{ padding: "14px 16px", background: G.grayLight, borderRadius: 10, borderLeft: `3px solid ${G.primary}`, marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: G.primary, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>{fmtDateShort(e.fecha)} · {e.hora}</div>
              <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: G.dark }}>{e.nombre}</h4>
              <p style={{ margin: 0, fontSize: 12.5, color: G.gray }}><MapPin size={11} style={{ display: "inline", marginRight: 4 }} />{e.lugar}</p>
            </div>
          ))}
          {eventos.filter(e => e.fecha >= today()).length === 0 && <p style={{ fontSize: 13, color: G.gray }}>No hay eventos próximos</p>}
        </Card>
        <Card hover={false}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14.5, fontWeight: 700, color: G.dark }}>Proyectos Activos</h3>
          {proyectos.filter(p => p.estado === "activo").slice(0, 3).map(p => (
            <div key={p.id} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: G.dark }}>{p.nombre}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: G.primary }}>{p.avance}%</span>
              </div>
              <div style={{ height: 6, background: G.grayMid + "40", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${p.avance}%`, background: `linear-gradient(90deg, ${G.primary}, ${G.primaryLight})`, borderRadius: 3, transition: "width 0.8s ease" }} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// ─── MIEMBROS ───────────────────────────────────────────────────────
const MiembrosView = ({ data, setData, toast }) => {
  const [buscar, setBuscar] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroGrupo, setFiltroGrupo] = useState("todos");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [eliminar, setEliminar] = useState(null);

  const grupos = ["todos", ...new Set(data.miembros.map(m => m.grupo))];
  const filtrados = data.miembros.filter(m => {
    const q = buscar.toLowerCase();
    const mb = m.nombre.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.rol.toLowerCase().includes(q);
    const me = filtroEstado === "todos" || m.estado === filtroEstado;
    const mg = filtroGrupo === "todos" || m.grupo === filtroGrupo;
    return mb && me && mg;
  });

  const blank = { nombre: "", rol: "Miembro", email: "", telefono: "", estado: "activo", desde: today(), direccion: "", grupo: "Adultos", celula: "", notas: "", bautizado: false, foto: "" };

  const openNew = () => { setEditando({ ...blank, id: uid(), foto: "NN" }); setModal(true); };
  const openEdit = (m) => { setEditando({ ...m }); setModal(true); };

  const guardar = async () => {
    if (!editando.nombre) return;
    const item = { ...editando, foto: editando.nombre.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() };
    const exists = data.miembros.find(m => m.id === item.id);
    const saved = await upsertRecord("miembros", item, !exists) || item;
    if (exists) setData({ ...data, miembros: data.miembros.map(m => m.id === item.id ? saved : m) });
    else setData({ ...data, miembros: [saved, ...data.miembros] });
    toast(exists ? "Miembro actualizado correctamente" : "Nuevo miembro registrado");
    setModal(false); setEditando(null);
  };

  const confirmarEliminar = async () => {
    await removeRecord("miembros", eliminar.id);
    setData({ ...data, miembros: data.miembros.filter(m => m.id !== eliminar.id) });
    toast("Miembro eliminado");
    setEliminar(null);
  };

  return (
    <div className="fadein">
      <PageHeader title="Miembros" subtitle={`${data.miembros.length} registrados · ${data.miembros.filter(m => m.estado === "activo").length} activos`} actions={<><Button variant="outline" size="md" icon={Download}>Exportar</Button><Button variant="primary" size="md" icon={Plus} onClick={openNew}>Nuevo Miembro</Button></>} />

      <Card hover={false} style={{ marginBottom: 20, padding: "14px 20px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}><Input placeholder="Buscar por nombre, email o rol..." value={buscar} onChange={e => setBuscar(e.target.value)} icon={Search} /></div>
          <Select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} options={[{ value: "todos", label: "Todos los estados" }, { value: "activo", label: "Activo" }, { value: "inactivo", label: "Inactivo" }]} />
          <Select value={filtroGrupo} onChange={e => setFiltroGrupo(e.target.value)} options={grupos.map(g => ({ value: g, label: g === "todos" ? "Todos los grupos" : g }))} />
        </div>
      </Card>

      <Card hover={false}>
        {filtrados.length === 0 ? <EmptyState icon={Users} message="No se encontraron miembros con ese criterio" /> : filtrados.map((m, i) => (
          <div key={m.id} className="list-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderBottom: i < filtrados.length - 1 ? `1px solid ${G.grayMid}20` : "none" }}>
            <Avatar initials={m.foto} size={42} color={m.estado === "activo" ? G.primary : G.gray} />
            <div className="list-main" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: G.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.nombre}</div>
              <div style={{ fontSize: 12.5, color: G.gray, marginTop: 1 }}>{m.rol} · {m.email}</div>
            </div>
            <Badge variant={m.bautizado ? "success" : "warning"}>{m.bautizado ? "Bautizado" : "No bautizado"}</Badge>
            <Badge variant={m.estado === "activo" ? "success" : "default"}>{m.estado}</Badge>
            <div style={{ fontSize: 12, color: G.gray, minWidth: 80 }}>Desde {new Date(m.desde + "T12:00").getFullYear()}</div>
            <button onClick={() => openEdit(m)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6 }}><Edit size={16} color={G.gray} /></button>
            <button onClick={() => setEliminar(m)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6 }}><Trash2 size={16} color={G.danger} /></button>
          </div>
        ))}
      </Card>

      {modal && editando && (
        <Modal title={data.miembros.find(m => m.id === editando.id) ? "Editar Miembro" : "Nuevo Miembro"} onClose={() => setModal(false)} width={600}>
          <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}><Input label="Nombre completo" value={editando.nombre} onChange={e => setEditando({ ...editando, nombre: e.target.value })} placeholder="Juan Pérez" required /></div>
            <Input label="Email" value={editando.email} onChange={e => setEditando({ ...editando, email: e.target.value })} placeholder="juan@email.com" type="email" icon={Mail} />
            <Input label="Teléfono" value={editando.telefono} onChange={e => setEditando({ ...editando, telefono: e.target.value })} placeholder="+51 999 123 456" icon={Phone} />
            <Select label="Rol" value={editando.rol} onChange={e => setEditando({ ...editando, rol: e.target.value })} options={["Miembro", "Miembro Nuevo", "Diácono", "Líder de Célula", "Líder de Alabanza", "Maestra Esc. Dominical", "Ujier", "Tesorera", "Pastor"]} required />
            <Select label="Estado" value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} options={["activo", "inactivo"]} />
            <Select label="Grupo" value={editando.grupo} onChange={e => setEditando({ ...editando, grupo: e.target.value })} options={["Adultos", "Jóvenes", "Mujeres", "Hombres", "Niños", "Adolescentes"]} />
            <Input label="Célula" value={editando.celula} onChange={e => setEditando({ ...editando, celula: e.target.value })} placeholder="Nombre de la célula" />
            <Input label="Fecha de ingreso" value={editando.desde} onChange={e => setEditando({ ...editando, desde: e.target.value })} type="date" />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={editando.bautizado} onChange={e => setEditando({ ...editando, bautizado: e.target.checked })} id="baut" />
              <label htmlFor="baut" style={{ fontSize: 13, fontWeight: 600, color: G.dark }}>Bautizado en agua</label>
            </div>
            <div style={{ gridColumn: "1/-1" }}><Input label="Dirección" value={editando.direccion} onChange={e => setEditando({ ...editando, direccion: e.target.value })} placeholder="Dirección completa" icon={MapPin} /></div>
            <div style={{ gridColumn: "1/-1" }}><TextArea label="Notas" value={editando.notas} onChange={e => setEditando({ ...editando, notas: e.target.value })} placeholder="Observaciones adicionales..." /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Button variant="outline" size="md" onClick={() => setModal(false)} fullWidth>Cancelar</Button>
            <Button variant="primary" size="md" onClick={guardar} fullWidth icon={Save}>Guardar</Button>
          </div>
        </Modal>
      )}
      {eliminar && <ConfirmDialog message={`¿Eliminar a ${eliminar.nombre}? Esta acción no se puede deshacer.`} onConfirm={confirmarEliminar} onCancel={() => setEliminar(null)} />}
    </div>
  );
};

// ─── FINANZAS (Donaciones + Gastos) ─────────────────────────────────
const FinanzasView = ({ data, setData, toast }) => {
  const [tab, setTab] = useState("ingresos");
  const [modal, setModal] = useState(null);
  const [editando, setEditando] = useState(null);
  const [eliminar, setEliminar] = useState(null);

  const totalIngresos = data.donaciones.filter(d => d.estado === "completado").reduce((a, d) => a + d.monto, 0);
  const totalGastos = data.gastos.filter(g => g.estado === "pagado").reduce((a, g) => a + g.monto, 0);
  const balance = totalIngresos - totalGastos;

  const blankDon = { miembro: "", monto: 0, tipo: "Ofrenda", metodo: "Efectivo", fecha: today(), estado: "completado", recibo: "", notas: "" };
  const blankGasto = { concepto: "", monto: 0, categoria: "Operativo", fecha: today(), responsable: "", estado: "pagado" };

  const guardarDon = async () => {
    if (!editando.miembro || !editando.monto) return;
    const exists = data.donaciones.find(d => d.id === editando.id);
    const saved = await upsertRecord("donaciones", editando, !exists) || editando;
    if (exists) setData({ ...data, donaciones: data.donaciones.map(d => d.id === editando.id ? saved : d) });
    else setData({ ...data, donaciones: [saved, ...data.donaciones] });
    toast(exists ? "Donación actualizada" : "Donación registrada");
    setModal(null); setEditando(null);
  };

  const guardarGasto = async () => {
    if (!editando.concepto || !editando.monto) return;
    const exists = data.gastos.find(g => g.id === editando.id);
    const saved = await upsertRecord("gastos", editando, !exists) || editando;
    if (exists) setData({ ...data, gastos: data.gastos.map(g => g.id === editando.id ? saved : g) });
    else setData({ ...data, gastos: [saved, ...data.gastos] });
    toast(exists ? "Gasto actualizado" : "Gasto registrado");
    setModal(null); setEditando(null);
  };

  const eliminarItem = async () => {
    const key = eliminar.type === "donacion" ? "donaciones" : "gastos";
    await removeRecord(key, eliminar.id);
    if (eliminar.type === "donacion") {
      setData({ ...data, donaciones: data.donaciones.filter(d => d.id !== eliminar.id) });
    } else {
      setData({ ...data, gastos: data.gastos.filter(g => g.id !== eliminar.id) });
    }
    toast("Registro eliminado");
    setEliminar(null);
  };

  return (
    <div className="fadein">
      <PageHeader title="Finanzas" subtitle="Control de ingresos, egresos y balance general" actions={
        <>{tab === "ingresos" ? <Button variant="primary" size="md" icon={Plus} onClick={() => { setEditando({ ...blankDon, id: uid() }); setModal("donacion"); }}>Nueva Donación</Button> : <Button variant="primary" size="md" icon={Plus} onClick={() => { setEditando({ ...blankGasto, id: uid() }); setModal("gasto"); }}>Nuevo Gasto</Button>}</>
      } />

      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 16 }}>
        <StatCard label="Total Ingresos" value={fmtMoney(totalIngresos)} icon={TrendingUp} color={G.success} />
        <StatCard label="Total Egresos" value={fmtMoney(totalGastos)} icon={CreditCard} color={G.danger} />
        <StatCard label="Balance" value={fmtMoney(balance)} icon={DollarSign} color={balance >= 0 ? G.success : G.danger} />
        <StatCard label="Pendientes" value={data.donaciones.filter(d => d.estado === "pendiente").length + data.gastos.filter(g => g.estado === "pendiente").length} icon={Clock} color={G.warning} />
      </div>

      <TabBar tabs={[{ id: "ingresos", label: "Ingresos / Donaciones", icon: TrendingUp }, { id: "egresos", label: "Egresos / Gastos", icon: CreditCard }]} active={tab} onChange={setTab} />

      {tab === "ingresos" && (
        <Card hover={false}>
          {data.donaciones.length === 0 ? <EmptyState icon={DollarSign} message="No hay donaciones registradas" action="Registrar primera donación" onAction={() => { setEditando({ ...blankDon, id: uid() }); setModal("donacion"); }} /> :
          data.donaciones.map((d, i) => (
            <div key={d.id} className="list-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderBottom: i < data.donaciones.length - 1 ? `1px solid ${G.grayMid}20` : "none" }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: G.success + "14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <DollarSign size={20} color={G.success} />
              </div>
              <div className="list-main" style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: G.dark }}>{d.miembro}</div>
                <div style={{ fontSize: 12.5, color: G.gray }}>{d.tipo} · {d.metodo}{d.recibo ? ` · ${d.recibo}` : ""}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: G.primary, fontFamily: fontTitle, minWidth: 90, textAlign: "right" }}>{fmtMoney(d.monto)}</div>
              <Badge variant={d.estado === "completado" ? "success" : "warning"}>{d.estado}</Badge>
              <div style={{ fontSize: 12, color: G.gray, minWidth: 75 }}>{fmtDateShort(d.fecha)}</div>
              <button onClick={() => { setEditando({ ...d }); setModal("donacion"); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}><Edit size={15} color={G.gray} /></button>
              <button onClick={() => setEliminar({ ...d, type: "donacion" })} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}><Trash2 size={15} color={G.danger} /></button>
            </div>
          ))}
        </Card>
      )}

      {tab === "egresos" && (
        <Card hover={false}>
          {data.gastos.length === 0 ? <EmptyState icon={CreditCard} message="No hay gastos registrados" action="Registrar primer gasto" onAction={() => { setEditando({ ...blankGasto, id: uid() }); setModal("gasto"); }} /> :
          data.gastos.map((g, i) => (
            <div key={g.id} className="list-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderBottom: i < data.gastos.length - 1 ? `1px solid ${G.grayMid}20` : "none" }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: G.danger + "14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CreditCard size={20} color={G.danger} />
              </div>
              <div className="list-main" style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: G.dark }}>{g.concepto}</div>
                <div style={{ fontSize: 12.5, color: G.gray }}>{g.categoria} · {g.responsable}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: G.danger, fontFamily: fontTitle, minWidth: 90, textAlign: "right" }}>-{fmtMoney(g.monto)}</div>
              <Badge variant={g.estado === "pagado" ? "success" : "warning"}>{g.estado}</Badge>
              <div style={{ fontSize: 12, color: G.gray, minWidth: 75 }}>{fmtDateShort(g.fecha)}</div>
              <button onClick={() => { setEditando({ ...g }); setModal("gasto"); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}><Edit size={15} color={G.gray} /></button>
              <button onClick={() => setEliminar({ ...g, type: "gasto" })} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}><Trash2 size={15} color={G.danger} /></button>
            </div>
          ))}
        </Card>
      )}

      {modal === "donacion" && editando && (
        <Modal title={data.donaciones.find(d => d.id === editando.id) ? "Editar Donación" : "Nueva Donación"} onClose={() => { setModal(null); setEditando(null); }}>
          <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}><Input label="Nombre del donante" value={editando.miembro} onChange={e => setEditando({ ...editando, miembro: e.target.value })} placeholder="Nombre completo o Anónimo" required /></div>
            <Input label="Monto (S/.)" value={editando.monto} onChange={e => setEditando({ ...editando, monto: Number(e.target.value) })} type="number" required />
            <Select label="Tipo" value={editando.tipo} onChange={e => setEditando({ ...editando, tipo: e.target.value })} options={["Diezmo", "Ofrenda", "Ofrenda Misionera", "Donación Especial", "Primicias", "Ofrenda de Amor"]} required />
            <Select label="Método de pago" value={editando.metodo} onChange={e => setEditando({ ...editando, metodo: e.target.value })} options={["Efectivo", "Transferencia", "Yape", "Plin", "Tarjeta"]} />
            <Input label="Fecha" value={editando.fecha} onChange={e => setEditando({ ...editando, fecha: e.target.value })} type="date" />
            <Select label="Estado" value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} options={["completado", "pendiente"]} />
            <Input label="N° Recibo" value={editando.recibo} onChange={e => setEditando({ ...editando, recibo: e.target.value })} placeholder="REC-001" />
            <div style={{ gridColumn: "1/-1" }}><TextArea label="Notas" value={editando.notas} onChange={e => setEditando({ ...editando, notas: e.target.value })} placeholder="Observaciones..." /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Button variant="outline" size="md" onClick={() => { setModal(null); setEditando(null); }} fullWidth>Cancelar</Button>
            <Button variant="primary" size="md" onClick={guardarDon} fullWidth icon={Save}>Guardar</Button>
          </div>
        </Modal>
      )}

      {modal === "gasto" && editando && (
        <Modal title={data.gastos.find(g => g.id === editando.id) ? "Editar Gasto" : "Nuevo Gasto"} onClose={() => { setModal(null); setEditando(null); }}>
          <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}><Input label="Concepto" value={editando.concepto} onChange={e => setEditando({ ...editando, concepto: e.target.value })} placeholder="Descripción del gasto" required /></div>
            <Input label="Monto (S/.)" value={editando.monto} onChange={e => setEditando({ ...editando, monto: Number(e.target.value) })} type="number" required />
            <Select label="Categoría" value={editando.categoria} onChange={e => setEditando({ ...editando, categoria: e.target.value })} options={["Operativo", "Mantenimiento", "Educación", "Misiones", "Equipamiento", "Salarios", "Eventos", "Otros"]} />
            <Input label="Responsable" value={editando.responsable} onChange={e => setEditando({ ...editando, responsable: e.target.value })} placeholder="Nombre" />
            <Input label="Fecha" value={editando.fecha} onChange={e => setEditando({ ...editando, fecha: e.target.value })} type="date" />
            <Select label="Estado" value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} options={["pagado", "pendiente"]} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Button variant="outline" size="md" onClick={() => { setModal(null); setEditando(null); }} fullWidth>Cancelar</Button>
            <Button variant="primary" size="md" onClick={guardarGasto} fullWidth icon={Save}>Guardar</Button>
          </div>
        </Modal>
      )}

      {eliminar && <ConfirmDialog message="¿Eliminar este registro financiero?" onConfirm={eliminarItem} onCancel={() => setEliminar(null)} />}
    </div>
  );
};

// ─── PROYECTOS ──────────────────────────────────────────────────────
const ProyectosView = ({ data, setData, toast }) => {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const blank = { nombre: "", presupuesto: 0, gastado: 0, avance: 0, estado: "en inicio", responsable: "", inicio: today(), fin: "", descripcion: "", prioridad: "media" };

  const guardar = async () => {
    if (!editando.nombre) return;
    const exists = data.proyectos.find(p => p.id === editando.id);
    const saved = await upsertRecord("proyectos", editando, !exists) || editando;
    if (exists) setData({ ...data, proyectos: data.proyectos.map(p => p.id === editando.id ? saved : p) });
    else setData({ ...data, proyectos: [saved, ...data.proyectos] });
    toast(exists ? "Proyecto actualizado" : "Proyecto creado");
    setModal(false); setEditando(null);
  };

  return (
    <div className="fadein">
      <PageHeader title="Proyectos" subtitle="Seguimiento de proyectos e iniciativas" actions={<Button variant="primary" size="md" icon={Plus} onClick={() => { setEditando({ ...blank, id: uid() }); setModal(true); }}>Nuevo Proyecto</Button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {data.proyectos.map(p => (
          <Card key={p.id} hover>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <Badge variant={p.estado === "completado" ? "success" : p.estado === "activo" ? "primary" : "warning"}>{p.estado}</Badge>
              <Badge variant={p.prioridad === "alta" ? "danger" : p.prioridad === "media" ? "warning" : "default"}>Prioridad: {p.prioridad}</Badge>
            </div>
            <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: G.dark, fontFamily: fontTitle }}>{p.nombre}</h3>
            <p style={{ margin: "0 0 4px", fontSize: 12.5, color: G.gray }}>{p.responsable}</p>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: G.gray }}>{p.descripcion?.slice(0, 80)}{p.descripcion?.length > 80 ? "..." : ""}</p>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: G.gray }}>Progreso</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: G.primary }}>{p.avance}%</span>
              </div>
              <div style={{ height: 6, background: G.grayMid + "40", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${p.avance}%`, background: p.avance === 100 ? `linear-gradient(90deg, ${G.success}, #34d399)` : `linear-gradient(90deg, ${G.primary}, ${G.primaryLight})`, borderRadius: 3, transition: "width 0.8s" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: G.gray, marginBottom: 14 }}>
              <span>Presupuesto: {fmtMoney(p.presupuesto)}</span>
              <span>Gastado: {fmtMoney(p.gastado)}</span>
            </div>
            <Button variant="outline" size="sm" icon={Edit} onClick={() => { setEditando({ ...p }); setModal(true); }} fullWidth>Editar</Button>
          </Card>
        ))}
      </div>
      {modal && editando && (
        <Modal title={data.proyectos.find(p => p.id === editando.id) ? "Editar Proyecto" : "Nuevo Proyecto"} onClose={() => { setModal(false); setEditando(null); }} width={600}>
          <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}><Input label="Nombre" value={editando.nombre} onChange={e => setEditando({ ...editando, nombre: e.target.value })} required /></div>
            <div style={{ gridColumn: "1/-1" }}><TextArea label="Descripción" value={editando.descripcion} onChange={e => setEditando({ ...editando, descripcion: e.target.value })} /></div>
            <Input label="Presupuesto (S/.)" value={editando.presupuesto} onChange={e => setEditando({ ...editando, presupuesto: Number(e.target.value) })} type="number" />
            <Input label="Gastado (S/.)" value={editando.gastado} onChange={e => setEditando({ ...editando, gastado: Number(e.target.value) })} type="number" />
            <Input label="Avance (%)" value={editando.avance} onChange={e => setEditando({ ...editando, avance: Math.min(100, Math.max(0, Number(e.target.value))) })} type="number" />
            <Select label="Estado" value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} options={["en inicio", "activo", "completado", "pausado"]} />
            <Input label="Responsable" value={editando.responsable} onChange={e => setEditando({ ...editando, responsable: e.target.value })} />
            <Select label="Prioridad" value={editando.prioridad} onChange={e => setEditando({ ...editando, prioridad: e.target.value })} options={["alta", "media", "baja"]} />
            <Input label="Fecha inicio" value={editando.inicio} onChange={e => setEditando({ ...editando, inicio: e.target.value })} type="date" />
            <Input label="Fecha fin" value={editando.fin} onChange={e => setEditando({ ...editando, fin: e.target.value })} type="date" />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Button variant="outline" size="md" onClick={() => { setModal(false); setEditando(null); }} fullWidth>Cancelar</Button>
            <Button variant="primary" size="md" onClick={guardar} fullWidth icon={Save}>Guardar</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── EVENTOS ────────────────────────────────────────────────────────
const EventosView = ({ data, setData, toast, readOnly = false }) => {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const blank = { nombre: "", fecha: today(), hora: "19:00", lugar: "", capacidad: 100, inscritos: 0, tipo: "Conferencia", descripcion: "", estado: "planificado" };

  const guardar = async () => {
    if (!editando.nombre) return;
    const exists = data.eventos.find(e => e.id === editando.id);
    const saved = await upsertRecord("eventos", editando, !exists) || editando;
    if (exists) setData({ ...data, eventos: data.eventos.map(e => e.id === editando.id ? saved : e) });
    else setData({ ...data, eventos: [saved, ...data.eventos] });
    toast(exists ? "Evento actualizado" : "Evento creado");
    setModal(false); setEditando(null);
  };

  const eliminar = async (id) => {
    await removeRecord("eventos", id);
    setData({ ...data, eventos: data.eventos.filter(e => e.id !== id) });
    toast("Evento eliminado");
  };

  return (
    <div className="fadein">
      <PageHeader title="Eventos" subtitle="Calendario de actividades y celebraciones" actions={!readOnly && <Button variant="primary" size="md" icon={Plus} onClick={() => { setEditando({ ...blank, id: uid() }); setModal(true); }}>Nuevo Evento</Button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {data.eventos.sort((a, b) => a.fecha.localeCompare(b.fecha)).map(e => (
          <Card key={e.id} hover>
            <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: `linear-gradient(135deg, ${G.primary}, ${G.primaryLight})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1, fontFamily: fontTitle }}>{new Date(e.fecha + "T12:00").getDate()}</div>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, opacity: 0.9 }}>{monthName(new Date(e.fecha + "T12:00").getMonth())}</div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 15.5, fontWeight: 700, color: G.dark, fontFamily: fontTitle }}>{e.nombre}</h3>
                <div style={{ fontSize: 12.5, color: G.gray, display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}><Clock size={12} /> {e.hora}</div>
                <div style={{ fontSize: 12.5, color: G.gray, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {e.lugar}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <Badge variant="default">{e.tipo}</Badge>
              <Badge variant={e.estado === "confirmado" ? "success" : e.estado === "planificado" ? "warning" : "danger"}>{e.estado}</Badge>
            </div>
            {e.capacidad > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: G.gray }}>Inscritos</span>
                  <span style={{ fontWeight: 700, color: G.primary }}>{e.inscritos}/{e.capacidad}</span>
                </div>
                <div style={{ height: 5, background: G.grayMid + "40", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (e.inscritos / e.capacidad) * 100)}%`, background: `linear-gradient(90deg, ${G.primary}, ${G.primaryLight})`, borderRadius: 3 }} />
                </div>
              </div>
            )}
            {!readOnly && (
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="outline" size="sm" icon={Edit} onClick={() => { setEditando({ ...e }); setModal(true); }} fullWidth>Editar</Button>
                <Button variant="ghost" size="sm" icon={Trash2} onClick={() => eliminar(e.id)} style={{ color: G.danger }}>Eliminar</Button>
              </div>
            )}
          </Card>
        ))}
      </div>
      {!readOnly && modal && editando && (
        <Modal title={data.eventos.find(e => e.id === editando.id) ? "Editar Evento" : "Nuevo Evento"} onClose={() => { setModal(false); setEditando(null); }} width={600}>
          <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}><Input label="Nombre" value={editando.nombre} onChange={e => setEditando({ ...editando, nombre: e.target.value })} required /></div>
            <Input label="Fecha" value={editando.fecha} onChange={e => setEditando({ ...editando, fecha: e.target.value })} type="date" />
            <Input label="Hora" value={editando.hora} onChange={e => setEditando({ ...editando, hora: e.target.value })} type="time" />
            <div style={{ gridColumn: "1/-1" }}><Input label="Lugar" value={editando.lugar} onChange={e => setEditando({ ...editando, lugar: e.target.value })} icon={MapPin} /></div>
            <Input label="Capacidad" value={editando.capacidad} onChange={e => setEditando({ ...editando, capacidad: Number(e.target.value) })} type="number" />
            <Input label="Inscritos" value={editando.inscritos} onChange={e => setEditando({ ...editando, inscritos: Number(e.target.value) })} type="number" />
            <Select label="Tipo" value={editando.tipo} onChange={e => setEditando({ ...editando, tipo: e.target.value })} options={["Conferencia", "Retiro", "Celebración", "Oración", "Educación", "Evangelismo", "Social", "Otro"]} />
            <Select label="Estado" value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} options={["planificado", "confirmado", "cancelado"]} />
            <div style={{ gridColumn: "1/-1" }}><TextArea label="Descripción" value={editando.descripcion} onChange={e => setEditando({ ...editando, descripcion: e.target.value })} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Button variant="outline" size="md" onClick={() => { setModal(false); setEditando(null); }} fullWidth>Cancelar</Button>
            <Button variant="primary" size="md" onClick={guardar} fullWidth icon={Save}>Guardar</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── ASISTENCIA ─────────────────────────────────────────────────────
const AsistenciaView = ({ data, setData, toast }) => {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const total = data.asistencia.reduce((a, d) => a + d.total, 0);
  const prom = data.asistencia.length > 0 ? Math.round(total / data.asistencia.length) : 0;
  const totalNuevos = data.asistencia.reduce((a, d) => a + d.nuevos, 0);
  const blank = { fecha: today(), servicio: "Culto Dominical AM", total: 0, nuevos: 0, ninos: 0, jovenes: 0, adultos: 0 };

  const guardar = async () => {
    if (!editando.servicio || editando.total <= 0) return;
    const exists = data.asistencia.find(a => a.id === editando.id);
    const saved = await upsertRecord("asistencia", editando, !exists) || editando;
    if (exists) setData({ ...data, asistencia: data.asistencia.map(a => a.id === editando.id ? saved : a) });
    else setData({ ...data, asistencia: [saved, ...data.asistencia] });
    toast(exists ? "Registro actualizado" : "Asistencia registrada");
    setModal(false); setEditando(null);
  };

  return (
    <div className="fadein">
      <PageHeader title="Asistencia" subtitle="Registro de asistencia a cultos y servicios" actions={<Button variant="primary" size="md" icon={Plus} onClick={() => { setEditando({ ...blank, id: uid() }); setModal(true); }}>Registrar Asistencia</Button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Registrado" value={fmt(total)} icon={Users} color={G.dark} />
        <StatCard label="Promedio por Servicio" value={fmt(prom)} icon={BarChart2} color={G.primary} />
        <StatCard label="Nuevos Visitantes" value={fmt(totalNuevos)} icon={UserPlus} color={G.success} />
        <StatCard label="Registros" value={data.asistencia.length} icon={FileText} color={G.purple} />
      </div>
      <Card hover={false}>
        {data.asistencia.sort((a, b) => b.fecha.localeCompare(a.fecha)).map((a, i) => (
          <div key={a.id} className="list-row" style={{ display: "flex", alignItems: "center", gap: 16, padding: "13px 0", borderBottom: i < data.asistencia.length - 1 ? `1px solid ${G.grayMid}20` : "none" }}>
            <div style={{ width: 48, textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: G.primary, fontFamily: fontTitle }}>{new Date(a.fecha + "T12:00").getDate()}</div>
              <div style={{ fontSize: 10, color: G.gray, textTransform: "uppercase" }}>{monthName(new Date(a.fecha + "T12:00").getMonth())}</div>
            </div>
            <div className="list-main" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: G.dark }}>{a.servicio}</div>
              <div style={{ fontSize: 12, color: G.gray }}>Niños: {a.ninos} · Jóvenes: {a.jovenes} · Adultos: {a.adultos}</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>{fmt(a.total)}</div>
            {a.nuevos > 0 && <Badge variant="success">+{a.nuevos} nuevos</Badge>}
            <button onClick={() => { setEditando({ ...a }); setModal(true); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}><Edit size={15} color={G.gray} /></button>
          </div>
        ))}
      </Card>
      {modal && editando && (
        <Modal title="Registrar Asistencia" onClose={() => { setModal(false); setEditando(null); }}>
          <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Fecha" value={editando.fecha} onChange={e => setEditando({ ...editando, fecha: e.target.value })} type="date" />
            <Select label="Servicio" value={editando.servicio} onChange={e => setEditando({ ...editando, servicio: e.target.value })} options={["Culto Dominical AM", "Culto Dominical PM", "Culto de Oración (Miércoles)", "Culto de Jóvenes (Viernes)", "Escuela Dominical", "Otro"]} />
            <Input label="Total asistentes" value={editando.total} onChange={e => setEditando({ ...editando, total: Number(e.target.value) })} type="number" required />
            <Input label="Nuevos visitantes" value={editando.nuevos} onChange={e => setEditando({ ...editando, nuevos: Number(e.target.value) })} type="number" />
            <Input label="Niños" value={editando.ninos} onChange={e => setEditando({ ...editando, ninos: Number(e.target.value) })} type="number" />
            <Input label="Jóvenes" value={editando.jovenes} onChange={e => setEditando({ ...editando, jovenes: Number(e.target.value) })} type="number" />
            <Input label="Adultos" value={editando.adultos} onChange={e => setEditando({ ...editando, adultos: Number(e.target.value) })} type="number" />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Button variant="outline" size="md" onClick={() => { setModal(false); setEditando(null); }} fullWidth>Cancelar</Button>
            <Button variant="primary" size="md" onClick={guardar} fullWidth icon={Save}>Guardar</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── CÉLULAS ────────────────────────────────────────────────────────
const CelulasView = ({ data, setData, toast }) => {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const blank = { nombre: "", lider: "", dia: "Martes", hora: "19:00", lugar: "", miembros: 0, estado: "activo", zona: "" };

  const guardar = async () => {
    if (!editando.nombre) return;
    const exists = data.celulas.find(c => c.id === editando.id);
    const saved = await upsertRecord("celulas", editando, !exists) || editando;
    if (exists) setData({ ...data, celulas: data.celulas.map(c => c.id === editando.id ? saved : c) });
    else setData({ ...data, celulas: [saved, ...data.celulas] });
    toast(exists ? "Célula actualizada" : "Célula creada");
    setModal(false); setEditando(null);
  };

  return (
    <div className="fadein">
      <PageHeader title="Células" subtitle="Grupos de vida y discipulado" actions={<Button variant="primary" size="md" icon={Plus} onClick={() => { setEditando({ ...blank, id: uid() }); setModal(true); }}>Nueva Célula</Button>} />
      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 16 }}>
        <StatCard label="Total Células" value={data.celulas.length} icon={Home} color={G.primary} />
        <StatCard label="Activas" value={data.celulas.filter(c => c.estado === "activo").length} icon={Check} color={G.success} />
        <StatCard label="Total en Células" value={data.celulas.reduce((a, c) => a + c.miembros, 0)} icon={Users} color={G.purple} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {data.celulas.map(c => (
          <Card key={c.id} hover>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <Badge variant={c.estado === "activo" ? "success" : "default"}>{c.estado}</Badge>
              <Badge variant="default">{c.zona}</Badge>
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: G.dark, fontFamily: fontTitle }}>{c.nombre}</h3>
            <div style={{ fontSize: 13, color: G.gray, marginBottom: 4 }}>Líder: <strong style={{ color: G.dark }}>{c.lider}</strong></div>
            <div style={{ fontSize: 12.5, color: G.gray, marginBottom: 4 }}><Calendar size={12} style={{ display: "inline", marginRight: 4 }} />{c.dia} · {c.hora}</div>
            <div style={{ fontSize: 12.5, color: G.gray, marginBottom: 12 }}><MapPin size={12} style={{ display: "inline", marginRight: 4 }} />{c.lugar}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12.5, color: G.gray }}><Users size={13} style={{ display: "inline", marginRight: 4 }} />{c.miembros} miembros</div>
              <Button variant="outline" size="sm" icon={Edit} onClick={() => { setEditando({ ...c }); setModal(true); }}>Editar</Button>
            </div>
          </Card>
        ))}
      </div>
      {modal && editando && (
        <Modal title={data.celulas.find(c => c.id === editando.id) ? "Editar Célula" : "Nueva Célula"} onClose={() => { setModal(false); setEditando(null); }}>
          <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}><Input label="Nombre" value={editando.nombre} onChange={e => setEditando({ ...editando, nombre: e.target.value })} required /></div>
            <Input label="Líder" value={editando.lider} onChange={e => setEditando({ ...editando, lider: e.target.value })} />
            <Input label="Zona" value={editando.zona} onChange={e => setEditando({ ...editando, zona: e.target.value })} />
            <Select label="Día" value={editando.dia} onChange={e => setEditando({ ...editando, dia: e.target.value })} options={["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"]} />
            <Input label="Hora" value={editando.hora} onChange={e => setEditando({ ...editando, hora: e.target.value })} type="time" />
            <div style={{ gridColumn: "1/-1" }}><Input label="Dirección" value={editando.lugar} onChange={e => setEditando({ ...editando, lugar: e.target.value })} icon={MapPin} /></div>
            <Input label="N° Miembros" value={editando.miembros} onChange={e => setEditando({ ...editando, miembros: Number(e.target.value) })} type="number" />
            <Select label="Estado" value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} options={["activo", "inactivo"]} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Button variant="outline" size="md" onClick={() => { setModal(false); setEditando(null); }} fullWidth>Cancelar</Button>
            <Button variant="primary" size="md" onClick={guardar} fullWidth icon={Save}>Guardar</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── MINISTERIOS ────────────────────────────────────────────────────
const MinisteriosView = ({ data, setData, toast }) => {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const blank = { nombre: "", lider: "", miembros: 0, descripcion: "", estado: "activo", reuniones: "" };

  const guardar = async () => {
    if (!editando.nombre) return;
    const exists = data.ministerios.find(m => m.id === editando.id);
    const saved = await upsertRecord("ministerios", editando, !exists) || editando;
    if (exists) setData({ ...data, ministerios: data.ministerios.map(m => m.id === editando.id ? saved : m) });
    else setData({ ...data, ministerios: [saved, ...data.ministerios] });
    toast(exists ? "Ministerio actualizado" : "Ministerio creado");
    setModal(false); setEditando(null);
  };

  return (
    <div className="fadein">
      <PageHeader title="Ministerios" subtitle="Áreas de servicio de la iglesia" actions={<Button variant="primary" size="md" icon={Plus} onClick={() => { setEditando({ ...blank, id: uid() }); setModal(true); }}>Nuevo Ministerio</Button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {data.ministerios.map(m => (
          <Card key={m.id} hover>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <Badge variant={m.estado === "activo" ? "success" : "default"}>{m.estado}</Badge>
              <span style={{ fontSize: 12, color: G.gray }}>{m.reuniones}</span>
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: G.dark, fontFamily: fontTitle }}>{m.nombre}</h3>
            <div style={{ fontSize: 13, color: G.gray, marginBottom: 6 }}>Líder: <strong style={{ color: G.dark }}>{m.lider}</strong></div>
            <p style={{ margin: "0 0 14px", fontSize: 12.5, color: G.gray, lineHeight: 1.5 }}>{m.descripcion}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: G.primary }}><Users size={15} /> {m.miembros} miembros</div>
              <Button variant="outline" size="sm" icon={Edit} onClick={() => { setEditando({ ...m }); setModal(true); }}>Editar</Button>
            </div>
          </Card>
        ))}
      </div>
      {modal && editando && (
        <Modal title={data.ministerios.find(m => m.id === editando.id) ? "Editar Ministerio" : "Nuevo Ministerio"} onClose={() => { setModal(false); setEditando(null); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Nombre" value={editando.nombre} onChange={e => setEditando({ ...editando, nombre: e.target.value })} required />
            <Input label="Líder" value={editando.lider} onChange={e => setEditando({ ...editando, lider: e.target.value })} />
            <TextArea label="Descripción" value={editando.descripcion} onChange={e => setEditando({ ...editando, descripcion: e.target.value })} />
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Miembros" value={editando.miembros} onChange={e => setEditando({ ...editando, miembros: Number(e.target.value) })} type="number" />
              <Select label="Estado" value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} options={["activo", "inactivo"]} />
            </div>
            <Input label="Reuniones" value={editando.reuniones} onChange={e => setEditando({ ...editando, reuniones: e.target.value })} placeholder="Ej: Sábados 15:00" />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Button variant="outline" size="md" onClick={() => { setModal(false); setEditando(null); }} fullWidth>Cancelar</Button>
            <Button variant="primary" size="md" onClick={guardar} fullWidth icon={Save}>Guardar</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── TIENDA ─────────────────────────────────────────────────────────
const TiendaView = ({ data, setData, toast }) => {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [buscar, setBuscar] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const categorias = ["Todos", ...new Set(data.productos.map(p => p.categoria))];
  const filtrados = data.productos.filter(p => {
    const mc = filtro === "Todos" || p.categoria === filtro;
    const mb = p.titulo.toLowerCase().includes(buscar.toLowerCase()) || p.autor.toLowerCase().includes(buscar.toLowerCase());
    return mc && mb;
  });
  const blank = { titulo: "", autor: "", precio: 0, imagen: "📖", categoria: "Doctrina", descripcion: "", stock: 0, editorial: "" };

  const guardar = async () => {
    if (!editando.titulo) return;
    const exists = data.productos.find(p => p.id === editando.id);
    const saved = await upsertRecord("productos", editando, !exists) || editando;
    if (exists) setData({ ...data, productos: data.productos.map(p => p.id === editando.id ? saved : p) });
    else setData({ ...data, productos: [saved, ...data.productos] });
    toast(exists ? "Producto actualizado" : "Producto agregado");
    setModal(false); setEditando(null);
  };

  return (
    <div className="fadein">
      <PageHeader title="Tienda" subtitle="Gestión de productos e inventario" actions={<Button variant="primary" size="md" icon={Plus} onClick={() => { setEditando({ ...blank, id: uid() }); setModal(true); }}>Nuevo Producto</Button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Catálogo" value={data.productos.length} icon={Package} color={G.primary} />
        <StatCard label="Stock Total" value={data.productos.reduce((a, p) => a + p.stock, 0)} icon={Layers} color={G.success} />
        <StatCard label="Stock Bajo" value={data.productos.filter(p => p.stock < 20).length} icon={AlertCircle} color={G.danger} />
      </div>
      <Card hover={false} style={{ marginBottom: 20, padding: "14px 20px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}><Input placeholder="Buscar productos..." value={buscar} onChange={e => setBuscar(e.target.value)} icon={Search} /></div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {categorias.map(cat => (
              <button key={cat} onClick={() => setFiltro(cat)} style={{ padding: "6px 12px", borderRadius: 7, border: filtro === cat ? `2px solid ${G.primary}` : `1.5px solid ${G.grayMid}`, background: filtro === cat ? G.primary + "10" : "#fff", color: filtro === cat ? G.primary : G.gray, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: font }}>{cat}</button>
            ))}
          </div>
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
        {filtrados.map(p => (
          <Card key={p.id} hover>
            <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12, background: G.grayLight, borderRadius: 10, padding: "20px 0" }}>{p.imagen}</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <Badge variant="default">{p.categoria}</Badge>
              <Badge variant={p.stock > 20 ? "success" : p.stock > 0 ? "warning" : "danger"}>Stock: {p.stock}</Badge>
            </div>
            <h4 style={{ margin: "0 0 3px", fontSize: 14.5, fontWeight: 700, color: G.dark, fontFamily: fontTitle }}>{p.titulo}</h4>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: G.gray }}>{p.autor}</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${G.grayMid}20` }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: G.primary, fontFamily: fontTitle }}>S/. {p.precio}</span>
              <button onClick={() => { setEditando({ ...p }); setModal(true); }} style={{ background: G.grayLight, border: "none", cursor: "pointer", padding: 7, borderRadius: 7 }}><Edit size={15} color={G.gray} /></button>
            </div>
          </Card>
        ))}
      </div>
      {modal && editando && (
        <Modal title={data.productos.find(p => p.id === editando.id) ? "Editar Producto" : "Nuevo Producto"} onClose={() => { setModal(false); setEditando(null); }}>
          <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}><Input label="Título" value={editando.titulo} onChange={e => setEditando({ ...editando, titulo: e.target.value })} required /></div>
            <Input label="Autor" value={editando.autor} onChange={e => setEditando({ ...editando, autor: e.target.value })} />
            <Input label="Editorial" value={editando.editorial} onChange={e => setEditando({ ...editando, editorial: e.target.value })} />
            <Input label="Precio (S/.)" value={editando.precio} onChange={e => setEditando({ ...editando, precio: Number(e.target.value) })} type="number" />
            <Input label="Stock" value={editando.stock} onChange={e => setEditando({ ...editando, stock: Number(e.target.value) })} type="number" />
            <Select label="Categoría" value={editando.categoria} onChange={e => setEditando({ ...editando, categoria: e.target.value })} options={["Doctrina", "Historia", "Liderazgo", "Devocional", "Teología", "Ministerio", "Biblia", "Otro"]} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Button variant="outline" size="md" onClick={() => { setModal(false); setEditando(null); }} fullWidth>Cancelar</Button>
            <Button variant="primary" size="md" onClick={guardar} fullWidth icon={Save}>Guardar</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── BLOG ───────────────────────────────────────────────────────────
const BlogView = ({ data, setData, toast, readOnly = false }) => {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [eliminar, setEliminar] = useState(null);
  const blank = { titulo: "", autor: "Admin LADP", fecha: today(), categoria: "Enseñanza", imagen: "📝", extracto: "", visitas: 0, comentarios: 0, estado: "borrador" };

  const guardar = async () => {
    if (!editando.titulo) return;
    const exists = data.publicaciones.find(p => p.id === editando.id);
    const saved = await upsertRecord("publicaciones", editando, !exists) || editando;
    if (exists) setData({ ...data, publicaciones: data.publicaciones.map(p => p.id === editando.id ? saved : p) });
    else setData({ ...data, publicaciones: [saved, ...data.publicaciones] });
    toast(exists ? "Publicación actualizada" : "Publicación creada");
    setModal(false); setEditando(null);
  };

  const confirmarEliminar = async () => {
    await removeRecord("publicaciones", eliminar.id);
    setData({ ...data, publicaciones: data.publicaciones.filter(p => p.id !== eliminar.id) });
    toast("Publicación eliminada");
    setEliminar(null);
  };

  return (
    <div className="fadein">
      <PageHeader title="Blog" subtitle={readOnly ? "Publicaciones de la iglesia" : "Gestión de publicaciones y artículos"} actions={!readOnly && <Button variant="primary" size="md" icon={Plus} onClick={() => { setEditando({ ...blank, id: uid() }); setModal(true); }}>Nueva Publicación</Button>} />
      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 16 }}>
        <StatCard label="Publicaciones" value={data.publicaciones.length} icon={FileText} color={G.primary} />
        <StatCard label="Total Visitas" value={fmt(data.publicaciones.reduce((a, p) => a + p.visitas, 0))} icon={Activity} color={G.success} />
        <StatCard label="Comentarios" value={fmt(data.publicaciones.reduce((a, p) => a + p.comentarios, 0))} icon={MessageCircle} color={G.purple} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {data.publicaciones.map(pub => (
          <Card key={pub.id} hover>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{pub.imagen}</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <Badge variant="default">{pub.categoria}</Badge>
              <Badge variant={pub.estado === "publicado" ? "success" : "warning"}>{pub.estado}</Badge>
            </div>
            <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: G.dark, lineHeight: 1.35, fontFamily: fontTitle }}>{pub.titulo}</h3>
            <p style={{ margin: "0 0 12px", fontSize: 12.5, color: G.gray, lineHeight: 1.5 }}>{pub.extracto?.slice(0, 100)}…</p>
            <div style={{ display: "flex", gap: 10, fontSize: 11.5, color: G.gray, paddingTop: 10, borderTop: `1px solid ${G.grayMid}20`, marginBottom: 12 }}>
              <span style={{ fontWeight: 600 }}>{pub.autor}</span><span>·</span><span>{fmt(pub.visitas)} vistas</span><span>·</span><span>{pub.comentarios} comentarios</span>
            </div>
            {!readOnly && <div style={{ display: "flex", gap: 8 }}>
              <Button variant="outline" size="sm" icon={Edit} onClick={() => { setEditando({ ...pub }); setModal(true); }} fullWidth>Editar</Button>
              <button onClick={() => setEliminar(pub)} style={{ background: "none", border: `1.5px solid ${G.grayMid}`, cursor: "pointer", padding: "6px 10px", borderRadius: 8, display: "flex", alignItems: "center" }}><Trash2 size={15} color={G.danger} /></button>
            </div>}
          </Card>
        ))}
      </div>
      {!readOnly && modal && editando && (
        <Modal title={data.publicaciones.find(p => p.id === editando.id) ? "Editar Publicación" : "Nueva Publicación"} onClose={() => { setModal(false); setEditando(null); }} width={640}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Título" value={editando.titulo} onChange={e => setEditando({ ...editando, titulo: e.target.value })} required />
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Autor" value={editando.autor} onChange={e => setEditando({ ...editando, autor: e.target.value })} />
              <Select label="Categoría" value={editando.categoria} onChange={e => setEditando({ ...editando, categoria: e.target.value })} options={["Enseñanza", "Historia", "Ministerio", "Jóvenes", "Adolescentes", "Adoración", "Devocional", "Testimonio"]} />
            </div>
            <TextArea label="Extracto / Contenido" value={editando.extracto} onChange={e => setEditando({ ...editando, extracto: e.target.value })} rows={4} />
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Select label="Estado" value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} options={["borrador", "publicado"]} />
              <Input label="Fecha" value={editando.fecha} onChange={e => setEditando({ ...editando, fecha: e.target.value })} type="date" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Button variant="outline" size="md" onClick={() => { setModal(false); setEditando(null); }} fullWidth>Cancelar</Button>
            <Button variant="primary" size="md" onClick={guardar} fullWidth icon={Save}>Guardar</Button>
          </div>
        </Modal>
      )}
      {eliminar && <ConfirmDialog message={`¿Eliminar "${eliminar.titulo}"? Esta acción no se puede deshacer.`} onConfirm={confirmarEliminar} onCancel={() => setEliminar(null)} />}
    </div>
  );
};

// ─── MINISTERIO DE ADOLESCENTES (TEENS) — CALENDARIO 2026 ───────────
// "Llamados a Servir" · ICV San Juan de Lurigancho
const TEENS_TIPOS = ["Enseñanza", "Evangelismo", "Adoración", "Recreación", "Arte", "Taller", "Servicio", "Oración", "Integración", "Otro"];
const teensTipoColor = (t) => ({ Enseñanza: G.primary, Evangelismo: G.success, Adoración: G.primaryLight, Recreación: G.accent, Arte: G.purple, Taller: G.purple, Servicio: G.warning, Oración: G.primaryDark, Integración: G.accentDark, Iglesia: "#9aa5b1", Otro: G.gray }[t] || G.gray);
const MESES_FULL = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DOW = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Temario de enseñanza + actividades + propuestas (fuente: documentos del ministerio)
const TEENS_2026 = [
  // Temario de Enseñanza (Sábados) — Mar–Jun
  { fecha: "2026-03-14", tipo: "Enseñanza", titulo: "¿Quién soy en Cristo?", responsable: "Kevin", dinamica: "Etiquetas negativas reemplazadas por verdades bíblicas: cada uno declara “En Cristo soy…”." },
  { fecha: "2026-03-21", tipo: "Enseñanza", titulo: "La Guerra Espiritual", responsable: "José Manuel", dinamica: "Juego de estrategia: cada equipo defiende “verdades bíblicas”." },
  { fecha: "2026-04-04", tipo: "Enseñanza", titulo: "La Armadura", responsable: "Antonella", dinamica: "Armar visualmente la armadura de Dios con carteles." },
  { fecha: "2026-04-11", tipo: "Enseñanza", titulo: "Perdonar para ser libre", responsable: "Miguel Sivirichi", dinamica: "Romper un papel que representa ofensas pasadas." },
  { fecha: "2026-04-18", tipo: "Enseñanza", titulo: "Perdóname", responsable: "Gisela", dinamica: "Actividad de reconciliación entre grupos." },
  { fecha: "2026-05-02", tipo: "Enseñanza", titulo: "Puedo hacerlo, pero ¿debo?", responsable: "Fiorella", dinamica: "Debate sobre decisiones cotidianas." },
  { fecha: "2026-05-16", tipo: "Enseñanza", titulo: "Tomando decisiones sabias", responsable: "Gladys", dinamica: "Resolver casos prácticos en equipos." },
  { fecha: "2026-05-30", tipo: "Enseñanza", titulo: "Compartiendo a Cristo", responsable: "Miguel Sivirichi", dinamica: "Simulación de evangelismo." },
  { fecha: "2026-06-06", tipo: "Enseñanza", titulo: "El futuro", responsable: "Gladys", dinamica: "Escribir metas espirituales para 5 años." },
  { fecha: "2026-06-13", tipo: "Enseñanza", titulo: "Más sobre el futuro", responsable: "Fiorella", dinamica: "Oración grupal por propósito y llamado." },
  // Actividades especiales (del cuaderno del ministerio) — Sábados 4–6 pm
  { fecha: "2026-06-20", tipo: "Arte", titulo: "Expresarte / Periódico Mural", responsable: "Equipo Teens", nota: "Expresión artística y periódico mural colaborativo." },
  { fecha: "2026-06-27", tipo: "Enseñanza", titulo: "Enseñanza — Ps. Miguel", responsable: "Ps. Miguel" },
  { fecha: "2026-07-04", tipo: "Recreación", titulo: "Karaoke Teens / Reflexión", responsable: "Equipo Teens" },
  { fecha: "2026-07-11", tipo: "Adoración", titulo: "Noche de Talentos y Adoración", responsable: "Jorge / Priscila", nota: "Talentos y adoración; invitar amigos." },
  { fecha: "2026-07-18", tipo: "Evangelismo", titulo: "Evangelismo Teens / Picnic al aire libre", responsable: "Jorge / Priscila", nota: "Salida de evangelismo con picnic." },
  { fecha: "2026-07-25", tipo: "Evangelismo", titulo: "Tarde de Juegos Evangelística (en templo)", responsable: "Jorge / Priscila", nota: "Juegos + evangelismo dentro del templo, para recibir chicos nuevos." },
  // Plan anual ICV "Pasión por su Obra 2026": actividades de la iglesia que involucran a los teens
  { fecha: "2026-04-03", tipo: "Iglesia", titulo: "Explosión Evangelística", responsable: "ICV", iglesia: true },
  { fecha: "2026-04-04", tipo: "Iglesia", titulo: "Culto Evangelístico Juvenil", responsable: "ICV", iglesia: true },
  { fecha: "2026-05-01", tipo: "Iglesia", titulo: "Jornada de ayuda de misericordia Juvenil", responsable: "ICV", iglesia: true },
  { fecha: "2026-06-13", tipo: "Iglesia", titulo: "Intercambio de Culto Juvenil", responsable: "ICV", iglesia: true },
  { fecha: "2026-06-29", tipo: "Iglesia", titulo: "Olimpiada Juvenil", responsable: "ICV", iglesia: true },
  { fecha: "2026-07-11", tipo: "Iglesia", titulo: "Noche de Talentos", responsable: "ICV", iglesia: true },
  { fecha: "2026-07-27", tipo: "Iglesia", titulo: "Retiro Familiar (27–29 jul, toda la iglesia)", responsable: "ICV", iglesia: true },
  { fecha: "2026-08-11", tipo: "Iglesia", titulo: "Inicio del Concurso Bíblico Nacional", responsable: "ICV", iglesia: true },
  { fecha: "2026-08-15", tipo: "Iglesia", titulo: "Intercambio de Culto Juvenil", responsable: "ICV", iglesia: true },
  { fecha: "2026-09-19", tipo: "Iglesia", titulo: "Culto especial por la Juventud", responsable: "ICV", iglesia: true },
  { fecha: "2026-09-27", tipo: "Iglesia", titulo: "Etapa final Concurso Bíblico Nacional", responsable: "ICV", iglesia: true },
  { fecha: "2026-10-08", tipo: "Iglesia", titulo: "Bautismo", responsable: "ICV", iglesia: true },
  { fecha: "2026-10-10", tipo: "Oración", titulo: "Oraciones Matinales · Pasión por la Oración", ministerio: "Ministerio de Adolescentes", responsable: "Hno. Jorge Alaya", hora: "4:30–6:00 a. m.", reflexion: "Amós 3:7", editableBase: true },
  { fecha: "2026-10-17", tipo: "Iglesia", titulo: "Teología Musical", responsable: "ICV", iglesia: true },
  { fecha: "2026-10-24", tipo: "Iglesia", titulo: "Campaña Evangelística (23–24 oct)", responsable: "ICV", iglesia: true },
  { fecha: "2026-10-31", tipo: "Iglesia", titulo: "Adoración Pública Región Lima-Noreste · Aniversario LADP", responsable: "ICV", iglesia: true },
  { fecha: "2026-11-07", tipo: "Iglesia", titulo: "Culto Kids", responsable: "ICV", iglesia: true },
  { fecha: "2026-11-21", tipo: "Iglesia", titulo: "Talleres de Orientación Vocacional", responsable: "ICV", iglesia: true },
  { fecha: "2026-11-28", tipo: "Iglesia", titulo: "Fun Day Kids", responsable: "ICV", iglesia: true },
  { fecha: "2026-12-12", tipo: "Iglesia", titulo: "Clausura del Trabajo de Damas y Varones", responsable: "ICV", iglesia: true },
  { fecha: "2026-12-19", tipo: "Iglesia", titulo: "Entrega de Canastas · Concierto en Vivo", responsable: "ICV", iglesia: true },
  { fecha: "2026-12-26", tipo: "Iglesia", titulo: "Fun Day Teens", responsable: "ICV", iglesia: true },
  { fecha: "2026-12-27", tipo: "Iglesia", titulo: "Acción de Gracias ICV", responsable: "ICV", iglesia: true },
  // Propuestas Teens Oct–Dic, cruzadas con el plan ICV y el eje del mes — SÁBADOS 4:00–6:00 pm
  // Oct "Siervos de Cristo" (Mc 16:15-18) · Nov "El único camino de Salvación" (Hch 4:12) · Dic "Cristo, la necesidad absoluta" (Ro 3:23)
  { fecha: "2026-10-10", tipo: "Taller", titulo: "Mi identidad no está en los likes", responsable: "Por asignar", propuesta: true, nota: "Fe, autoestima e identidad en la era de las redes sociales. Sábado libre en el plan ICV." },
  { fecha: "2026-10-17", tipo: "Adoración", titulo: "Teens en Teología Musical: alabanza con fundamento", responsable: "Por asignar", propuesta: true, nota: "Participar en la Teología Musical de la iglesia y, después, formar el equipo de alabanza teens." },
  { fecha: "2026-10-24", tipo: "Evangelismo", titulo: "Teens en la Campaña Evangelística", responsable: "Por asignar", propuesta: true, nota: "Drama o mimo, invitaciones casa por casa y oración por los asistentes. Eje del mes: Siervos de Cristo (Mc 16:15)." },
  { fecha: "2026-10-31", tipo: "Adoración", titulo: "Teens en la Adoración Pública Lima-Noreste", responsable: "Por asignar", propuesta: true, nota: "Alternativa cristiana al 31 de octubre: adorar juntos en el Aniversario LADP. Preparar pancartas y una coreografía." },
  { fecha: "2026-11-07", tipo: "Servicio", titulo: "Llamados a Servir: Teens apoyan el Culto Kids", responsable: "Por asignar", propuesta: true, nota: "Taller breve de dones y luego servir como ayudantes en el Culto Kids (1 Pe 4:10)." },
  { fecha: "2026-11-14", tipo: "Recreación", titulo: "Funday Teens: Olimpiadas Bíblicas", responsable: "Por asignar", propuesta: true, nota: "Postas por equipos, retos bíblicos y premios. Devocional sobre trabajar en equipo (Ec 4:9-12)." },
  { fecha: "2026-11-21", tipo: "Taller", titulo: "Orientación Vocacional Teens: mi proyecto de vida", responsable: "Por asignar", propuesta: true, nota: "Participar en los Talleres de Orientación Vocacional de la iglesia y armar un mapa de metas (Jer 29:11)." },
  { fecha: "2026-11-28", tipo: "Servicio", titulo: "Teens monitores del Fun Day Kids", responsable: "Por asignar", propuesta: true, nota: "Los teens dirigen juegos y estaciones para los niños; cierre con oración de gratitud." },
  { fecha: "2026-12-05", tipo: "Recreación", titulo: "Rally Bíblico: Búsqueda del Tesoro", responsable: "Por asignar", propuesta: true, nota: "Pistas con versículos por el templo; el tesoro es una Biblia o devocional (Mt 13:44). Sábado libre en el plan ICV." },
  { fecha: "2026-12-12", tipo: "Arte", titulo: "Ensayo de la Presentación Navideña Teens", responsable: "Por asignar", propuesta: true, nota: "Preparar drama y canto navideño para presentarlo en el Concierto en Vivo del 19 de diciembre." },
  { fecha: "2026-12-19", tipo: "Servicio", titulo: "Teens en la Entrega de Canastas y el Concierto", responsable: "Por asignar", propuesta: true, nota: "Armar y entregar canastas; presentar el número navideño en el Concierto en Vivo." },
  { fecha: "2026-12-26", tipo: "Recreación", titulo: "Fun Day Teens: cierre del año + metas 2027", responsable: "Por asignar", propuesta: true, nota: "Fun Day oficial del plan ICV: juegos, testimonios del año y metas espirituales 2027." },
];

// Banco de ideas para adolescentes: se pueden programar en cualquier sábado
const TEENS_IDEAS = [
  { categoria: "Talleres", tipo: "Taller", titulo: "Redes con Propósito", nota: "Crear reels, posts y versículos diseñados para compartir la fe en redes de forma creativa y responsable." },
  { categoria: "Talleres", tipo: "Taller", titulo: "Ansiedad y fe: cuida tu corazón", nota: "Herramientas prácticas para manejar el estrés escolar y la ansiedad a la luz de Filipenses 4:6-7." },
  { categoria: "Talleres", tipo: "Adoración", titulo: "Escuela de Alabanza Teens", nota: "Mini clases de guitarra, cajón, canto y coros; formar el grupo de alabanza teens." },
  { categoria: "Talleres", tipo: "Arte", titulo: "Manualidades: Versículos para regalar", nota: "Separadores, cuadros y tarjetas con versículos para regalar a familiares o vecinos." },
  { categoria: "Talleres", tipo: "Integración", titulo: "Cocina Teens: Panes y Peces", nota: "Preparar algo sencillo en equipos y compartirlo; reflexión sobre el milagro de la multiplicación (Jn 6)." },
  { categoria: "Funday", tipo: "Recreación", titulo: "Copa Teens: Funday Deportivo", nota: "Torneo de fútbol / vóley mixto con devocional en el medio tiempo; invitar amigos del colegio." },
  { categoria: "Funday", tipo: "Recreación", titulo: "Cine Fórum Cristiano", nota: "Película o cortometraje con valores cristianos, canchita y debate guiado al final." },
  { categoria: "Funday", tipo: "Recreación", titulo: "Noche de Juegos de Mesa Bíblicos", nota: "Pictionary bíblico, Jenga de preguntas, Uno con retos y Basta bíblico por estaciones." },
  { categoria: "Funday", tipo: "Integración", titulo: "Paseo / Día de Campo Teens", nota: "Salida al aire libre con juegos, almuerzo compartido y devocional en la naturaleza (Sal 19:1)." },
  { categoria: "Dinámicas", tipo: "Integración", titulo: "Escape Room Bíblico", nota: "Resolver acertijos y códigos con pistas de la Biblia para “escapar” en un tiempo límite." },
  { categoria: "Dinámicas", tipo: "Enseñanza", titulo: "¿Quién quiere ser sabio? (concurso bíblico)", nota: "Concurso estilo TV con comodines; preguntas de Proverbios y personajes bíblicos." },
  { categoria: "Dinámicas", tipo: "Integración", titulo: "Caminata de la Confianza", nota: "En parejas, uno con los ojos vendados guiado por la voz del otro; reflexión sobre Proverbios 3:5-6." },
  { categoria: "Dinámicas", tipo: "Arte", titulo: "Teatro Express de Parábolas", nota: "Cada equipo recibe una parábola y la actúa en versión moderna en 5 minutos." },
  { categoria: "Dinámicas", tipo: "Oración", titulo: "Mural de Oración", nota: "Escribir peticiones y agradecimientos en un mural; orar por los pedidos de otros durante el mes." },
];
TEENS_IDEAS.push(
  { categoria: "Talleres", tipo: "Taller", titulo: "Proyecto de Vida con Propósito", nota: "Vocación, carrera y llamado: cada teen arma su mapa de sueños y metas a la luz de Jeremías 29:11." },
  { categoria: "Talleres", tipo: "Taller", titulo: "Cómo estudiar la Biblia (método inductivo)", nota: "Observar, interpretar y aplicar; se entrega una guía para usar en casa." },
  { categoria: "Talleres", tipo: "Taller", titulo: "Bullying, respeto y empatía", nota: "Cómo responder al acoso escolar y ser un amigo que defiende al débil (Mt 7:12)." },
  { categoria: "Funday", tipo: "Recreación", titulo: "Karaoke y Picnic de Bienvenida al Cole", nota: "Inicio del año escolar (marzo): juegos, alabanza y oración por los estudios." },
  { categoria: "Dinámicas", tipo: "Oración", titulo: "Noche de Oración y Llenura del Espíritu Santo", nota: "Tiempo de búsqueda, adoración y ministración; enseñanza previa de Hechos 2." },
  { categoria: "Retiros y campamentos", tipo: "Integración", titulo: "Campamento de Verano Teens", nota: "2–3 días en enero/febrero: plenarias, fogata, deportes y consagración. Coordinar con Jóvenes LADP." },
  { categoria: "Retiros y campamentos", tipo: "Integración", titulo: "Retiro Express (un día)", nota: "Sábado completo fuera de Lima (p. ej. Cieneguilla o Chosica): devocionales, juegos y altar." },
  { categoria: "Retiros y campamentos", tipo: "Integración", titulo: "Pijamada Teens en el templo", nota: "Por grupos (chicos / chicas) con líderes adultos y autorización de los padres: película, oración y desayuno." },
  { categoria: "Servicio y misión", tipo: "Servicio", titulo: "Visita a un hogar de ancianos o albergue", nota: "Canciones, regalos hechos por los teens y oración por los residentes (Stg 1:27)." },
  { categoria: "Servicio y misión", tipo: "Evangelismo", titulo: "Evangelismo en el parque con mimo y drama", nota: "Drama corto + testimonio + folletos en un parque de San Juan de Lurigancho." },
  { categoria: "Servicio y misión", tipo: "Servicio", titulo: "Teens al servicio del culto", nota: "Un domingo al mes los teens apoyan en ujieres, alabanza, multimedia y bienvenida." },
  { categoria: "Servicio y misión", tipo: "Evangelismo", titulo: "Campaña “Perú para Cristo” (Fiestas Patrias)", nota: "Oración por el país y apoyo a misiones del interior junto al ministerio de Evangelismo y Misiones." },
  { categoria: "Talleres", tipo: "Taller", titulo: "Taller de Devocional Creativo: Mi tiempo con Dios", nota: "Cada teen arma su diario devocional (lettering, stickers, plan de lectura) y aprende a orar con la Biblia." },
  { categoria: "Funday", tipo: "Evangelismo", titulo: "Trae un Amigo + Parrillada", nota: "Evangelismo relacional con comida y juegos." },
  { categoria: "Dinámicas", tipo: "Evangelismo", titulo: "Noche de Héroes de la Fe", nota: "Personajes bíblicos, juegos y evangelismo; ideal como alternativa al 31 de octubre." },
  { categoria: "Dinámicas", tipo: "Adoración", titulo: "Noche de Alabanza y Testimonios Teens", nota: "Espacio de adoración y testimonios; invitar amigos." },
  { categoria: "Dinámicas", tipo: "Oración", titulo: "Vigilia Teens / Noche de Gratitud", nota: "Oración, gratitud y consagración." },
  { categoria: "Servicio y misión", tipo: "Evangelismo", titulo: "Navidad con Propósito / Posada Evangelística", nota: "Bolsas navideñas y evangelismo en El Arenal Alto." },
  { categoria: "Retiros y campamentos", tipo: "Enseñanza", titulo: "Preparación Teens para el Concurso Bíblico Nacional", nota: "Equipos de estudio y simulacros desde agosto, rumbo a la etapa final de septiembre." },
);
const IDEA_ICON = { Talleres: "🛠️", Funday: "🎉", Dinámicas: "🎲", "Retiros y campamentos": "⛺", "Servicio y misión": "🤝" };

// Plan de enseñanza 2027 para Teens, alineado a los ejes mensuales del plan ICV "Pasión por su Obra 2026"
// y a sus actividades juveniles. Actualizar los ejes cuando la iglesia publique su plan 2027.
const TEENS_PLAN_2027 = [
  { mes: "Enero", eje: "Vida Espiritual", versiculo: "Hechos 12", temas: ["Ayuno y oración para teens", "Mi devocional diario", "Orar como la iglesia de Hechos 12"], destacado: "Ayuno y oración congregacional + Campamento de Verano Teens" },
  { mes: "Febrero", eje: "Un Amor Transformador", versiculo: "Lucas 6:31-35", temas: ["Amar como Jesús ama", "Amar al que me cae mal", "Amistades que suman"], destacado: "Aniversario Cristo Viene: número especial de los teens" },
  { mes: "Marzo", eje: "La Prueba del Discipulado", versiculo: "Juan 13:34-35", temas: ["¿Quién soy en Cristo?", "Discípulo en el colegio", "Presión de grupo", "Amor que se nota"], destacado: "Karaoke y Picnic de Bienvenida al Cole" },
  { mes: "Abril", eje: "El Llamado de Dios", versiculo: "Juan 13:34-35", temas: ["Dios me llama por mi nombre", "La Cruz y la Tumba Vacía", "Llamados a Servir", "Responder al llamado"], destacado: "Explosión Evangelística + Culto Evangelístico Juvenil" },
  { mes: "Mayo", eje: "Vida en Abundancia", versiculo: "Juan 10:10", temas: ["Abundancia no es tener más", "Honrar a mis padres", "Ansiedad y fe", "Gozo que no depende de likes"], destacado: "Jornada de ayuda de misericordia Juvenil" },
  { mes: "Junio", eje: "Comisionados para Salir", versiculo: "Lucas 24:45-48", temas: ["La Gran Comisión", "Mi testimonio en 3 minutos", "Evangelismo en redes", "Testigos en mi barrio"], destacado: "Intercambio de Culto Juvenil + Olimpiada Juvenil" },
  { mes: "Julio", eje: "Sanidad Divina", versiculo: "Juan 8:58", temas: ["Jesús, el gran YO SOY", "Dios sana el corazón herido", "Perdonar para ser libre", "Orar por los enfermos"], destacado: "Noche de Talentos + Retiro Familiar" },
  { mes: "Agosto", eje: "Exalta el Señorío de Cristo", versiculo: "Filipenses 2:9-11", temas: ["Jesús es Señor de mi vida", "Señor de mi tiempo y mis redes", "Lleno del Espíritu Santo"], destacado: "Intercambio de Culto Juvenil + inicio del Concurso Bíblico Nacional" },
  { mes: "Septiembre", eje: "La Integridad de la Biblia", versiculo: "Salmo 19:7", temas: ["¿Cómo llegó la Biblia a nosotros?", "Cómo estudiar la Biblia", "Memorizar la Palabra", "Obedecer lo que leo"], destacado: "Culto especial por la Juventud + final del Concurso Bíblico" },
  { mes: "Octubre", eje: "Siervos de Cristo", versiculo: "Marcos 16:15-18", temas: ["Servir como Jesús", "David y mis gigantes", "Ester: para esta hora"], destacado: "Campaña Evangelística + Adoración Pública Lima-Noreste" },
  { mes: "Noviembre", eje: "El Único Camino de Salvación", versiculo: "Hechos 4:12", temas: ["¿Todos los caminos llevan a Dios?", "Proyecto de vida con propósito", "Compartiendo a Cristo"], destacado: "Talleres de Orientación Vocacional" },
  { mes: "Diciembre", eje: "Cristo, la Necesidad Absoluta", versiculo: "Romanos 3:23", temas: ["Todos necesitamos a Cristo", "Emanuel: Dios con nosotros", "Metas espirituales del nuevo año"], destacado: "Fun Day Teens + Concierto en Vivo" },
];

// UUID fijo por fecha para cada propuesta base: al editarla/eliminarla se guarda una fila
// en cronograma_adolescentes con este id que reemplaza a la versión base.
const teensBaseId = (fecha, variante = "") => `7ee05000-0000-4000-8000-${fecha.replaceAll("-", "")}${variante ? "0001" : "0000"}`;
const newUUID = () => crypto.randomUUID ? crypto.randomUUID() : uid();

const PROGRAMA_REUNION = ["Bienvenida y oración", "Dinámica rompe hielo (10 min)", "Alabanza (15 min)", "Enseñanza bíblica (35 min)", "Dinámica de reflexión (15 min)", "Oración final", "Compartir"];

// ─── ACTAS DE REUNIÓN DEL EQUIPO TEENS (privadas: admin + rol teens) ─
const ActasAdolescentes = ({ data, setData, toast }) => {
  const actas = [...(data.actas || [])].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "") || (b.hora || "").localeCompare(a.hora || ""));
  const [editando, setEditando] = useState(null);
  const [eliminar, setEliminar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const blankActa = () => ({ id: newUUID(), fecha: today(), hora: "19:30", lugar: "Templo ICV", dirige: "", asistentes: "", temas: "", acuerdos: "", tareas: [] });
  const esNueva = (a) => !(data.actas || []).some(x => x.id === a.id);

  // Guarda en Supabase; si falla, avisa y no finge que se guardó
  const persistir = async (acta) => {
    const saved = await upsertRecord("actas", acta, esNueva(acta));
    if (!saved && isSupabaseConfigured()) { toast("No se pudo guardar el acta. Revisa tu conexión o permisos.", "error"); return null; }
    const final = saved || acta;
    setData(d => ({ ...d, actas: esNueva(acta) ? [final, ...(d.actas || [])] : (d.actas || []).map(x => x.id === acta.id ? final : x) }));
    return final;
  };
  const guardar = async () => {
    if (!editando.fecha) { toast("La fecha es obligatoria", "error"); return; }
    setGuardando(true);
    const acta = { ...editando, tareas: (editando.tareas || []).filter(t => t.texto?.trim()) };
    const nueva = esNueva(acta);
    const ok = await persistir(acta);
    setGuardando(false);
    if (ok) { toast(nueva ? "Acta registrada" : "Acta actualizada"); setEditando(null); }
  };
  const toggleTarea = (acta, idx) => persistir({ ...acta, tareas: acta.tareas.map((t, i) => i === idx ? { ...t, hecho: !t.hecho } : t) });
  const confirmarEliminar = async () => {
    const ok = await removeRecord("actas", eliminar.id);
    if (ok === false) { toast("No se pudo eliminar el acta", "error"); return; }
    setData(d => ({ ...d, actas: (d.actas || []).filter(x => x.id !== eliminar.id) }));
    toast("Acta eliminada"); setEliminar(null);
  };
  const setTarea = (i, campo, valor) => setEditando(e => ({ ...e, tareas: e.tareas.map((t, j) => j === i ? { ...t, [campo]: valor } : t) }));

  const pendientes = actas.flatMap(a => (a.tareas || []).map((t, i) => ({ ...t, acta: a, idx: i }))).filter(t => !t.hecho);
  const Bloque = ({ titulo, texto }) => texto ? (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: G.primary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>{titulo}</div>
      <div style={{ fontSize: 13, color: G.dark, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{texto}</div>
    </div>
  ) : null;
  const TareaItem = ({ t, onToggle }) => (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: t.hecho ? G.gray : G.dark, padding: "4px 0", cursor: "pointer" }}>
      <input type="checkbox" checked={!!t.hecho} onChange={onToggle} style={{ marginTop: 3, accentColor: G.primary }} />
      <span style={{ textDecoration: t.hecho ? "line-through" : "none", flex: 1 }}>{t.texto}
        {(t.responsable || t.fecha) && <span style={{ color: G.gray, fontSize: 12 }}> · {[t.responsable, t.fecha && fmtDateShort(t.fecha)].filter(Boolean).join(" · ")}</span>}
      </span>
    </label>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: G.gray }}>Apuntes de las reuniones del equipo de Adolescentes. Solo los ve el equipo del ministerio y el Super Administrador.</div>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setEditando(blankActa())}>Nueva acta</Button>
      </div>

      {pendientes.length > 0 && (
        <Card hover={false} style={{ marginBottom: 14, borderLeft: `3px solid ${G.accent}` }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: G.dark, marginBottom: 6 }}>Tareas pendientes ({pendientes.length})</div>
          {pendientes.map(t => <TareaItem key={t.acta.id + t.idx} t={t} onToggle={() => toggleTarea(t.acta, t.idx)} />)}
        </Card>
      )}

      {actas.length === 0
        ? <Card hover={false}><EmptyState icon={FileText} message="Aún no hay actas. Registra la primera reunión con “Nueva acta”." /></Card>
        : actas.map(a => (
          <Card key={a.id} hover={false} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>Reunión del {fmtDate(a.fecha)}{a.hora ? ` · ${a.hora}` : ""}</div>
                <div style={{ fontSize: 12, color: G.gray, marginTop: 2 }}>{[a.lugar, a.dirige && `Dirige: ${a.dirige}`].filter(Boolean).join(" · ")}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => setEditando({ ...a, tareas: a.tareas || [] })} style={{ background: "none", border: `1.5px solid ${G.grayMid}`, cursor: "pointer", padding: 6, borderRadius: 7, display: "flex" }}><Edit size={14} color={G.primary} /></button>
                <button onClick={() => setEliminar(a)} style={{ background: "none", border: `1.5px solid ${G.grayMid}`, cursor: "pointer", padding: 6, borderRadius: 7, display: "flex" }}><Trash2 size={14} color={G.danger} /></button>
              </div>
            </div>
            <Bloque titulo="Asistentes" texto={a.asistentes} />
            <Bloque titulo="Temas tratados" texto={a.temas} />
            <Bloque titulo="Acuerdos" texto={a.acuerdos} />
            {(a.tareas || []).length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: G.primary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Tareas</div>
                {a.tareas.map((t, i) => <TareaItem key={i} t={t} onToggle={() => toggleTarea(a, i)} />)}
              </div>
            )}
          </Card>
        ))}

      {editando && (
        <Modal title={esNueva(editando) ? "Nueva acta de reunión" : "Editar acta"} onClose={() => setEditando(null)} width={640}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Fecha" type="date" value={editando.fecha} onChange={e => setEditando({ ...editando, fecha: e.target.value })} required />
              <Input label="Hora" type="time" value={editando.hora} onChange={e => setEditando({ ...editando, hora: e.target.value })} />
              <Input label="Lugar" value={editando.lugar} onChange={e => setEditando({ ...editando, lugar: e.target.value })} />
              <Input label="Dirige" value={editando.dirige} onChange={e => setEditando({ ...editando, dirige: e.target.value })} placeholder="Quién dirigió la reunión" />
            </div>
            <TextArea label="Asistentes" value={editando.asistentes} onChange={e => setEditando({ ...editando, asistentes: e.target.value })} rows={2} placeholder="Jorge, Priscila, Kevin…" />
            <TextArea label="Temas tratados" value={editando.temas} onChange={e => setEditando({ ...editando, temas: e.target.value })} rows={4} />
            <TextArea label="Acuerdos" value={editando.acuerdos} onChange={e => setEditando({ ...editando, acuerdos: e.target.value })} rows={4} />
            <div>
              <div style={{ fontSize: 12.5, color: G.dark, fontWeight: 600, marginBottom: 6 }}>Tareas</div>
              {editando.tareas.map((t, i) => (
                <div key={i} className="form-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
                  <Input value={t.texto} onChange={e => setTarea(i, "texto", e.target.value)} placeholder="Qué hay que hacer" />
                  <Input value={t.responsable} onChange={e => setTarea(i, "responsable", e.target.value)} placeholder="Responsable" />
                  <Input type="date" value={t.fecha} onChange={e => setTarea(i, "fecha", e.target.value)} />
                  <button onClick={() => setEditando(e => ({ ...e, tareas: e.tareas.filter((_, j) => j !== i) }))} style={{ background: "none", border: `1.5px solid ${G.grayMid}`, cursor: "pointer", padding: 8, borderRadius: 8, display: "flex", justifyContent: "center" }}><X size={14} color={G.danger} /></button>
                </div>
              ))}
              <Button variant="outline" size="sm" icon={Plus} onClick={() => setEditando(e => ({ ...e, tareas: [...e.tareas, { texto: "", responsable: "", fecha: "", hecho: false }] }))}>Agregar tarea</Button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <Button variant="outline" size="md" onClick={() => setEditando(null)} fullWidth>Cancelar</Button>
            <Button variant="primary" size="md" onClick={guardar} fullWidth icon={Save} disabled={guardando}>{guardando ? "Guardando…" : "Guardar acta"}</Button>
          </div>
        </Modal>
      )}
      {eliminar && <ConfirmDialog message={`¿Eliminar el acta del ${fmtDate(eliminar.fecha)}? Esta acción no se puede deshacer.`} onConfirm={confirmarEliminar} onCancel={() => setEliminar(null)} />}
    </div>
  );
};

const AdolescentesView = ({ data, setData, toast, readOnly = false }) => {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [eliminar, setEliminar] = useState(null);
  const [ref, setRef] = useState(new Date(2026, 9, 1)); // Octubre 2026
  const [selDia, setSelDia] = useState(null);
  const [tab, setTab] = useState("calendario");

  const cronograma = data.cronograma || [];
  const peticiones = data.peticiones || [];
  const [peticionNueva, setPeticionNueva] = useState("");
  const [peticionPublica, setPeticionPublica] = useState(false);
  const [guardandoPeticion, setGuardandoPeticion] = useState(false);
  const blank = { fecha: today(), actividad: "", ministerio: "", responsable: "", hora: "", reflexion: "", lugar: "Templo ICV", tipo: "Enseñanza", estado: "planificado", notas: "" };

  // Unifica el temario base (TEENS_2026) con lo que el admin guarda en Supabase.
  // Las propuestas base son editables: su versión editada (mismo id fijo) reemplaza a la base.
  const baseIds = new Set(TEENS_2026.filter(a => a.propuesta || a.editableBase).map(a => teensBaseId(a.fecha, a.editableBase ? "matutino" : "")));
  const proposalIds = new Set(TEENS_2026.filter(a => a.propuesta).map(a => teensBaseId(a.fecha)));
  const norm = (a) => {
    if (a.titulo === undefined) return { fecha: a.fecha, tipo: a.tipo, titulo: a.actividad, responsable: a.responsable, ministerio: a.ministerio, hora: a.hora, reflexion: a.reflexion, lugar: a.lugar, nota: a.notas, estado: a.estado, propuesta: proposalIds.has(a.id) || (!baseIds.has(a.id) && a.estado === "planificado"), editable: true, raw: a };
    if (a.editableBase) {
      const raw = { id: teensBaseId(a.fecha, "matutino"), fecha: a.fecha, actividad: a.titulo, ministerio: a.ministerio, responsable: a.responsable, hora: a.hora, reflexion: a.reflexion, lugar: "Templo ICV", tipo: a.tipo, estado: "confirmado", notas: a.nota || "" };
      return { fecha: a.fecha, tipo: a.tipo, titulo: a.titulo, ministerio: a.ministerio, responsable: a.responsable, hora: a.hora, reflexion: a.reflexion, lugar: a.lugar || "Templo ICV", nota: a.nota, editable: true, raw };
    }
    if (!a.propuesta) return { fecha: a.fecha, tipo: a.tipo, titulo: a.titulo, responsable: a.responsable, nota: a.nota || a.dinamica, iglesia: a.iglesia, editable: false };
    const raw = { id: teensBaseId(a.fecha), fecha: a.fecha, actividad: a.titulo, responsable: a.responsable, lugar: "Templo ICV", tipo: a.tipo, estado: "planificado", notas: a.nota };
    return { fecha: a.fecha, tipo: a.tipo, titulo: a.titulo, responsable: a.responsable, nota: a.nota, estado: "planificado", propuesta: true, editable: true, raw };
  };
  const guardadas = new Set(cronograma.map(c => c.id));
  const todas = [...TEENS_2026.filter(a => !((a.propuesta || a.editableBase) && guardadas.has(teensBaseId(a.fecha, a.editableBase ? "matutino" : "")))).map(norm), ...cronograma.filter(c => c.estado !== "eliminado").map(norm)].filter(a => a.fecha);
  const matutinoId = teensBaseId("2026-10-10", "matutino");
  const matutinoGuardado = cronograma.find(a => a.id === matutinoId);
  const matutino = matutinoGuardado?.estado === "eliminado"
    ? null
    : todas.find(a => a.raw?.id === matutinoId) || norm(TEENS_2026.find(a => a.editableBase));

  const y = ref.getFullYear(), m = ref.getMonth();
  const pad = (n) => String(n).padStart(2, "0");
  const keyOf = (d) => `${y}-${pad(m + 1)}-${pad(d)}`;
  const firstDow = new Date(y, m, 1).getDay();
  const diasMes = new Date(y, m + 1, 0).getDate();
  const actsDe = (d) => todas.filter(a => a.fecha === keyOf(d)).sort((a, b) => a.tipo.localeCompare(b.tipo));
  const delMes = todas.filter(a => a.fecha.startsWith(`${y}-${pad(m + 1)}`)).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const porDia = (a, b) => a.fecha.localeCompare(b.fecha) || (b.iglesia ? 1 : 0) - (a.iglesia ? 1 : 0);
  const listaDetalle = (selDia ? todas.filter(a => a.fecha === selDia) : delMes).sort(porDia);
  const shift = (n) => { setRef(new Date(y, m + n, 1)); setSelDia(null); };

  const propuestas = todas.filter(a => a.propuesta).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const enseñanzas = TEENS_2026.filter(a => a.tipo === "Enseñanza");

  const guardar = async () => {
    if (!editando.actividad || !editando.fecha) return;
    const exists = cronograma.find(c => c.id === editando.id);
    const saved = await upsertRecord("cronograma", editando, !exists);
    if (!saved && isSupabaseConfigured()) { toast("No se pudo guardar: verifica la instalación y permisos del cronograma en Supabase.", "error"); return; }
    const final = saved || editando;
    if (exists) setData({ ...data, cronograma: cronograma.map(c => c.id === editando.id ? final : c) });
    else setData({ ...data, cronograma: [final, ...cronograma] });
    toast(exists || baseIds.has(editando.id) ? "Actividad actualizada" : "Actividad agregada");
    setModal(false); setEditando(null);
  };
  const confirmarEliminar = async () => {
    const exists = cronograma.find(c => c.id === eliminar.id);
    if (baseIds.has(eliminar.id)) {
      // Una propuesta base no se borra: se marca como eliminada para que no reaparezca.
      const marcada = { ...eliminar, estado: "eliminado" };
      const saved = await upsertRecord("cronograma", marcada, !exists);
      if (!saved && isSupabaseConfigured()) { toast("No se pudo eliminar. Revisa tu conexión o permisos.", "error"); return; }
      setData({ ...data, cronograma: exists ? cronograma.map(c => c.id === eliminar.id ? (saved || marcada) : c) : [saved || marcada, ...cronograma] });
    } else {
      if (await removeRecord("cronograma", eliminar.id) === false) { toast("No se pudo eliminar. Revisa tu conexión o permisos.", "error"); return; }
      setData({ ...data, cronograma: cronograma.filter(c => c.id !== eliminar.id) });
    }
    toast("Actividad eliminada"); setEliminar(null);
  };

  const guardarPeticion = async () => {
    const peticion = peticionNueva.trim();
    if (!peticion || guardandoPeticion) return;
    setGuardandoPeticion(true);
    const nueva = { id: newUUID(), peticion, incluir_en_post: peticionPublica };
    const saved = await upsertRecord("peticiones", nueva, true);
    if (!saved && isSupabaseConfigured()) {
      toast("No se pudo guardar. Verifica que la tabla de peticiones esté instalada y que tengas permisos.", "error");
      setGuardandoPeticion(false);
      return;
    }
    setData(d => ({ ...d, peticiones: [saved || nueva, ...(d.peticiones || [])] }));
    setPeticionNueva("");
    setPeticionPublica(false);
    setGuardandoPeticion(false);
    toast("Petición agregada");
  };

  const cambiarPublicacionPeticion = async (peticion) => {
    const actualizada = { ...peticion, incluir_en_post: !peticion.incluir_en_post };
    const saved = await upsertRecord("peticiones", actualizada, false);
    if (!saved && isSupabaseConfigured()) {
      toast("No se pudo actualizar la publicación de esta petición.", "error");
      return;
    }
    setData(d => ({ ...d, peticiones: (d.peticiones || []).map(p => p.id === peticion.id ? (saved || actualizada) : p) }));
  };

  const eliminarPeticion = async (peticion) => {
    if (await removeRecord("peticiones", peticion.id) === false) {
      toast("No se pudo eliminar la petición.", "error");
      return;
    }
    setData(d => ({ ...d, peticiones: (d.peticiones || []).filter(p => p.id !== peticion.id) }));
    toast("Petición eliminada");
  };

  const peticionesDelPost = peticiones.filter(p => p.incluir_en_post);
  const textoParaWhatsApp = [
    `🙏 ${matutino?.titulo || "Oraciones Matinales · Pasión por la Oración"}`,
    `${matutino?.fecha ? fmtDate(matutino.fecha) : "Sábado 10 de octubre de 2026"} · ${matutino?.hora || "4:30–6:00 a. m."}`,
    matutino?.ministerio || "Ministerio de Adolescentes",
    matutino?.responsable ? `Dirige: ${matutino.responsable}` : "",
    matutino?.lugar ? `Lugar: ${matutino.lugar}` : "",
    matutino?.reflexion ? `Reflexión bíblica: ${matutino.reflexion}` : "",
    peticionesDelPost.length ? `\nPeticiones de oración:\n${peticionesDelPost.map(p => `• ${p.peticion}`).join("\n")}` : "",
    "\n¡Te esperamos! Comparte esta invitación.",
  ].filter(Boolean).join("\n");

  const crearLienzoPost = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo crear la imagen del post.");
    canvas.width = 1080;
    const requestLines = [];
    ctx.font = "26px Arial";
    const wrap = (text, width) => {
      const words = text.split(/\s+/);
      const lines = [];
      let line = "";
      words.forEach(word => {
        const next = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(next).width > width) {
          lines.push(line);
          line = word;
        } else line = next;
      });
      if (line) lines.push(line);
      return lines;
    };
    peticionesDelPost.forEach(p => requestLines.push(...wrap(`• ${p.peticion}`, 850), ""));
    const requests = requestLines.length ? requestLines : ["Acompáñanos en este tiempo de oración."];
    canvas.height = 1040 + requests.length * 38;

    const background = ctx.createLinearGradient(0, 0, 1080, canvas.height);
    background.addColorStop(0, "#32104d");
    background.addColorStop(1, "#69318f");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.08;
    ctx.beginPath(); ctx.arc(970, 80, 230, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(60, canvas.height - 40, 250, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    ctx.textAlign = "center";
    ctx.fillStyle = "#e8c8ff";
    ctx.font = "bold 27px Arial";
    ctx.fillText("IGLESIA CRISTO VIENE · MINISTERIO DE ADOLESCENTES", 540, 100);
    ctx.fillStyle = "#ffffff";
    const headline = (matutino?.titulo || "Oraciones Matinales").split("·")[0].trim().toLocaleUpperCase();
    let headlineSize = 66;
    ctx.font = `bold ${headlineSize}px Arial`;
    while (ctx.measureText(headline).width > 890 && headlineSize > 36) {
      headlineSize -= 2;
      ctx.font = `bold ${headlineSize}px Arial`;
    }
    ctx.fillText(headline, 540, 250);
    ctx.fillStyle = "#f5d977";
    ctx.font = "bold 36px Arial";
    ctx.fillText("PASIÓN POR LA ORACIÓN", 540, 330);

    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.12;
    ctx.beginPath(); ctx.roundRect(115, 390, 850, 300, 28); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.font = "bold 34px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(matutino?.fecha ? fmtDate(matutino.fecha) : "Sábado 10 de octubre de 2026", 540, 445);
    ctx.font = "bold 40px Arial";
    ctx.fillText(matutino?.hora || "4:30–6:00 a. m.", 540, 505);
    ctx.font = "28px Arial";
    ctx.fillText(matutino?.ministerio || "Ministerio de Adolescentes", 540, 555);
    ctx.font = "24px Arial";
    ctx.fillText([matutino?.responsable && `Dirige: ${matutino.responsable}`, matutino?.lugar].filter(Boolean).join(" · "), 540, 605);

    let yPost = 750;
    if (matutino?.reflexion) {
      ctx.fillStyle = "#f5d977";
      ctx.font = "bold 30px Arial";
      ctx.fillText(`REFLEXIÓN BÍBLICA · ${matutino.reflexion}`, 540, yPost);
      yPost += 68;
    }
    ctx.textAlign = "left";
    ctx.fillStyle = "#f5d977";
    ctx.font = "bold 30px Arial";
    ctx.fillText("UNAMOS NUESTRAS ORACIONES", 115, yPost);
    yPost += 55;
    ctx.fillStyle = "#ffffff";
    ctx.font = "26px Arial";
    requests.forEach(line => {
      if (line) {
        ctx.fillText(line, 125, yPost);
        yPost += 38;
      } else yPost += 14;
    });
    ctx.textAlign = "center";
    ctx.fillStyle = "#e8c8ff";
    ctx.font = "24px Arial";
    ctx.fillText("¡Te esperamos! Comparte esta invitación.", 540, canvas.height - 55);
    return canvas;
  };

  const descargarPost = () => {
    try {
      const link = document.createElement("a");
      link.download = "oraciones-matinales-adolescentes.png";
      link.href = crearLienzoPost().toDataURL("image/png");
      link.click();
      toast("Post descargado como imagen");
    } catch (error) {
      console.error("Error creating matutino post:", error);
      toast("No se pudo generar el post.", "error");
    }
  };

  const compartirPost = async () => {
    try {
      const canvas = crearLienzoPost();
      if (navigator.share && navigator.canShare) {
        const blob = await new Promise((resolve, reject) => canvas.toBlob(image => image ? resolve(image) : reject(new Error("No se pudo generar la imagen.")), "image/png"));
        const file = new File([blob], "oraciones-matinales-adolescentes.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: matutino?.titulo || "Oraciones Matinales", text: textoParaWhatsApp });
          return;
        }
      }
      const link = document.createElement("a");
      link.download = "oraciones-matinales-adolescentes.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      window.open(`https://wa.me/?text=${encodeURIComponent(textoParaWhatsApp)}`, "_blank", "noopener,noreferrer");
      toast("Imagen descargada y mensaje listo para compartir por WhatsApp");
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error("Error sharing matutino post:", error);
      toast("No se pudo generar o compartir el post.", "error");
    }
  };

  const fmtFecha = (f) => { const d = new Date(f + "T12:00"); return `${d.getDate()} ${MESES_FULL[d.getMonth()].slice(0, 3)}`; };
  const diaSemana = (f) => DOW[new Date(f + "T12:00").getDay()];
  const hoyKey = today();

  const ActividadRow = (a, i, arr) => {
    const mismoDia = i > 0 && arr[i - 1].fecha === a.fecha;
    const ultimoDelDia = i === arr.length - 1 || arr[i + 1].fecha !== a.fecha;
    const sep = { borderBottom: !ultimoDelDia ? "none" : i < arr.length - 1 ? `1px solid ${G.grayMid}20` : "none" };
    if (a.iglesia) return (
      <div key={a.fecha + a.titulo + i} style={{ display: "flex", alignItems: "center", gap: 14, padding: mismoDia ? "2px 0 10px" : "10px 0 4px", ...sep }}>
        <div style={{ width: 46, textAlign: "center", flexShrink: 0, visibility: mismoDia ? "hidden" : "visible" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: G.dark, fontFamily: fontTitle, lineHeight: 1 }}>{new Date(a.fecha + "T12:00").getDate()}</div>
          <div style={{ fontSize: 10, color: G.gray, textTransform: "uppercase" }}>{diaSemana(a.fecha)}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: G.gray }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: G.gray, background: G.grayLight, padding: "2px 7px", borderRadius: 20, flexShrink: 0 }}>PLAN ICV</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>⛪ {a.titulo}</span>
        </div>
      </div>
    );
    return (
    <div key={a.raw?.id || a.fecha + a.titulo + i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: mismoDia ? "4px 0 12px" : "12px 0", ...sep }}>
      <div style={{ width: 46, textAlign: "center", flexShrink: 0, visibility: mismoDia ? "hidden" : "visible" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: teensTipoColor(a.tipo), fontFamily: fontTitle, lineHeight: 1 }}>{new Date(a.fecha + "T12:00").getDate()}</div>
        <div style={{ fontSize: 10, color: G.gray, textTransform: "uppercase" }}>{diaSemana(a.fecha)}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4, alignItems: "center" }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", background: teensTipoColor(a.tipo), padding: "2px 8px", borderRadius: 20 }}>{a.tipo}</span>
          {a.propuesta && (a.estado === "planificado"
            ? <span style={{ fontSize: 10, fontWeight: 700, color: G.accentDark, background: G.accent + "22", padding: "2px 8px", borderRadius: 20 }}>PROPUESTA</span>
            : <span style={{ fontSize: 10, fontWeight: 700, color: G.success, background: G.success + "1a", padding: "2px 8px", borderRadius: 20, textTransform: "uppercase" }}>{a.estado}</span>)}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: G.dark }}>{a.titulo}</div>
        {a.ministerio && <div style={{ fontSize: 12, color: G.gray, marginTop: 3 }}>{a.ministerio}</div>}
        {a.hora && <div style={{ fontSize: 12, color: G.gray, marginTop: 3 }}>🕓 {a.hora}</div>}
        {a.reflexion && <div style={{ fontSize: 12, color: G.gray, marginTop: 3 }}>📖 Reflexión: {a.reflexion}</div>}
        {a.responsable && <div style={{ fontSize: 12, color: G.gray, marginTop: 2 }}>👤 {a.responsable}</div>}
        {a.nota && <div style={{ fontSize: 11.5, color: G.gray, marginTop: 3, fontStyle: "italic", lineHeight: 1.4 }}>{a.nota}</div>}
      </div>
      {!readOnly && a.editable && (
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => { setEditando({ ...a.raw }); setModal(true); }} style={{ background: "none", border: `1.5px solid ${G.grayMid}`, cursor: "pointer", padding: 6, borderRadius: 7, display: "flex" }}><Edit size={14} color={G.primary} /></button>
          <button onClick={() => setEliminar(a.raw)} style={{ background: "none", border: `1.5px solid ${G.grayMid}`, cursor: "pointer", padding: 6, borderRadius: 7, display: "flex" }}><Trash2 size={14} color={G.danger} /></button>
        </div>
      )}
    </div>
  );
  };

  return (
    <div className="fadein">
      {/* Hero */}
      <Card hover={false} style={{ marginBottom: 14, padding: "16px 20px", background: `linear-gradient(135deg, ${G.primaryDark}, ${G.primary} 55%, ${G.primaryLight})`, color: "#fff" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.85 }}>Ministerio de Adolescentes · Teens</div>
            <h1 style={{ margin: "2px 0 4px", fontSize: 22, fontWeight: 800, fontFamily: fontTitle }}>Llamados a Servir</h1>
            <div style={{ fontSize: 13, opacity: 0.9 }}>ICV El Arenal Alto, San Juan de Lurigancho · Sábados 4:00–6:00 pm · Culto de Jóvenes 7:00 pm</div>
          </div>
          {!readOnly && <Button variant="ghost" size="md" icon={Plus} style={{ background: "#fff", color: G.primary }} onClick={() => { setEditando({ ...blank, id: newUUID() }); setModal(true); }}>Nueva Actividad</Button>}
        </div>
      </Card>

      {/* Stats */}
      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 16 }}>
        <StatCard label="Actividades del año" value={todas.length} icon={Calendar} color={G.primary} />
        <StatCard label="Enseñanzas" value={enseñanzas.length} icon={BookOpen} color={G.primaryLight} />
        <StatCard label="Propuestas (Oct–Dic)" value={propuestas.length} icon={Star} color={G.accent} />
      </div>

      {/* Tabs */}
      <div className="tabs-bar" style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {[["calendario", "Calendario", Calendar], ["matutino", "Matutino", Clock], ["temario", "Temario", BookOpen], ["propuestas", "Propuestas", Star], ["plan", "Plan 2027", Target], ["programa", "Reunión", Clock], ...(readOnly ? [] : [["actas", "Actas", FileText]])].map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, border: tab === id ? `2px solid ${G.primary}` : `1.5px solid ${G.grayMid}`, background: tab === id ? G.primary + "10" : "#fff", color: tab === id ? G.primary : G.gray, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── CALENDARIO ── */}
      {tab === "calendario" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)", gap: 16, alignItems: "stretch" }} className="teens-cal-grid">
          <Card hover={false}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <button onClick={() => shift(-1)} style={{ background: G.grayLight, border: "none", borderRadius: 8, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={18} color={G.primary} /></button>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>{MESES_FULL[m]} {y}</div>
              </div>
              <button onClick={() => shift(1)} style={{ background: G.grayLight, border: "none", borderRadius: 8, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={18} color={G.primary} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {DOW.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700, color: G.gray, padding: "4px 0", textTransform: "uppercase" }}>{d}</div>)}
              {Array.from({ length: firstDow }).map((_, i) => <div key={"e" + i} />)}
              {Array.from({ length: diasMes }, (_, i) => i + 1).map(d => {
                const acts = actsDe(d);
                const has = acts.length > 0;
                const k = keyOf(d);
                const sel = selDia === k;
                const esHoy = k === hoyKey;
                return (
                  <button key={d} onClick={() => has && setSelDia(sel ? null : k)} style={{
                    minHeight: 46, borderRadius: 9, border: sel ? `2px solid ${G.primary}` : esHoy ? `1.5px solid ${G.accent}` : `1px solid ${G.grayMid}30`,
                    background: has ? teensTipoColor(acts[0].tipo) + "14" : "#fff", cursor: has ? "pointer" : "default",
                    padding: "5px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontFamily: font,
                  }}>
                    <span style={{ fontSize: 12.5, fontWeight: has ? 800 : 500, color: has ? G.dark : G.gray }}>{d}</span>
                    <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                      {acts.slice(0, 3).map((a, j) => <span key={j} style={{ width: 6, height: 6, borderRadius: 99, background: teensTipoColor(a.tipo) }} />)}
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Leyenda */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16, paddingTop: 14, borderTop: `1px solid ${G.grayMid}20` }}>
              {["Enseñanza", "Evangelismo", "Adoración", "Recreación", "Taller", "Servicio", "Oración", "Iglesia"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: G.gray }}>
                  <span style={{ width: 9, height: 9, borderRadius: 99, background: teensTipoColor(t) }} /> {t}
                </div>
              ))}
            </div>
          </Card>

          {/* Detalle del mes / día */}
          <Card hover={false} className="teens-agenda" style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>{selDia ? `${fmtFecha(selDia)} · ${diaSemana(selDia)}` : `Agenda de ${MESES_FULL[m]}`}</h3>
              {selDia && <button onClick={() => setSelDia(null)} style={{ background: "none", border: "none", color: G.primary, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Ver todo el mes</button>}
            </div>
            {listaDetalle.length === 0
              ? <div style={{ padding: "24px 0", textAlign: "center", color: G.gray, fontSize: 13 }}>Sin actividades {selDia ? "este día" : "este mes"}.</div>
              : <div style={{ overflowY: "auto", flex: 1, minHeight: 0, marginRight: -8, paddingRight: 8 }}>{listaDetalle.map((a, i) => ActividadRow(a, i, listaDetalle))}</div>}
          </Card>
        </div>
      )}

      {/* ── MATUTINO Y POST ── */}
      {tab === "matutino" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, alignItems: "start" }}>
          <Card hover={false} style={{ background: "linear-gradient(135deg, #32104d, #69318f)", color: "#fff" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#e8c8ff" }}>Pasión por la Oración</div>
            <h2 style={{ margin: "8px 0 16px", fontSize: 24, fontWeight: 800, fontFamily: fontTitle }}>{matutino?.titulo || "Matutino no programado"}</h2>
            {matutino ? (
              <div style={{ display: "grid", gap: 9, fontSize: 14 }}>
                <div>📅 {fmtDate(matutino.fecha)}</div>
                <div>🕓 {matutino.hora || "Hora por definir"}</div>
                <div>🙏 {matutino.ministerio || "Ministerio de Adolescentes"}</div>
                {matutino.responsable && <div>👤 {matutino.responsable}</div>}
                {matutino.lugar && <div>📍 {matutino.lugar}</div>}
                {matutino.reflexion && <div>📖 Reflexión bíblica: {matutino.reflexion}</div>}
              </div>
            ) : (
              <div style={{ fontSize: 13 }}>La actividad fue retirada del cronograma.</div>
            )}
            {!readOnly && matutino?.raw && (
              <Button variant="ghost" size="md" icon={Edit} style={{ marginTop: 18, background: "#fff", color: G.purple }} onClick={() => { setEditando({ ...matutino.raw }); setModal(true); }}>Editar datos del matutino</Button>
            )}
            <div style={{ marginTop: 18, fontSize: 12, color: "#f0dffb", lineHeight: 1.5 }}>
              El post solo incluirá las peticiones que marques expresamente para compartir.
            </div>
          </Card>

          <Card hover={false}>
            <h3 style={{ margin: "0 0 5px", fontSize: 17, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>Peticiones de oración</h3>
            <div style={{ marginBottom: 14, fontSize: 12, color: G.gray, lineHeight: 1.5 }}>Registra motivos para orar. Se mantienen privados hasta que marques que pueden aparecer en el post.</div>
            {readOnly ? (
              <div style={{ padding: "14px 0", color: G.gray, fontSize: 13 }}>Las peticiones son privadas y solo están disponibles para el equipo de Adolescentes.</div>
            ) : (
              <>
                <TextArea label="Nueva petición" value={peticionNueva} onChange={e => setPeticionNueva(e.target.value)} placeholder="Escribe el motivo de oración..." rows={3} />
                <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0 14px", fontSize: 12, color: G.dark, cursor: "pointer" }}>
                  <input type="checkbox" checked={peticionPublica} onChange={e => setPeticionPublica(e.target.checked)} />
                  Incluir esta petición en el post para compartir
                </label>
                <Button variant="primary" size="md" icon={Plus} onClick={guardarPeticion} disabled={!peticionNueva.trim() || guardandoPeticion}>
                  {guardandoPeticion ? "Guardando…" : "Agregar petición"}
                </Button>
                <div style={{ display: "grid", gap: 9, marginTop: 18 }}>
                  {peticiones.length === 0
                    ? <div style={{ padding: "12px 0", color: G.gray, fontSize: 13 }}>Aún no hay peticiones registradas.</div>
                    : peticiones.map(p => (
                      <div key={p.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 12, border: `1px solid ${G.grayMid}70`, borderRadius: 9 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: G.dark, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{p.peticion}</div>
                          <label style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 8, fontSize: 11, color: p.incluir_en_post ? G.purple : G.gray, cursor: "pointer" }}>
                            <input type="checkbox" checked={!!p.incluir_en_post} onChange={() => cambiarPublicacionPeticion(p)} />
                            {p.incluir_en_post ? "Se compartirá en el post" : "Mantener privada"}
                          </label>
                        </div>
                        <button aria-label="Eliminar petición" onClick={() => eliminarPeticion(p)} style={{ border: 0, background: "none", color: G.danger, padding: 3, cursor: "pointer" }}><Trash2 size={15} /></button>
                      </div>
                    ))}
                </div>
              </>
            )}
          </Card>

          {!readOnly && (
            <Card hover={false} style={{ gridColumn: "1 / -1" }}>
              <h3 style={{ margin: "0 0 5px", fontSize: 17, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>Publicar y compartir</h3>
              <div style={{ marginBottom: 14, fontSize: 12, color: G.gray, lineHeight: 1.5 }}>Genera una imagen del matutino. En móviles puedes compartirla desde el menú del dispositivo; si no está disponible, se descarga el post y se abre WhatsApp con el mensaje listo.</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button variant="primary" size="md" icon={Share2} onClick={compartirPost} disabled={!matutino}>Generar post y compartir por WhatsApp</Button>
                <Button variant="outline" size="md" icon={Download} onClick={descargarPost} disabled={!matutino}>Descargar imagen PNG</Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── TEMARIO ── */}
      {tab === "temario" && (
        <div>
          <Card hover={false} style={{ marginBottom: 16, background: G.primary + "0a", borderLeft: `3px solid ${G.primary}` }}>
            <div style={{ fontSize: 13, color: G.dark, lineHeight: 1.6 }}><strong>Temario de Enseñanza 2026</strong> — cada tema incluye su dinámica. Reunión de sábados; 35 min de enseñanza bíblica.</div>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {enseñanzas.map((t, i) => (
              <Card key={i} hover>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: G.primary }}>{fmtFecha(t.fecha)} · {diaSemana(t.fecha)}</span>
                  <span style={{ fontSize: 11, color: G.gray }}>{t.responsable}</span>
                </div>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: G.dark, marginBottom: 6, fontFamily: fontTitle }}>{t.titulo}</div>
                <div style={{ fontSize: 12, color: G.gray, lineHeight: 1.5 }}><strong style={{ color: G.accentDark }}>🎲 Dinámica:</strong> {t.dinamica}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── PROPUESTAS ── */}
      {tab === "propuestas" && (
        <div>
          <Card hover={false} style={{ marginBottom: 16, background: G.accent + "0f", borderLeft: `3px solid ${G.accent}` }}>
            <div style={{ fontSize: 13, color: G.dark, lineHeight: 1.6 }}><strong>Propuestas para cerrar el 2026 (Oct–Dic)</strong> — ideas pensadas para adolescentes cristianos evangélicos: discipulado, adoración, servicio y evangelismo relacional. Puedes confirmarlas o editarlas.</div>
          </Card>
          <Card hover={false}>
            {propuestas.map((a, i) => ActividadRow(a, i, propuestas))}
          </Card>

          <h3 style={{ margin: "26px 0 4px", fontSize: 16, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>Banco de ideas para Teens</h3>
          <div style={{ fontSize: 12.5, color: G.gray, marginBottom: 14 }}>Talleres, fundays y dinámicas listas para usar.{!readOnly && " Pulsa “Programar” para asignarles un sábado."}</div>
          {Object.keys(IDEA_ICON).map(cat => (
            <div key={cat} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: G.primary, marginBottom: 10 }}>{IDEA_ICON[cat]} {cat}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                {TEENS_IDEAS.filter(i => i.categoria === cat).map(idea => (
                  <Card key={idea.titulo} hover style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ alignSelf: "flex-start", fontSize: 10.5, fontWeight: 700, color: "#fff", background: teensTipoColor(idea.tipo), padding: "2px 8px", borderRadius: 20 }}>{idea.tipo}</span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: G.dark }}>{idea.titulo}</div>
                    <div style={{ fontSize: 12, color: G.gray, lineHeight: 1.45, flex: 1 }}>{idea.nota}</div>
                    {!readOnly && <Button variant="outline" size="sm" icon={Calendar} onClick={() => { setEditando({ ...blank, id: newUUID(), fecha: "", actividad: idea.titulo, tipo: idea.tipo, responsable: "Por asignar", notas: idea.nota }); setModal(true); }}>Programar</Button>}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PLAN 2027 ── */}
      {tab === "plan" && (
        <div>
          <Card hover={false} style={{ marginBottom: 16, background: G.primary + "0a", borderLeft: `3px solid ${G.primary}` }}>
            <div style={{ fontSize: 13, color: G.dark, lineHeight: 1.6 }}><strong>Plan de enseñanza 2027</strong> — cada mes sigue el eje y el versículo del plan anual de la iglesia (“Pasión por su Obra 2026”), con temas para adolescentes y la actividad juvenil destacada del mes.{!readOnly && " Pulsa un tema para programarlo en un sábado."}</div>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {TEENS_PLAN_2027.map(p => (
              <Card key={p.mes} hover style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: G.primary, textTransform: "uppercase", letterSpacing: 1 }}>{p.mes}</span>
                  <span style={{ fontSize: 11, color: G.gray, fontStyle: "italic" }}>{p.versiculo}</span>
                </div>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>{p.eje}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {p.temas.map(t => (
                    <button key={t} disabled={readOnly} onClick={() => { setEditando({ ...blank, id: newUUID(), fecha: "", actividad: t, tipo: "Enseñanza", responsable: "Por asignar", notas: `Eje del mes “${p.eje}” · ${p.versiculo}` }); setModal(true); }}
                      style={{ textAlign: "left", background: G.grayLight, border: "none", borderRadius: 7, padding: "6px 10px", fontSize: 12.5, color: G.dark, cursor: readOnly ? "default" : "pointer", fontFamily: font }}>
                      📖 {t}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: G.accentDark, marginTop: 2 }}><strong>⭐ Destacado:</strong> {p.destacado}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── ACTAS ── */}
      {tab === "actas" && !readOnly && <ActasAdolescentes data={data} setData={setData} toast={toast} />}

      {/* ── PROGRAMA DE REUNIÓN ── */}
      {tab === "programa" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <Card hover={false}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}><Clock size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "-2px" }} />Programa de la reunión (Sábados)</h3>
            {PROGRAMA_REUNION.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: 99, background: G.primary + "12", color: G.primary, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 13, color: G.dark }}>{p}</div>
              </div>
            ))}
          </Card>
          <Card hover={false}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}><Check size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "-2px" }} />Preparación del maestro</h3>
            {["Orar por la enseñanza", "Leer el pasaje bíblico", "Preparar ejemplos prácticos", "Definir versículo principal y 3 ideas clave", "Aplicación para adolescentes", "Preparar la dinámica final"].map((p, i) => (
              <div key={i} style={{ fontSize: 12.5, color: G.dark, marginBottom: 8, paddingLeft: 16, position: "relative", lineHeight: 1.45 }}><Check size={12} color={G.success} style={{ position: "absolute", left: 0, top: 3 }} />{p}</div>
            ))}
          </Card>
        </div>
      )}

      {/* Modal CRUD */}
      {!readOnly && modal && editando && (
        <Modal title={cronograma.find(c => c.id === editando.id) || baseIds.has(editando.id) ? "Editar Actividad" : "Nueva Actividad"} onClose={() => { setModal(false); setEditando(null); }} width={600}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Actividad" value={editando.actividad} onChange={e => setEditando({ ...editando, actividad: e.target.value })} required />
            <Input label="Ministerio" value={editando.ministerio || ""} onChange={e => setEditando({ ...editando, ministerio: e.target.value })} />
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Fecha" value={editando.fecha} onChange={e => setEditando({ ...editando, fecha: e.target.value })} type="date" required />
              <Input label="Responsable" value={editando.responsable} onChange={e => setEditando({ ...editando, responsable: e.target.value })} />
            </div>
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Select label="Tipo" value={editando.tipo} onChange={e => setEditando({ ...editando, tipo: e.target.value })} options={TEENS_TIPOS} />
              <Input label="Hora" value={editando.hora || ""} onChange={e => setEditando({ ...editando, hora: e.target.value })} placeholder="4:30–6:00 a. m." />
            </div>
            <Input label="Lugar" value={editando.lugar || ""} onChange={e => setEditando({ ...editando, lugar: e.target.value })} />
            <Input label="Reflexión bíblica" value={editando.reflexion || ""} onChange={e => setEditando({ ...editando, reflexion: e.target.value })} placeholder="Pasaje bíblico" />
            <Select label="Estado" value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} options={["planificado", "confirmado", "realizado"]} />
            <TextArea label="Notas" value={editando.notas} onChange={e => setEditando({ ...editando, notas: e.target.value })} rows={3} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Button variant="outline" size="md" onClick={() => { setModal(false); setEditando(null); }} fullWidth>Cancelar</Button>
            <Button variant="primary" size="md" onClick={guardar} fullWidth icon={Save}>Guardar</Button>
          </div>
        </Modal>
      )}
      {eliminar && <ConfirmDialog message={`¿Eliminar "${eliminar.actividad}" del cronograma?`} onConfirm={confirmarEliminar} onCancel={() => setEliminar(null)} />}
    </div>
  );
};

// ─── EVANGELISMO Y MISIONES — PLAN ESTRATÉGICO ──────────────────────
const EvangelismoView = () => {
  const P = PLAN_EM;
  const SectionTitle = ({ icon: Icon, children, sub }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 14px" }}>
      {Icon && <div style={{ width: 34, height: 34, borderRadius: 9, background: G.primary + "12", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={18} color={G.primary} /></div>}
      <div>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>{children}</h2>
        {sub && <div style={{ fontSize: 12, color: G.gray }}>{sub}</div>}
      </div>
    </div>
  );
  const fodaBox = (titulo, items, color) => (
    <Card hover={false} style={{ borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 13, fontWeight: 800, color, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{titulo}</div>
      {items.map((it, i) => <div key={i} style={{ fontSize: 12.5, color: G.dark, marginBottom: 7, paddingLeft: 14, position: "relative", lineHeight: 1.45 }}><span style={{ position: "absolute", left: 0, color }}>•</span>{it}</div>)}
    </Card>
  );

  return (
    <div className="fadein">

      {/* Encabezado del plan */}
      <Card hover={false} style={{ marginBottom: 20, background: `linear-gradient(135deg, ${G.primary}, ${G.primaryLight})`, color: "#fff" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, opacity: 0.85, marginBottom: 6 }}>{P.meta.eje}</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, fontFamily: fontTitle }}>{P.meta.ministerio}</h2>
            <div style={{ fontSize: 13, opacity: 0.92 }}>{P.meta.iglesia}</div>
          </div>
          <div style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.7, minWidth: 220 }}>
            <div><strong>Autor:</strong> {P.meta.autor}</div>
            <div><strong>Cobertura:</strong> {P.meta.cobertura}</div>
            <div>{P.meta.curso}</div>
            <div>{P.meta.fecha}</div>
          </div>
        </div>
      </Card>

      {/* Visión */}
      <SectionTitle icon={Target}>Visión a 3 años</SectionTitle>
      <Card hover={false}><p style={{ margin: 0, fontSize: 14, color: G.dark, lineHeight: 1.6, fontStyle: "italic" }}>“{P.vision}”</p></Card>

      {/* Convicciones */}
      <SectionTitle icon={BookOpen}>Convicciones bíblicas</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {P.convicciones.map((c, i) => (
          <Card key={i} hover>
            <p style={{ margin: "0 0 10px", fontSize: 13.5, color: G.dark, lineHeight: 1.5 }}>{c.texto}</p>
            <Badge variant="primary">{c.cita}</Badge>
          </Card>
        ))}
      </div>

      {/* Objetivos */}
      <SectionTitle icon={TrendingUp} sub="Metas a corto (1 año) y largo plazo (3 años)">Objetivos</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="split-grid">
        <Card hover={false}>
          <div style={{ fontSize: 12, fontWeight: 700, color: G.success, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Corto plazo · 1 año</div>
          {P.objetivosCorto.map((o, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: G.primary, fontFamily: fontTitle, minWidth: 44 }}>{o.n}</div>
              <div style={{ fontSize: 12.5, color: G.dark, lineHeight: 1.4 }}>{o.t}</div>
            </div>
          ))}
        </Card>
        <Card hover={false}>
          <div style={{ fontSize: 12, fontWeight: 700, color: G.accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Largo plazo · 3 años</div>
          {P.objetivosLargo.map((o, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: G.accent, fontFamily: fontTitle, minWidth: 44 }}>{o.n}</div>
              <div style={{ fontSize: 12.5, color: G.dark, lineHeight: 1.4 }}>{o.t}</div>
            </div>
          ))}
        </Card>
      </div>

      {/* FODA */}
      <SectionTitle icon={BarChart2}>Análisis FODA</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {fodaBox("Fortalezas", P.foda.fortalezas, G.success)}
        {fodaBox("Oportunidades", P.foda.oportunidades, G.primary)}
        {fodaBox("Debilidades", P.foda.debilidades, G.warning)}
        {fodaBox("Amenazas", P.foda.amenazas, G.danger)}
      </div>

      {/* Problemas y soluciones */}
      <SectionTitle icon={AlertCircle}>Problemas y soluciones</SectionTitle>
      <Card hover={false}>
        {P.problemas.map((p, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: i < P.problemas.length - 1 ? `1px solid ${G.grayMid}20` : "none" }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: G.danger, marginBottom: 4 }}>⚠ {p.problema}</div>
            <div style={{ fontSize: 12, color: G.gray, marginBottom: 4 }}><strong>Causa:</strong> {p.causa}</div>
            <div style={{ fontSize: 12.5, color: G.success }}><strong>✓ Solución:</strong> {p.solucion}</div>
          </div>
        ))}
      </Card>

      {/* Villa Rica / Yánesha */}
      <SectionTitle icon={MapPin} sub={P.villaRica.ubicacion}>{P.villaRica.titulo}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 14 }}>
        {P.villaRica.stats.map((s, i) => (
          <Card key={i} hover>
            <div style={{ fontSize: 28, fontWeight: 800, color: G.accent, fontFamily: fontTitle }}>{s.n}</div>
            <div style={{ fontSize: 12.5, color: G.dark, fontWeight: 600, margin: "4px 0 4px" }}>{s.t}</div>
            <div style={{ fontSize: 11, color: G.gray, lineHeight: 1.4 }}>{s.sub}</div>
          </Card>
        ))}
      </div>
      <Card hover={false} style={{ background: G.accent + "0d", borderLeft: `3px solid ${G.accent}` }}>
        <div style={{ fontSize: 12.5, color: G.dark, lineHeight: 1.6 }}><strong>Estrategia:</strong> {P.villaRica.estrategia}</div>
      </Card>

      {/* Roles */}
      <SectionTitle icon={Users} sub="Equipo del ministerio">Roles y responsabilidades</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {P.roles.map((r, i) => (
          <Card key={i} hover>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: G.primary, marginBottom: 3, fontFamily: fontTitle }}>{r.rol}</div>
            <div style={{ fontSize: 12, color: G.gray, marginBottom: 10 }}>{r.desc}</div>
            {r.detalle.map((d, j) => <div key={j} style={{ fontSize: 12, color: G.dark, marginBottom: 5, paddingLeft: 14, position: "relative", lineHeight: 1.4 }}><Check size={11} color={G.success} style={{ position: "absolute", left: 0, top: 3 }} />{d}</div>)}
          </Card>
        ))}
      </div>

      {/* Línea base / indicadores */}
      <SectionTitle icon={Activity} sub="Situación actual vs. metas">Línea base e indicadores</SectionTitle>
      <Card hover={false} style={{ overflowX: "auto", padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 560 }}>
          <thead>
            <tr style={{ background: G.grayLight }}>
              {["Indicador", "Hoy", "Año 1", "Año 3", "Responsable"].map((h, i) => (
                <th key={i} style={{ textAlign: i === 0 ? "left" : "center", padding: "11px 14px", fontWeight: 700, color: G.gray, fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {P.lineaBase.map((r, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${G.grayMid}20` }}>
                <td style={{ padding: "11px 14px", fontWeight: 600, color: G.dark }}>{r.ind}</td>
                <td style={{ padding: "11px 14px", textAlign: "center", color: G.gray }}>{r.hoy}</td>
                <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: G.primary }}>{r.a1}</td>
                <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: G.accent }}>{r.a3}</td>
                <td style={{ padding: "11px 14px", textAlign: "center", color: G.gray, fontSize: 11.5 }}>{r.resp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Cronograma */}
      <SectionTitle icon={Calendar}>Cronograma anual</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {P.cronograma.map((g, i) => (
          <Card key={i} hover={false} style={{ borderTop: `3px solid ${g.color}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: g.color, marginBottom: 10 }}>{g.grupo}</div>
            {g.items.map((it, j) => <div key={j} style={{ fontSize: 12.5, color: G.dark, marginBottom: 7, paddingLeft: 14, position: "relative", lineHeight: 1.45 }}><span style={{ position: "absolute", left: 0, color: g.color }}>▸</span>{it}</div>)}
          </Card>
        ))}
      </div>

      {/* Evaluación */}
      <SectionTitle icon={Check}>Seguimiento y evaluación</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 14 }}>
        {P.evaluacion.ritmos.map((r, i) => (
          <Card key={i} hover>
            <Badge variant="primary">{r.t}</Badge>
            <p style={{ margin: "10px 0 0", fontSize: 12.5, color: G.dark, lineHeight: 1.5 }}>{r.d}</p>
          </Card>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="split-grid">
        <Card hover={false}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: G.dark, marginBottom: 10 }}>¿Quién evalúa?</div>
          {P.evaluacion.quien.map((q, i) => <div key={i} style={{ fontSize: 12, color: G.dark, marginBottom: 6, paddingLeft: 14, position: "relative", lineHeight: 1.4 }}><span style={{ position: "absolute", left: 0, color: G.primary }}>•</span>{q}</div>)}
        </Card>
        <Card hover={false}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: G.dark, marginBottom: 10 }}>Instrumentos</div>
          {P.evaluacion.instrumentos.map((q, i) => <div key={i} style={{ fontSize: 12, color: G.dark, marginBottom: 6, paddingLeft: 14, position: "relative", lineHeight: 1.4 }}><span style={{ position: "absolute", left: 0, color: G.accent }}>•</span>{q}</div>)}
        </Card>
      </div>
    </div>
  );
};

// ─── CONFIGURACIÓN ──────────────────────────────────────────────────
const ConfiguracionView = ({ config, setConfig, toast, currentUserId }) => {
  const [tab, setTab] = useState("general");
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(null);
  const guardar = () => toast("Configuración guardada correctamente");

  useEffect(() => {
    if (tab !== "usuarios") return;
    setLoadingUsers(true);
    getUsers().then(data => { setUsuarios(data); setLoadingUsers(false); });
  }, [tab]);

  const handleRoleChange = async (userId, newRol) => {
    if (userId === currentUserId) { toast("No puedes cambiar tu propio rol", "error"); return; }
    setUpdatingRole(userId);
    const ok = await updateUserRole(userId, newRol);
    if (ok) {
      setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, rol: newRol } : u));
      toast(`Rol actualizado a "${rolLabel(newRol)}"`);
    } else {
      toast("Error al actualizar el rol", "error");
    }
    setUpdatingRole(null);
  };

  return (
    <div className="fadein">
      <PageHeader title="Configuración" subtitle="Administra la plataforma y datos de la iglesia" />
      <TabBar tabs={[
        { id: "general", label: "General", icon: Globe },
        { id: "redes", label: "Redes Sociales", icon: Share2 },
        { id: "usuarios", label: "Usuarios", icon: Users },
      ]} active={tab} onChange={setTab} />
      <Card hover={false}>
        {tab === "general" && (
          <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Nombre de la Iglesia" value={config.nombre} onChange={e => setConfig({ ...config, nombre: e.target.value })} />
            <Input label="Abreviatura" value={config.abreviatura} onChange={e => setConfig({ ...config, abreviatura: e.target.value })} />
            <div style={{ gridColumn: "1/-1" }}><Input label="Lema" value={config.lema} onChange={e => setConfig({ ...config, lema: e.target.value })} /></div>
            <div style={{ gridColumn: "1/-1" }}><Input label="Dirección" value={config.direccion} onChange={e => setConfig({ ...config, direccion: e.target.value })} icon={MapPin} /></div>
            <Input label="Teléfono" value={config.telefono} onChange={e => setConfig({ ...config, telefono: e.target.value })} icon={Phone} />
            <Input label="Email" value={config.email} onChange={e => setConfig({ ...config, email: e.target.value })} icon={Mail} />
            <Input label="Pastor Principal" value={config.pastor} onChange={e => setConfig({ ...config, pastor: e.target.value })} />
            <Input label="Año de Fundación" value={config.fundacion} onChange={e => setConfig({ ...config, fundacion: Number(e.target.value) })} type="number" />
          </div>
        )}
        {tab === "redes" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Facebook" value={config.facebook} onChange={e => setConfig({ ...config, facebook: e.target.value })} icon={Facebook} />
            <Input label="YouTube" value={config.youtube} onChange={e => setConfig({ ...config, youtube: e.target.value })} icon={Youtube} />
            <Input label="Instagram" value={config.instagram} onChange={e => setConfig({ ...config, instagram: e.target.value })} icon={Instagram} />
          </div>
        )}
        {tab === "usuarios" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: fontTitle, color: G.dark }}>Usuarios del Sistema</h3>
              <Badge variant="default">{usuarios.length} registrados</Badge>
            </div>
            {loadingUsers ? (
              <div style={{ textAlign: "center", padding: 32, color: G.gray }}>Cargando usuarios...</div>
            ) : usuarios.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32, color: G.gray, fontSize: 13.5 }}>No hay usuarios registrados aún</div>
            ) : usuarios.map(u => {
              const isCurrentUser = u.id === currentUserId;
              const isAdminUser = u.rol === "admin";
              return (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: isCurrentUser ? `${G.primary}08` : G.grayLight, borderRadius: 11, marginBottom: 10, border: isCurrentUser ? `1.5px solid ${G.primary}30` : "1.5px solid transparent" }}>
                  <Avatar initials={(u.nombre || "U").slice(0, 2).toUpperCase()} size={40} color={isAdminUser ? G.primary : G.gray} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: G.dark, display: "flex", alignItems: "center", gap: 6 }}>
                      {u.nombre}
                      {isCurrentUser && <Badge variant="default" size="sm">Tú</Badge>}
                    </div>
                    <div style={{ fontSize: 12, color: G.gray, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email || "Sin email registrado"}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <Badge variant={isAdminUser ? "success" : u.rol === "teens" ? "primary" : "default"}>{rolLabel(u.rol)}</Badge>
                    {/* Hay un solo Super Administrador: su rol no se edita y no se puede asignar a otros */}
                    {!isCurrentUser && !isAdminUser && (
                      <select
                        value={u.rol}
                        disabled={updatingRole === u.id}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        style={{ fontSize: 12, padding: "4px 8px", borderRadius: 7, border: `1.5px solid ${G.grayMid}`, background: "#fff", color: G.dark, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        <option value="usuario">{ROLES.usuario}</option>
                        <option value="teens">{ROLES.teens}</option>
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {tab !== "usuarios" && (
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${G.grayMid}40`, display: "flex", justifyContent: "flex-end" }}>
            <Button variant="primary" size="md" onClick={guardar} icon={Save}>Guardar Cambios</Button>
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── REGISTER ───────────────────────────────────────────────────────
const Register = ({ onSuccess, onBack }) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    setError("");
    if (!nombre || !email || !password || !confirm) { setError("Completa todos los campos"); return; }
    if (password !== confirm) { setError("Las contraseñas no coinciden"); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
    setLoading(true);
    const result = await signUp(email, password, nombre);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    if (result.needsConfirmation) { setSuccess(true); } else { onSuccess(); }
  };

  return (
    <div className="login-split" style={{ minHeight: "100vh", display: "flex", fontFamily: font }}>
      <GlobalStyles />
      <div className="login-left" style={{ flex: "0 0 44%", background: `linear-gradient(150deg, ${G.primaryDark}, ${G.primary} 60%, ${G.primaryLight})`, display: "flex", alignItems: "center", justifyContent: "center", padding: 48, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div style={{ position: "relative", color: "#fff", textAlign: "center", maxWidth: 360 }} className="fadeup">
          <div style={{ width: 72, height: 72, borderRadius: 18, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontFamily: fontTitle, fontWeight: 900, fontSize: 40 }}>L</div>
          <h1 style={{ margin: "0 0 14px", fontSize: 28, fontWeight: 700, fontFamily: fontTitle }}>Únete a la comunidad</h1>
          <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7 }}>Crea tu cuenta para acceder a tu perfil, eventos y publicaciones de la iglesia.</p>
        </div>
      </div>
      <div className="login-right" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40, background: G.bg }}>
        <div style={{ width: "100%", maxWidth: 400 }} className="fadeup">
          <button onClick={onBack} style={{ background: "none", border: "none", color: G.gray, fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 36, display: "flex", alignItems: "center", gap: 6, fontFamily: font }}>
            <ChevronLeft size={16} /> Volver al inicio de sesión
          </button>
          <div style={{ background: "#fff", padding: 36, borderRadius: 18, border: `1px solid ${G.grayMid}40`, boxShadow: `0 8px 32px ${G.primary}08` }}>
            {success ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: G.successLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Check size={28} color={G.success} />
                </div>
                <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>¡Cuenta creada!</h2>
                <p style={{ margin: "0 0 24px", color: G.gray, fontSize: 13.5, lineHeight: 1.6 }}>Revisa tu correo electrónico y confirma tu cuenta para poder iniciar sesión.</p>
                <Button variant="primary" size="md" onClick={onBack} fullWidth>Ir a Iniciar Sesión</Button>
              </div>
            ) : (
              <>
                <h2 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>Crear Cuenta</h2>
                <p style={{ margin: "0 0 28px", color: G.gray, fontSize: 13.5 }}>Completa el formulario para registrarte</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <Input label="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" icon={UserPlus} required />
                  <Input label="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" type="email" icon={Mail} required />
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <label style={{ fontSize: 12.5, color: G.dark, fontWeight: 600, fontFamily: font }}>Contraseña <span style={{ color: G.danger }}>*</span></label>
                    <div style={{ position: "relative" }}>
                      <Lock size={14} color={G.gray} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" style={{ width: "100%", padding: "10px 40px 10px 36px", borderRadius: 10, border: `1.5px solid ${G.grayMid}`, fontSize: 13.5, outline: "none", fontFamily: font, boxSizing: "border-box" }} />
                      <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                        {showPass ? <EyeOff size={16} color={G.gray} /> : <Eye size={16} color={G.gray} />}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <label style={{ fontSize: 12.5, color: G.dark, fontWeight: 600, fontFamily: font }}>Confirmar contraseña <span style={{ color: G.danger }}>*</span></label>
                    <div style={{ position: "relative" }}>
                      <Lock size={14} color={G.gray} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input type={showPass ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repite la contraseña" onKeyDown={e => e.key === "Enter" && handleRegister()} style={{ width: "100%", padding: "10px 36px", borderRadius: 10, border: `1.5px solid ${G.grayMid}`, fontSize: 13.5, outline: "none", fontFamily: font, boxSizing: "border-box" }} />
                    </div>
                  </div>
                  {error && <div style={{ background: G.dangerLight, border: `1px solid ${G.danger}20`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: G.danger, fontWeight: 500 }}>{error}</div>}
                  <Button variant="primary" size="lg" onClick={handleRegister} disabled={loading} fullWidth>
                    {loading ? "Creando cuenta…" : "Crear Cuenta"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PORTAL USUARIO (vista restringida) ─────────────────────────────
const PortalUsuario = ({ userProfile, data }) => {
  const miembro = data.miembros?.find(m => m.email?.toLowerCase() === userProfile?.email?.toLowerCase());
  const proximosEventos = data.eventos
    ?.filter(e => e.fecha >= today())
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 3);

  return (
    <div className="fadein">
      <PageHeader
        title={`Bienvenido, ${userProfile?.nombre?.split(" ")[0] || "Usuario"}`}
        subtitle="Tu espacio personal en la plataforma"
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 28 }}>
        {/* Perfil */}
        <Card hover={false}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
            <Avatar initials={(userProfile?.nombre || "U").slice(0, 2).toUpperCase()} size={56} color={G.primary} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, color: G.dark, fontFamily: fontTitle }}>{userProfile?.nombre}</div>
              <div style={{ fontSize: 12.5, color: G.gray, marginTop: 2 }}>{userProfile?.email}</div>
              <Badge variant="default" style={{ marginTop: 6 }}>{miembro?.rol || "Miembro"}</Badge>
            </div>
          </div>
          {miembro ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {miembro.telefono && <div style={{ display: "flex", gap: 8, fontSize: 13, color: G.gray, alignItems: "center" }}><Phone size={13} />{miembro.telefono}</div>}
              {miembro.desde && <div style={{ display: "flex", gap: 8, fontSize: 13, color: G.gray, alignItems: "center" }}><Calendar size={13} />Miembro desde {miembro.desde}</div>}
              {miembro.celula && <div style={{ display: "flex", gap: 8, fontSize: 13, color: G.gray, alignItems: "center" }}><Home size={13} />Célula: {miembro.celula}</div>}
              <div style={{ marginTop: 4 }}>
                <Badge variant={miembro.estado === "Activo" ? "success" : "warning"}>{miembro.estado}</Badge>
                {miembro.bautizado && <Badge variant="default" style={{ marginLeft: 6 }}>Bautizado</Badge>}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0", color: G.gray, fontSize: 13, lineHeight: 1.6 }}>
              Tu perfil aún no está vinculado a un registro de miembro.<br />
              Contacta al administrador para vincularlo.
            </div>
          )}
        </Card>

        {/* Próximos eventos */}
        <Card hover={false}>
          <div style={{ fontWeight: 700, fontSize: 15, color: G.dark, marginBottom: 16, fontFamily: fontTitle }}>Próximos Eventos</div>
          {proximosEventos?.length > 0 ? proximosEventos.map(e => (
            <div key={e.id} style={{ display: "flex", gap: 14, marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${G.grayMid}20` }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `linear-gradient(135deg, ${G.primary}, ${G.primaryLight})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>{new Date(e.fecha + "T12:00").getDate()}</div>
                <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase" }}>{monthName(new Date(e.fecha + "T12:00").getMonth())}</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: G.dark }}>{e.nombre}</div>
                <div style={{ fontSize: 12, color: G.gray }}>{e.hora} · {e.lugar}</div>
              </div>
            </div>
          )) : (
            <div style={{ color: G.gray, fontSize: 13, textAlign: "center", padding: 24 }}>No hay eventos próximos</div>
          )}
        </Card>
      </div>

      {/* Publicaciones recientes */}
      <div style={{ fontWeight: 700, fontSize: 16, color: G.dark, marginBottom: 16, fontFamily: fontTitle }}>Publicaciones Recientes</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {data.publicaciones?.filter(p => p.estado === "publicado").slice(0, 3).map(pub => (
          <Card key={pub.id} hover>
            <div style={{ fontSize: 36, marginBottom: 10 }}>{pub.imagen}</div>
            <Badge variant="default">{pub.categoria}</Badge>
            <h3 style={{ margin: "8px 0 6px", fontSize: 14.5, fontWeight: 700, color: G.dark, fontFamily: fontTitle }}>{pub.titulo}</h3>
            <p style={{ margin: 0, fontSize: 12.5, color: G.gray, lineHeight: 1.5 }}>{pub.extracto?.slice(0, 90)}…</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ─── DASHBOARD PRINCIPAL ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
const Dashboard = ({ onLogout, userProfile, seccion }) => {
  const isAdmin = userProfile?.rol === "admin";
  const isTeens = userProfile?.rol === "teens"; // Miembro con acceso de edición al ministerio de Adolescentes
  // Recordar la sección abierta para volver a ella al recargar
  const [collapsed, setCollapsed] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [config, setConfig] = useState(CHURCH_DEFAULT);
  const [data, setData] = useState({
    miembros: initMiembros,
    donaciones: initDonaciones,
    proyectos: initProyectos,
    eventos: initEventos,
    asistencia: initAsistencia,
    celulas: initCelulas,
    ministerios: initMinisterios,
    productos: initProductos,
    publicaciones: initPublicaciones,
    gastos: initGastos,
    cronograma: initCronograma,
    actas: [],
    peticiones: [],
  });

  const [dbLoading, setDbLoading] = useState(false);

  // Load data from Supabase if configured, otherwise use mock data
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    setDbLoading(true);
    loadAllData().then(remoteData => {
      if (remoteData) {
        const merged = { ...data };
        Object.keys(remoteData).forEach(key => {
          if (remoteData[key] && remoteData[key].length > 0) merged[key] = remoteData[key];
        });
        setData(merged);
      }
      setDbLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = useCallback((msg, type = "success") => { setToastMsg({ msg, type }); }, []);

  const menuItems = isAdmin ? [
    { id: "dashboard", label: "Dashboard", icon: BarChart2 },
    { id: "miembros", label: "Miembros", icon: Users },
    { id: "finanzas", label: "Finanzas", icon: DollarSign },
    { id: "proyectos", label: "Proyectos", icon: Target },
    { id: "eventos", label: "Eventos", icon: Calendar },
    { id: "asistencia", label: "Asistencia", icon: Activity },
    { id: "celulas", label: "Células", icon: Home },
    { id: "ministerios", label: "Ministerios", icon: Layers },
    { id: "adolescentes", label: "Adolescentes", icon: Star },
    { id: "evangelismo", label: "Evangelismo y Misiones", icon: Globe },
    { id: "tienda", label: "Tienda", icon: ShoppingCart },
    { id: "blog", label: "Blog", icon: FileText },
    { id: "configuracion", label: "Configuración", icon: Settings },
  ] : isTeens ? [
    { id: "adolescentes", label: "Adolescentes", icon: Star },
  ] : [
    { id: "mi-perfil", label: "Mi Perfil", icon: UserCheck },
    { id: "eventos", label: "Eventos", icon: Calendar },
    { id: "adolescentes", label: "Adolescentes", icon: Star },
    { id: "evangelismo", label: "Evangelismo y Misiones", icon: Globe },
    { id: "blog", label: "Blog", icon: FileText },
  ];

  const views = {
    "mi-perfil": <PortalUsuario userProfile={userProfile} data={data} />,
    dashboard: <DashboardView data={data} />,
    miembros: <MiembrosView data={data} setData={setData} toast={showToast} />,
    finanzas: <FinanzasView data={data} setData={setData} toast={showToast} />,
    proyectos: <ProyectosView data={data} setData={setData} toast={showToast} />,
    eventos: <EventosView data={data} setData={setData} toast={showToast} readOnly={!isAdmin} />,
    asistencia: <AsistenciaView data={data} setData={setData} toast={showToast} />,
    celulas: <CelulasView data={data} setData={setData} toast={showToast} />,
    ministerios: <MinisteriosView data={data} setData={setData} toast={showToast} />,
    adolescentes: <AdolescentesView data={data} setData={setData} toast={showToast} readOnly={!isAdmin && !isTeens} />,
    evangelismo: <EvangelismoView />,
    tienda: <TiendaView data={data} setData={setData} toast={showToast} />,
    blog: <BlogView data={data} setData={setData} toast={showToast} readOnly={!isAdmin} />,
    configuracion: <ConfiguracionView config={config} setConfig={setConfig} toast={showToast} currentUserId={userProfile?.id} />,
  };
  // Nunca mostrar una sección que el rol no tiene en su menú (p. ej. una guardada de otra sesión)
  const seccionVisible = menuItems.some(m => m.id === seccion) ? seccion : menuItems[0].id;
  // /panel o una sección sin permiso → se corrige la URL a la sección real
  useEffect(() => { if (seccion !== seccionVisible) navegar(`/panel/${seccionVisible}`, { reemplazar: true }); }, [seccion, seccionVisible]);
  useEffect(() => { document.title = `${menuItems.find(m => m.id === seccionVisible)?.label} · LADP Admin`; }, [seccionVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="dashboard-layout" style={{ display: "flex", height: "100vh", fontFamily: font, background: G.bg }}>
      <GlobalStyles />
      {toastMsg && <Toast message={toastMsg.msg} type={toastMsg.type} onClose={() => setToastMsg(null)} />}

      {/* Sidebar */}
      <div className="dashboard-sidebar" style={{ width: collapsed ? 68 : 248, background: "#fff", borderRight: `1px solid ${G.grayMid}40`, display: "flex", flexDirection: "column", transition: "width 0.3s cubic-bezier(.4,0,.2,1)", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ padding: collapsed ? "18px 14px" : "18px 20px", borderBottom: `1px solid ${G.grayMid}40`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg, ${G.primary}, ${G.primaryLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 18, flexShrink: 0, fontFamily: fontTitle }}>L</div>
          {!collapsed && <span className="sidebar-label" style={{ fontSize: 15, fontWeight: 800, color: G.dark, fontFamily: fontTitle, whiteSpace: "nowrap" }}>LADP Admin</span>}
        </div>
        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", overflowX: "hidden" }}>
          {menuItems.map(item => (
            <a key={item.id} href={`/panel/${item.id}`} onClick={alClicLink(`/panel/${item.id}`)} className={`sidebar-item ${seccionVisible === item.id ? "active" : ""}`} style={{ justifyContent: collapsed ? "center" : "flex-start", marginBottom: 1, textDecoration: "none" }}>
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span className="sidebar-label" style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom" style={{ padding: "10px 8px", borderTop: `1px solid ${G.grayMid}40` }}>
          <button onClick={onLogout} className="sidebar-item" style={{ justifyContent: collapsed ? "center" : "flex-start", marginBottom: 2 }}>
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span className="sidebar-label">Cerrar Sesión</span>}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="sidebar-item" style={{ justifyContent: collapsed ? "center" : "flex-start" }}>
            <Menu size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span className="sidebar-label">Colapsar</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <header className="dashboard-header" style={{ background: "#fff", borderBottom: `1px solid ${G.grayMid}40`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
          <div className="search-box" style={{ flex: 1, maxWidth: 360 }}>
            <Input placeholder="Buscar en la plataforma..." icon={Search} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button style={{ position: "relative", background: G.grayLight, border: "none", cursor: "pointer", padding: 9, borderRadius: 9 }}>
              <Bell size={17} color={G.gray} />
              <div style={{ position: "absolute", top: 7, right: 7, width: 6, height: 6, borderRadius: "50%", background: G.danger }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 12px", background: G.grayLight, borderRadius: 10 }}>
              <Avatar initials={(userProfile?.nombre || "U").slice(0, 2).toUpperCase()} size={28} color={G.primary} />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: G.dark, lineHeight: 1.2 }}>{userProfile?.nombre || "Usuario"}</div>
                <div style={{ fontSize: 10.5, color: G.gray }}>{rolLabel(userProfile?.rol)}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="dashboard-main" style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {views[seccionVisible]}
        </main>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ─── TIENDA PAGE — Full E-Commerce ─────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
const SHOP_PRODUCTS = [
  { id: "sp1", titulo: "Fundamentos de la Fe", autor: "Dr. Jorge Ramírez", precio: 45, precioAntes: 55, imagen: "📖", categoria: "Doctrina", descripcion: "Estudio profundo de las doctrinas fundamentales pentecostales. Cubre los 16 puntos cardinales de la fe pentecostal con aplicaciones prácticas para la vida diaria.", rating: 4.8, reviews: 124, stock: 50, editorial: "LADP Publishing", paginas: 320, isbn: "978-612-001-001" },
  { id: "sp2", titulo: "Avivamiento en el Perú", autor: "Pastor Juan Ríos", precio: 38, precioAntes: 0, imagen: "🔥", categoria: "Historia", descripcion: "Recorrido histórico de 106 años del movimiento pentecostal en Perú, desde los misioneros Barker hasta la iglesia contemporánea.", rating: 4.9, reviews: 89, stock: 30, editorial: "Editorial Cristiana", paginas: 280, isbn: "978-612-001-002" },
  { id: "sp3", titulo: "Liderazgo Cristiano", autor: "Dra. María González", precio: 52, precioAntes: 65, imagen: "👥", categoria: "Liderazgo", descripcion: "Principios bíblicos para líderes de iglesia con casos prácticos y estudios de liderazgo transformacional basado en las Escrituras.", rating: 4.7, reviews: 156, stock: 40, editorial: "LADP Publishing", paginas: 256, isbn: "978-612-001-003" },
  { id: "sp4", titulo: "Devocional Diario 2025", autor: "Varios Autores", precio: 28, precioAntes: 0, imagen: "🙏", categoria: "Devocional", descripcion: "365 reflexiones espirituales para cada día del año con lecturas bíblicas, oraciones guiadas y aplicaciones prácticas.", rating: 4.9, reviews: 312, stock: 100, editorial: "Librería LADP", paginas: 400, isbn: "978-612-001-004", featured: true },
  { id: "sp5", titulo: "Teología Pentecostal", autor: "Rev. Carlos Méndez", precio: 65, precioAntes: 80, imagen: "✝️", categoria: "Teología", descripcion: "Introducción académica a la teología pentecostal latinoamericana con perspectiva bíblica y contextual.", rating: 4.6, reviews: 67, stock: 25, editorial: "Seminario Bíblico Andino", paginas: 450, isbn: "978-612-001-005" },
  { id: "sp6", titulo: "Ministerio de Niños", autor: "Hna. Patricia Vega", precio: 35, precioAntes: 0, imagen: "👧", categoria: "Ministerio", descripcion: "Guía práctica con 52 lecciones para el ministerio infantil, actividades manuales y recursos multimedia descargables.", rating: 4.8, reviews: 98, stock: 60, editorial: "LADP Publishing", paginas: 200, isbn: "978-612-001-006" },
  { id: "sp7", titulo: "Biblia de Estudio LADP", autor: "Comité Editorial", precio: 120, precioAntes: 150, imagen: "📕", categoria: "Biblia", descripcion: "Biblia Reina-Valera 1960 con 15,000 notas de estudio, concordancia completa, mapas a color y artículos teológicos.", rating: 5.0, reviews: 245, stock: 80, editorial: "LADP Publishing", paginas: 1800, isbn: "978-612-001-007", featured: true },
  { id: "sp8", titulo: "Himnario Digital + Físico", autor: "LADP Music", precio: 55, precioAntes: 0, imagen: "🎵", categoria: "Música", descripcion: "Colección completa de 500 himnos con partituras, acordes de guitarra y acceso a audio digital MP3.", rating: 4.7, reviews: 78, stock: 45, editorial: "LADP Music", paginas: 600, isbn: "978-612-001-008" },
  { id: "sp9", titulo: "Cómo Plantar Iglesias", autor: "Rev. Andrés Fuentes", precio: 48, precioAntes: 58, imagen: "🌱", categoria: "Ministerio", descripcion: "Manual paso a paso para la plantación de iglesias en contextos urbanos y rurales del Perú.", rating: 4.5, reviews: 43, stock: 35, editorial: "LADP Publishing", paginas: 220, isbn: "978-612-001-009" },
  { id: "sp10", titulo: "Consejería Pastoral", autor: "Dra. Carmen López", precio: 58, precioAntes: 0, imagen: "💬", categoria: "Ministerio", descripcion: "Herramientas bíblicas y psicológicas para la consejería en la iglesia local, crisis y acompañamiento espiritual.", rating: 4.8, reviews: 112, stock: 28, editorial: "Seminario Bíblico Andino", paginas: 380, isbn: "978-612-001-010" },
  { id: "sp11", titulo: "Adoración sin Límites", autor: "Worship Team LADP", precio: 42, precioAntes: 0, imagen: "🎶", categoria: "Música", descripcion: "20 canciones originales LADP con partituras, pistas de acompañamiento y tutoriales en video.", rating: 4.9, reviews: 187, stock: 70, editorial: "LADP Music", paginas: 120, isbn: "978-612-001-011", featured: true },
  { id: "sp12", titulo: "Escuela Dominical Vol.1", autor: "Equipo Educativo", precio: 32, precioAntes: 40, imagen: "🎓", categoria: "Educación", descripcion: "Curriculum trimestral para escuela dominical con material para maestros, alumnos y recursos visuales.", rating: 4.6, reviews: 56, stock: 90, editorial: "LADP Publishing", paginas: 160, isbn: "978-612-001-012" },
];

const TiendaPage = ({ onBack }) => {
  const [view, setView] = useState("catalogo"); // catalogo | producto | checkout | confirmacion
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const [orden, setOrden] = useState("relevancia");
  const [cartToast, setCartToast] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [orderData, setOrderData] = useState({ nombre: "", email: "", telefono: "", direccion: "", ciudad: "Lima", distrito: "", metodo: "yape", notas: "" });
  const [orderNumber, setOrderNumber] = useState("");
  const [pedidos, setPedidos] = useState([]);

  const categorias = ["Todos", ...new Set(SHOP_PRODUCTS.map(p => p.categoria))];
  const filtered = SHOP_PRODUCTS.filter(p => {
    const mc = filtro === "Todos" || p.categoria === filtro;
    const mb = p.titulo.toLowerCase().includes(buscar.toLowerCase()) || p.autor.toLowerCase().includes(buscar.toLowerCase());
    return mc && mb;
  }).sort((a, b) => {
    if (orden === "precio-asc") return a.precio - b.precio;
    if (orden === "precio-desc") return b.precio - a.precio;
    if (orden === "rating") return b.rating - a.rating;
    if (orden === "nombre") return a.titulo.localeCompare(b.titulo);
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const addToCart = (p) => {
    setCart(prev => { const ex = prev.find(c => c.id === p.id); if (ex) return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c); return [...prev, { ...p, qty: 1 }]; });
    setCartToast(p.titulo); setTimeout(() => setCartToast(null), 2000);
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));
  const updateQty = (id, q) => { if (q < 1) return removeFromCart(id); setCart(prev => prev.map(c => c.id === id ? { ...c, qty: q } : c)); };
  const toggleWish = (id) => setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const cartTotal = cart.reduce((a, c) => a + c.precio * c.qty, 0);
  const cartCount = cart.reduce((a, c) => a + c.qty, 0);
  const envio = cartTotal >= 100 ? 0 : 10;

  const confirmarPedido = () => {
    const num = "LADP-" + Date.now().toString(36).toUpperCase();
    setOrderNumber(num);
    setPedidos(prev => [...prev, { id: num, items: [...cart], total: cartTotal + envio, fecha: today(), estado: "procesando", datos: { ...orderData } }]);
    setCart([]);
    setCheckoutStep(1);
    setView("confirmacion");
  };

  // ─── Cart Sidebar ───
  const CartSidebar = () => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,25,35,0.65)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "flex-end", zIndex: 3000 }} className="fadein" onClick={() => setShowCart(false)}>
      <div className="slideIn" style={{ width: "100%", maxWidth: 460, background: "#fff", height: "100%", display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${G.grayMid}30`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><ShoppingCart size={20} color={G.accent} /><h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>Carrito ({cartCount})</h3></div>
          <button onClick={() => setShowCart(false)} style={{ background: G.grayLight, border: "none", cursor: "pointer", padding: 7, borderRadius: 8 }}><X size={18} color={G.gray} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 16px" }}><div style={{ fontSize: 56, marginBottom: 12 }}>🛒</div><p style={{ fontSize: 15, fontWeight: 600, color: G.dark }}>Tu carrito está vacío</p><p style={{ fontSize: 13, color: G.gray }}>Agrega productos para comenzar</p></div>
          ) : cart.map(item => (
            <div key={item.id} style={{ display: "flex", gap: 14, padding: "14px", background: G.grayLight, borderRadius: 12, marginBottom: 12, alignItems: "center" }}>
              <div style={{ fontSize: 36, flexShrink: 0, width: 50, height: 50, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{item.imagen}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h5 style={{ margin: "0 0 2px", fontSize: 13.5, fontWeight: 700, color: G.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.titulo}</h5>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${G.grayMid}`, borderRadius: 7, overflow: "hidden" }}>
                    <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ width: 28, height: 28, border: "none", background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, color: G.gray }}>−</button>
                    <span style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, color: G.dark, borderLeft: `1px solid ${G.grayMid}`, borderRight: `1px solid ${G.grayMid}` }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: 28, height: 28, border: "none", background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, color: G.gray }}>+</button>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: G.primary, fontFamily: fontTitle }}>S/. {item.precio * item.qty}</span>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Trash2 size={15} color={G.danger} /></button>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={{ padding: "20px 24px", borderTop: `1px solid ${G.grayMid}30` }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 6 }}><span style={{ color: G.gray }}>Subtotal</span><span style={{ fontWeight: 600, color: G.dark }}>S/. {cartTotal.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 6 }}><span style={{ color: G.gray }}>Envío</span><span style={{ fontWeight: 600, color: envio === 0 ? G.success : G.dark }}>{envio === 0 ? "Gratis" : `S/. ${envio.toFixed(2)}`}</span></div>
            {envio > 0 && <p style={{ margin: "0 0 10px", fontSize: 11.5, color: G.success }}>¡Envío gratis en compras mayores a S/. 100!</p>}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: `1px solid ${G.grayMid}30`, marginBottom: 14 }}><span style={{ fontSize: 15, fontWeight: 800, color: G.dark }}>Total</span><span style={{ fontSize: 22, fontWeight: 800, color: G.primary, fontFamily: fontTitle }}>S/. {(cartTotal + envio).toFixed(2)}</span></div>
            <button onClick={() => { setShowCart(false); setView("checkout"); setCheckoutStep(1); }} style={{ width: "100%", padding: "14px", fontSize: 14.5, fontWeight: 800, background: `linear-gradient(135deg, ${G.accent}, ${G.accentLight})`, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><CreditCard size={17} /> Proceder al Pago</button>
            <button onClick={() => { setShowCart(false); setView("catalogo"); }} style={{ width: "100%", padding: "10px", fontSize: 13, fontWeight: 600, background: "none", color: G.gray, border: "none", cursor: "pointer", fontFamily: font, marginTop: 8 }}>Seguir comprando</button>
          </div>
        )}
      </div>
    </div>
  );

  // ─── Product Detail ───
  const ProductDetail = () => {
    const p = selectedProduct; if (!p) return null;
    return (
      <div className="fadein" style={{ maxWidth: 960, margin: "0 auto" }}>
        <button onClick={() => { setView("catalogo"); setSelectedProduct(null); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: G.gray, fontFamily: font, display: "flex", alignItems: "center", gap: 6, marginBottom: 28 }}><ChevronLeft size={16} /> Volver al catálogo</button>
        <div className="split-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 48, alignItems: "start" }}>
          <div style={{ background: `linear-gradient(135deg, ${G.primary}08, ${G.accent}06)`, borderRadius: 24, padding: "60px 40px", textAlign: "center", position: "sticky", top: 100 }}>
            <div style={{ fontSize: 120, marginBottom: 20 }}>{p.imagen}</div>
            {p.featured && <Badge variant="warning" size="lg">⭐ Destacado</Badge>}
          </div>
          <div>
            <Badge variant="default">{p.categoria}</Badge>
            <h1 style={{ margin: "12px 0 8px", fontSize: 32, fontWeight: 800, color: G.dark, fontFamily: fontTitle, lineHeight: 1.15, letterSpacing: -1 }}>{p.titulo}</h1>
            <p style={{ margin: "0 0 16px", fontSize: 15, color: G.gray }}>por <strong style={{ color: G.dark }}>{p.autor}</strong> · {p.editorial}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 2 }}>{[1,2,3,4,5].map(s => <Star key={s} size={16} color={G.accent} fill={p.rating >= s ? G.accent : "none"} />)}</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: G.accent }}>{p.rating}</span>
              <span style={{ fontSize: 13, color: G.gray }}>({p.reviews} reseñas)</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: G.primary, fontFamily: fontTitle }}>S/. {p.precio}</span>
              {p.precioAntes > 0 && <span style={{ fontSize: 18, color: G.gray, textDecoration: "line-through" }}>S/. {p.precioAntes}</span>}
              {p.precioAntes > 0 && <Badge variant="danger">-{Math.round((1 - p.precio / p.precioAntes) * 100)}%</Badge>}
            </div>
            <p style={{ margin: "0 0 28px", fontSize: 15, color: G.gray, lineHeight: 1.8 }}>{p.descripcion}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28, padding: 20, background: G.grayLight, borderRadius: 14 }}>
              {[{ l: "Páginas", v: p.paginas },{ l: "ISBN", v: p.isbn },{ l: "Editorial", v: p.editorial },{ l: "Stock", v: p.stock > 10 ? "Disponible" : `Solo ${p.stock} unidades` }].map((d,i) => (
                <div key={i}><div style={{ fontSize: 11, fontWeight: 700, color: G.gray, textTransform: "uppercase", letterSpacing: 1 }}>{d.l}</div><div style={{ fontSize: 14, fontWeight: 600, color: G.dark, marginTop: 2 }}>{d.v}</div></div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => addToCart(p)} style={{ flex: 1, padding: "16px", fontSize: 15, fontWeight: 800, background: `linear-gradient(135deg, ${G.accent}, ${G.accentLight})`, color: "#fff", border: "none", borderRadius: 14, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}><ShoppingCart size={18} /> Agregar al Carrito</button>
              <button onClick={() => toggleWish(p.id)} style={{ width: 56, height: 56, borderRadius: 14, border: `2px solid ${wishlist.includes(p.id) ? G.danger : G.grayMid}`, background: wishlist.includes(p.id) ? G.dangerLight : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Heart size={20} color={wishlist.includes(p.id) ? G.danger : G.gray} fill={wishlist.includes(p.id) ? G.danger : "none"} /></button>
            </div>
            <p style={{ margin: "16px 0 0", fontSize: 12.5, color: G.gray, display: "flex", alignItems: "center", gap: 6 }}><Check size={14} color={G.success} /> Envío gratis en compras mayores a S/. 100 · Pago seguro</p>
          </div>
        </div>
      </div>
    );
  };

  // ─── Checkout ───
  const Checkout = () => (
    <div className="fadein" style={{ maxWidth: 800, margin: "0 auto" }}>
      <button onClick={() => setView("catalogo")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: G.gray, fontFamily: font, display: "flex", alignItems: "center", gap: 6, marginBottom: 28 }}><ChevronLeft size={16} /> Volver a la tienda</button>
      {/* Progress steps */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 40 }}>
        {[{ n: 1, l: "Datos" },{ n: 2, l: "Envío" },{ n: 3, l: "Pago" }].map((s,i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: checkoutStep >= s.n ? `linear-gradient(135deg, ${G.accent}, ${G.accentLight})` : G.grayLight, color: checkoutStep >= s.n ? "#fff" : G.gray, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, fontFamily: fontTitle }}>{checkoutStep > s.n ? <Check size={18} /> : s.n}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: checkoutStep >= s.n ? G.dark : G.gray, textTransform: "uppercase", letterSpacing: 1 }}>{s.l}</span>
            </div>
            {i < 2 && <div style={{ width: 60, height: 2, background: checkoutStep > s.n ? G.accent : G.grayMid, margin: "0 12px", marginBottom: 20, borderRadius: 1 }} />}
          </div>
        ))}
      </div>
      <div className="split-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 32 }}>
        <Card hover={false}>
          {checkoutStep === 1 && (<div><h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800, fontFamily: fontTitle, color: G.dark }}>Datos Personales</h3><div style={{ display: "flex", flexDirection: "column", gap: 14 }}><Input label="Nombre completo" value={orderData.nombre} onChange={e => setOrderData({...orderData, nombre: e.target.value})} required placeholder="Juan Pérez" /><Input label="Email" value={orderData.email} onChange={e => setOrderData({...orderData, email: e.target.value})} required type="email" icon={Mail} placeholder="tu@email.com" /><Input label="Teléfono / WhatsApp" value={orderData.telefono} onChange={e => setOrderData({...orderData, telefono: e.target.value})} required icon={Phone} placeholder="+51 999 123 456" /></div><div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}><Button variant="primary" size="md" onClick={() => setCheckoutStep(2)} icon={ArrowRight}>Continuar</Button></div></div>)}
          {checkoutStep === 2 && (<div><h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800, fontFamily: fontTitle, color: G.dark }}>Datos de Envío</h3><div style={{ display: "flex", flexDirection: "column", gap: 14 }}><Input label="Dirección" value={orderData.direccion} onChange={e => setOrderData({...orderData, direccion: e.target.value})} required icon={MapPin} placeholder="Av. Colombia 325" /><div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}><Input label="Ciudad" value={orderData.ciudad} onChange={e => setOrderData({...orderData, ciudad: e.target.value})} /><Input label="Distrito" value={orderData.distrito} onChange={e => setOrderData({...orderData, distrito: e.target.value})} placeholder="Pueblo Libre" /></div><TextArea label="Notas de envío (opcional)" value={orderData.notas} onChange={e => setOrderData({...orderData, notas: e.target.value})} placeholder="Indicaciones para el repartidor..." rows={2} /></div><div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}><Button variant="outline" size="md" onClick={() => setCheckoutStep(1)} icon={ChevronLeft}>Atrás</Button><Button variant="primary" size="md" onClick={() => setCheckoutStep(3)} icon={ArrowRight}>Continuar</Button></div></div>)}
          {checkoutStep === 3 && (<div><h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800, fontFamily: fontTitle, color: G.dark }}>Método de Pago</h3><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[{ id: "yape", label: "Yape", desc: "Pago instantáneo con Yape", emoji: "📱" },{ id: "plin", label: "Plin", desc: "Pago con Plin (Interbank, BBVA)", emoji: "💳" },{ id: "transferencia", label: "Transferencia Bancaria", desc: "BCP, Interbank, BBVA", emoji: "🏦" },{ id: "tarjeta", label: "Tarjeta de Crédito/Débito", desc: "Visa, Mastercard, Amex", emoji: "💎" },{ id: "contraentrega", label: "Pago Contra Entrega", desc: "Solo Lima Metropolitana", emoji: "🤝" }].map(m => (
              <div key={m.id} onClick={() => setOrderData({...orderData, metodo: m.id})} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: 14, border: orderData.metodo === m.id ? `2px solid ${G.accent}` : `1.5px solid ${G.grayMid}`, background: orderData.metodo === m.id ? G.accent + "08" : "#fff", cursor: "pointer", transition: "all 0.2s" }}>
                <span style={{ fontSize: 28 }}>{m.emoji}</span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: G.dark }}>{m.label}</div><div style={{ fontSize: 12, color: G.gray }}>{m.desc}</div></div>
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: orderData.metodo === m.id ? `6px solid ${G.accent}` : `2px solid ${G.grayMid}`, transition: "all 0.2s" }} />
              </div>
            ))}
          </div><div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}><Button variant="outline" size="md" onClick={() => setCheckoutStep(2)} icon={ChevronLeft}>Atrás</Button><Button variant="primary" size="lg" onClick={confirmarPedido} icon={Check}>Confirmar Pedido</Button></div></div>)}
        </Card>
        {/* Order summary sidebar */}
        <div>
          <Card hover={false} style={{ position: "sticky", top: 100 }}>
            <h4 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800, color: G.dark }}>Resumen del Pedido</h4>
            {cart.map(item => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, fontSize: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 20 }}>{item.imagen}</span><div><div style={{ fontWeight: 600, color: G.dark }}>{item.titulo}</div><div style={{ color: G.gray }}>x{item.qty}</div></div></div>
                <span style={{ fontWeight: 700, color: G.dark }}>S/. {(item.precio * item.qty).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${G.grayMid}30`, paddingTop: 12, marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><span style={{ color: G.gray }}>Subtotal</span><span style={{ fontWeight: 600 }}>S/. {cartTotal.toFixed(2)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><span style={{ color: G.gray }}>Envío</span><span style={{ fontWeight: 600, color: envio === 0 ? G.success : G.dark }}>{envio === 0 ? "Gratis" : `S/. ${envio.toFixed(2)}`}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: `1px solid ${G.grayMid}30`, marginTop: 8 }}><span style={{ fontSize: 16, fontWeight: 800 }}>Total</span><span style={{ fontSize: 22, fontWeight: 800, color: G.primary, fontFamily: fontTitle }}>S/. {(cartTotal + envio).toFixed(2)}</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  // ─── Order Confirmation ───
  const Confirmacion = () => (
    <div className="fadein" style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", padding: "40px 0" }}>
      <div style={{ width: 88, height: 88, borderRadius: "50%", background: G.successLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}><Check size={40} color={G.success} /></div>
      <h1 style={{ margin: "0 0 12px", fontSize: 32, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>¡Pedido Confirmado!</h1>
      <p style={{ margin: "0 0 8px", fontSize: 16, color: G.gray }}>Gracias por tu compra. Tu pedido ha sido registrado exitosamente.</p>
      <div style={{ display: "inline-block", background: G.grayLight, padding: "10px 24px", borderRadius: 10, margin: "16px 0 32px" }}><span style={{ fontSize: 13, color: G.gray }}>N° de Pedido: </span><span style={{ fontSize: 16, fontWeight: 800, color: G.primary, fontFamily: fontTitle }}>{orderNumber}</span></div>
      <Card hover={false} style={{ textAlign: "left", marginBottom: 24 }}>
        <h4 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: G.dark }}>¿Qué sigue?</h4>
        {["Recibirás un email de confirmación con los detalles de tu pedido","Te enviaremos las instrucciones de pago por WhatsApp","Una vez confirmado el pago, despacharemos tu pedido en 24-48 horas","Recibirás un código de seguimiento por email"].map((s,i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: G.primary + "14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 800, color: G.primary }}>{i + 1}</div>
            <span style={{ fontSize: 13.5, color: G.gray, lineHeight: 1.5 }}>{s}</span>
          </div>
        ))}
      </Card>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <Button variant="primary" size="md" onClick={() => setView("catalogo")} icon={ShoppingCart}>Seguir Comprando</Button>
        <Button variant="outline" size="md" onClick={() => setView("pedidos")} icon={FileText}>Mis Pedidos</Button>
      </div>
    </div>
  );

  // ─── My Orders ───
  const MisPedidos = () => (
    <div className="fadein" style={{ maxWidth: 800, margin: "0 auto" }}>
      <button onClick={() => setView("catalogo")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: G.gray, fontFamily: font, display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}><ChevronLeft size={16} /> Volver a la tienda</button>
      <h2 style={{ margin: "0 0 24px", fontSize: 24, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>Mis Pedidos</h2>
      {pedidos.length === 0 ? <Card hover={false}><EmptyState icon={FileText} message="Aún no tienes pedidos" action="Ir a la tienda" onAction={() => setView("catalogo")} /></Card> :
      pedidos.map(p => (
        <Card key={p.id} hover={false} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div><span style={{ fontSize: 14, fontWeight: 800, color: G.primary, fontFamily: fontTitle }}>{p.id}</span><span style={{ fontSize: 13, color: G.gray, marginLeft: 12 }}>{fmtDate(p.fecha)}</span></div>
            <Badge variant={p.estado === "procesando" ? "warning" : p.estado === "enviado" ? "primary" : "success"}>{p.estado}</Badge>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {p.items.map(item => (<div key={item.id} style={{ display: "flex", alignItems: "center", gap: 6, background: G.grayLight, padding: "6px 12px", borderRadius: 8, fontSize: 12.5 }}><span>{item.imagen}</span><span style={{ fontWeight: 600, color: G.dark }}>{item.titulo}</span><span style={{ color: G.gray }}>x{item.qty}</span></div>))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${G.grayMid}20` }}>
            <span style={{ fontSize: 13, color: G.gray }}>Método: {p.datos.metodo}</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: G.primary, fontFamily: fontTitle }}>S/. {p.total.toFixed(2)}</span>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div style={{ fontFamily: font, color: G.dark, background: G.bg, minHeight: "100vh" }}>
      <GlobalStyles />
      {cartToast && <Toast message={`"${cartToast}" añadido al carrito`} type="success" onClose={() => setCartToast(null)} />}
      {showCart && <CartSidebar />}
      {/* ─── Store Header ─── */}
      <header style={{ background: "#fff", borderBottom: `1px solid ${G.grayMid}40`, padding: "0 32px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600, color: G.gray, fontFamily: font }}><ChevronLeft size={16} /> Inicio</button>
            <div style={{ width: 1, height: 28, background: G.grayMid }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setView("catalogo")}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg, ${G.accent}, ${G.accentLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 17, fontFamily: fontTitle }}>L</div>
              <div><div style={{ fontSize: 15, fontWeight: 800, color: G.dark, fontFamily: fontTitle }}>LADP Tienda</div><div style={{ fontSize: 9, color: G.gray, textTransform: "uppercase", letterSpacing: 2 }}>Librería Cristiana</div></div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {wishlist.length > 0 && <button onClick={() => {}} style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, background: "none", border: `1.5px solid ${G.grayMid}`, borderRadius: 10, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 6, color: G.gray }}><Heart size={15} color={G.danger} /> {wishlist.length}</button>}
            <button onClick={() => setView("pedidos")} style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, background: "none", border: `1.5px solid ${G.grayMid}`, borderRadius: 10, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 6, color: G.gray }}><FileText size={15} /> Pedidos</button>
            <button onClick={() => setShowCart(true)} style={{ padding: "8px 18px", fontSize: 13.5, fontWeight: 700, background: cartCount > 0 ? G.accent : G.grayLight, color: cartCount > 0 ? "#fff" : G.dark, border: "none", borderRadius: 10, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", position: "relative" }}>
              <ShoppingCart size={17} /> S/. {cartTotal.toFixed(2)}
              {cartCount > 0 && <span style={{ background: "#fff", color: G.accent, fontWeight: 800, fontSize: 11, width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>
      {/* ─── Content ─── */}
      <main style={{ maxWidth: 1300, margin: "0 auto", padding: "32px 32px 80px" }}>
        {view === "catalogo" && (
          <div className="fadein">
            {/* Banner */}
            <div style={{ background: `linear-gradient(135deg, ${G.primaryDark}, ${G.primary})`, borderRadius: 24, padding: "48px 44px", marginBottom: 32, position: "relative", overflow: "hidden", color: "#fff" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${G.accent}20, transparent)` }} />
              <STag>Tienda LADP</STag>
              <h1 style={{ margin: "12px 0 10px", fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 800, fontFamily: fontTitle, letterSpacing: -1 }}>Recursos que transforman vidas</h1>
              <p style={{ margin: 0, fontSize: 16, opacity: 0.7, maxWidth: 500 }}>Biblias, libros, devocionales, música y más. Envío gratis en compras mayores a S/. 100.</p>
            </div>
            {/* Filters */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div style={{ flex: 1, maxWidth: 360 }}><Input placeholder="Buscar productos..." value={buscar} onChange={e => setBuscar(e.target.value)} icon={Search} /></div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {categorias.map(cat => (<button key={cat} onClick={() => setFiltro(cat)} style={{ padding: "7px 16px", borderRadius: 8, border: filtro === cat ? `2px solid ${G.primary}` : `1.5px solid ${G.grayMid}`, background: filtro === cat ? G.primary + "10" : "#fff", color: filtro === cat ? G.primary : G.gray, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: font }}>{cat}</button>))}
              </div>
              <Select value={orden} onChange={e => setOrden(e.target.value)} options={[{ value: "relevancia", label: "Relevancia" },{ value: "precio-asc", label: "Menor precio" },{ value: "precio-desc", label: "Mayor precio" },{ value: "rating", label: "Mejor valorado" },{ value: "nombre", label: "Nombre A-Z" }]} />
            </div>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: G.gray }}>{filtered.length} producto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
            {/* Product grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 22 }}>
              {filtered.map(p => (
                <div key={p.id} className="card-hover" style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: p.featured ? `2px solid ${G.accent}30` : `1px solid ${G.grayMid}30`, position: "relative", transition: "all 0.3s" }}>
                  {p.featured && <div style={{ position: "absolute", top: 14, left: 14, zIndex: 2, background: G.accent, color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 6, textTransform: "uppercase", letterSpacing: 1 }}>★ Top</div>}
                  {p.precioAntes > 0 && <div style={{ position: "absolute", top: 14, right: 14, zIndex: 2, background: G.danger, color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 6 }}>-{Math.round((1 - p.precio / p.precioAntes) * 100)}%</div>}
                  <div onClick={() => { setSelectedProduct(p); setView("producto"); }} style={{ background: `linear-gradient(135deg, ${G.primary}06, ${G.accent}04)`, padding: "36px 0", textAlign: "center", fontSize: 68, cursor: "pointer", borderBottom: `1px solid ${G.grayMid}15`, position: "relative" }}>
                    {p.imagen}
                    <button onClick={e => { e.stopPropagation(); toggleWish(p.id); }} style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex" }}><Heart size={16} color={wishlist.includes(p.id) ? G.danger : G.gray} fill={wishlist.includes(p.id) ? G.danger : "none"} /></button>
                  </div>
                  <div style={{ padding: "20px 22px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <Badge variant="default">{p.categoria}</Badge>
                      <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12 }}><Star size={12} fill={G.accent} color={G.accent} /><span style={{ fontWeight: 700, color: G.accent }}>{p.rating}</span><span style={{ color: G.gray }}>({p.reviews})</span></div>
                    </div>
                    <h4 onClick={() => { setSelectedProduct(p); setView("producto"); }} style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: G.dark, fontFamily: fontTitle, lineHeight: 1.3, cursor: "pointer" }}>{p.titulo}</h4>
                    <p style={{ margin: "0 0 14px", fontSize: 13, color: G.gray }}>{p.autor}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: `1px solid ${G.grayMid}15` }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: G.primary, fontFamily: fontTitle }}>S/. {p.precio}</span>
                        {p.precioAntes > 0 && <span style={{ fontSize: 13, color: G.gray, textDecoration: "line-through" }}>S/. {p.precioAntes}</span>}
                      </div>
                      <button onClick={() => addToCart(p)} style={{ padding: "9px 16px", fontSize: 12.5, fontWeight: 700, background: `linear-gradient(135deg, ${G.primary}, ${G.primaryLight})`, color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}><ShoppingCart size={13} /> Agregar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filtered.length === 0 && <EmptyState icon={Search} message="No se encontraron productos con ese criterio" />}
          </div>
        )}
        {view === "producto" && <ProductDetail />}
        {view === "checkout" && <Checkout />}
        {view === "confirmacion" && <Confirmacion />}
        {view === "pedidos" && <MisPedidos />}
      </main>
    </div>
  );
};

// ─── APP ROOT ────────────────────────────────────────────────────────
export default function App() {
  const ruta = useRuta();
  const [userProfile, setUserProfile] = useState(null);
  const [verificando, setVerificando] = useState(isSupabaseConfigured());

  const page = ruta.startsWith("/panel") ? "dashboard"
    : ruta === "/login" ? "login"
    : ruta === "/registro" ? "register"
    : ruta === "/tienda" ? "tienda"
    : "landing";
  const seccion = ruta.split("/")[2] || "";

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const cargarPerfil = async (session, recienIngresa) => {
      const profile = await getUserProfile();
      setUserProfile(profile || { id: session.user.id, nombre: session.user.email?.split("@")[0] || "Usuario", rol: "usuario", email: session.user.email });
      // Con sesión iniciada, login/registro llevan al panel; al volver de Google también desde el inicio
      const enEntrada = ["/login", "/registro"].includes(window.location.pathname) || (recienIngresa && window.location.pathname === "/");
      if (enEntrada) navegar("/panel", { reemplazar: true });
      setVerificando(false);
    };

    // INITIAL_SESSION restaura la sesión guardada al recargar; SIGNED_IN cubre el login con Google.
    // No se llama a Supabase dentro del callback (bloquea el cliente): se difiere con setTimeout.
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if ((event === "INITIAL_SESSION" || event === "SIGNED_IN") && session) {
        // Tokens en la URL = regreso del login con Google
        const recienIngresa = event === "SIGNED_IN" || /access_token=/.test(window.location.hash);
        setTimeout(() => cargarPerfil(session, recienIngresa), 0);
      } else if (event === "INITIAL_SESSION") {
        setVerificando(false);
      } else if (event === "SIGNED_OUT") {
        setUserProfile(null);
        navegar("/");
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // El panel exige sesión: sin ella se manda al login
  useEffect(() => {
    if (!verificando && page === "dashboard" && !userProfile) navegar("/login", { reemplazar: true });
  }, [verificando, page, userProfile]);

  useEffect(() => {
    if (page === "dashboard") return; // el panel pone su propio título
    document.title = { landing: "LADP - Iglesia Cristo Viene", login: "Iniciar sesión · LADP", register: "Crear cuenta · LADP", tienda: "Tienda · LADP" }[page];
    if (page !== "landing") window.scrollTo(0, 0);
  }, [page]);

  const handleLogout = async () => {
    await signOut();
    setUserProfile(null);
    navegar("/");
  };

  if (verificando || (page === "dashboard" && !userProfile)) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, color: G.gray, fontSize: 14 }}>Cargando…</div>
  );

  return (
    <div>
      {page === "landing" && <LandingPage onLogin={() => navegar("/login")} onTienda={() => navegar("/tienda")} />}
      {page === "login" && <Login onSuccess={(profile) => { setUserProfile(profile); navegar("/panel"); }} onBack={() => navegar("/")} onRegister={() => navegar("/registro")} />}
      {page === "register" && <Register onSuccess={() => navegar("/login")} onBack={() => navegar("/login")} />}
      {page === "dashboard" && <Dashboard onLogout={handleLogout} userProfile={userProfile} seccion={seccion} />}
      {page === "tienda" && <TiendaPage onBack={() => navegar("/")} />}
    </div>
  );
}

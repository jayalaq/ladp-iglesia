import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Exponer también variables NEXT_PUBLIC_* (las crea la integración Supabase↔Vercel)
  // además de las VITE_* por defecto.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});

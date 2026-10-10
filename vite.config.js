import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Las variables Supabase expuestas aquí son públicas; nunca exponer las service-role.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_PUBLISHABLE_KEY'],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});

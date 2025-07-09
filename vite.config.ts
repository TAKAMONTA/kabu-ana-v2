import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY),
    'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.VITE_FIREBASE_API_KEY),
    'import.meta.env.VITE_REVENUECAT_API_KEY': JSON.stringify(process.env.VITE_REVENUECAT_API_KEY)
  },
  resolve: {
    alias: {
      '@': '.'
    }
  },
  envPrefix: 'VITE_'
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // 開發時把 /api 轉給後端（見 design.md 決策 6）
    proxy: {
      '/api': 'http://127.0.0.1:3001',
    },
  },
});

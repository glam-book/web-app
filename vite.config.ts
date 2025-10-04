import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import generouted from '@generouted/react-router/plugin';

// https://vitejs.dev/config/
export default defineConfig(({ _mode }) => {
  return {
    plugins: [react(), tailwindcss(), generouted()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': 'http://localhost:4567',
      },
    },
  };
});

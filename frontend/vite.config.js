import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendPort = process.env.BACKEND_PORT || 8000;

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/analyse': `http://127.0.0.1:${backendPort}`,
            '/health': `http://127.0.0.1:${backendPort}`,
            '/demo': `http://127.0.0.1:${backendPort}`,
        },
    },
});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [
		react(),
		tailwindcss(),
	],
	base: mode === 'production' ? '/ivan2_daw2/' : '/',
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:8081',
				changeOrigin: true,
			}
		}
	}
}))

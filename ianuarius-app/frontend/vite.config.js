import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost/diurno/TFG-DAW2/ianuarius-app/backend/api/test.php',
			}
		}
	}
})

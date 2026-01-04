import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		watch: {
			ignored: ['**/node_modules/**', '**/.git/**']
		},
		proxy: {
			// GAC API (auth, internal tokens)
			'/api/gac': {
				target: 'http://127.0.0.1:8090',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/gac/, '/api/v1')
			},
			// Siscom Admin API (accounts, plans, devices management, trips, commands)
			'/api/admin': {
				target: 'http://127.0.0.1:8000',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/admin/, '/api/v1')
			},
			// Siscom Public API (device communications)
			'/api/public': {
				target: 'http://127.0.0.1:8080',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/public/, '/api/v1')
			}
		}
	}
});

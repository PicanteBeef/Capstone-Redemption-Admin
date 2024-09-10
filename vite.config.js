import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		'process.env': {
		  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
		  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY
		}
	}
});

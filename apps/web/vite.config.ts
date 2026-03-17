import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5173
  },
  resolve: {
    alias: {
      // Stub Node.js `os` for browser — @mrleebo/prisma-ast only needs EOL
      os: path.resolve('./src/lib/browser-stubs/os.ts'),
    }
  }
});

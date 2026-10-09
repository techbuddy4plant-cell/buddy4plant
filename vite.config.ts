import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    build: {
      // separate long-lived library files so returning visitors reuse them from cache
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('firebase') || id.includes('@firebase')) return 'vendor-firebase';
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) return 'vendor-react';
            if (id.includes('motion') || id.includes('framer')) return 'vendor-motion';
            if (id.includes('gsap')) return 'vendor-gsap';
            if (id.includes('three')) return 'vendor-three';
            return undefined;
          },
        },
      },
      chunkSizeWarningLimit: 900,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@designcodeio/threeui/style.css': path.resolve(__dirname, 'src/shaders/threeui.css'),
        '@designcodeio/threeui': path.resolve(__dirname, 'src/shaders/index.ts'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

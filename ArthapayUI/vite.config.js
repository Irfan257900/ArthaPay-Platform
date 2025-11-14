import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react'
import commonjs from 'vite-plugin-commonjs';
import tailwindcss from 'tailwindcss'
import { nodePolyfills as viteNodePolyfills } from 'vite-plugin-node-polyfills';
import path from "path";
export default defineConfig({
  server: { port: 3000 },
  plugins: [[{
    name: 'treat-js-files-as-jsx',
    async transform(code, id) {
      if (!id.match(/src\/.*\.js$/)) return null;
      return transformWithEsbuild(code, id, {
        loader: 'jsx',
        jsx: 'automatic',
      });
    },
  }, react()], viteNodePolyfills({ protocolImports: true }), commonjs()],
  css: {
    postcss: {
      plugins: [tailwindcss()]
    }
  },

  define: {
    global: 'window',
  },
  optimizeDeps: {
    include: [
      "pdfjs-dist/build/pdf.worker.js",
      "pdfjs-dist/build/pdf.js",
      "pdfjs-dist/legacy/build/pdf.worker.js",
      "pdfjs-dist/legacy/build/pdf.js",
    ],
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    mainFields: ['browser', 'module', 'main'],
    alias: {
      'pdfjs-dist': path.resolve(__dirname, 'node_modules/pdfjs-dist')
    },
  },
  build: {
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 500,
  }
})
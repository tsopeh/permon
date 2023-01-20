import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
    sourcemap: true,
    outDir: 'demo',
  },
  define: {
    'import.meta.env.__PERMON_VERSION__': JSON.stringify(`v${process.env.npm_package_version}`),
  },
})
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const libName = 'permon'

export default defineConfig({
  server: {
    port: 5100,
    host: true,
  },
  build: {
    lib: {
      entry: 'lib/index.ts',
      name: libName,
      fileName: libName,
    },
    sourcemap: true,
    minify: false,
    outDir: 'dist',
  },
  plugins: [dts({ insertTypesEntry: true }),],
  define: {
    'import.meta.env.__PERMON_VERSION__': JSON.stringify(`v${process.env.npm_package_version}`),
  },
})
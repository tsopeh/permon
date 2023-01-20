import * as path from 'path'
import { defineConfig } from 'vite'

const libName = 'permon'

module.exports = defineConfig({
  server: {
    port: 5100,
    host: true,
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/main.ts'),
      name: libName,
      formats: ['es', 'cjs', 'umd', 'iife'],
      fileName: (format) => `${libName}.${format}.js`,
    },
    sourcemap: true,
    outDir: 'dist',
  },
  define: {
    'import.meta.env.__PERMON_VERSION__': JSON.stringify(`v${process.env.npm_package_version}`),
  },
})
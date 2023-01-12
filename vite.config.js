const path = require('path')
const {defineConfig} = require('vite')

const libName = 'ClientPerformanceMonitor'

module.exports = defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'lib/main.ts'),
            name: libName,
            formats:['es', 'cjs', 'umd', 'iife'],
            fileName: (format) => `${libName}.${format}.js`,
        },
    }
});
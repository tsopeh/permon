const path = require('path')
const {defineConfig} = require('vite')

const libName = 'client-performance-monitor'

module.exports = defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'lib/main.ts'),
            name: libName,
            fileName: (format) => `${libName}.${format}.js`,
        },
    }
});
import { defineConfig } from 'tsup';
export default defineConfig({
    loader:{
        '.html': 'text',
        '.css': 'text'
    },
    outExtension({format}) { return { js: '.js' }},
    noExternal: [/(.*)/],
    splitting: false
})
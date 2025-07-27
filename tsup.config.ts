import { defineConfig } from 'tsup';
export default defineConfig({
    loader:{
        '.html': 'text',
        '.css': 'text'
    },
    noExternal: [/(.*)/],
    splitting: false,
    outExtension({ format }) {
    if (format === 'esm') {
      return {
        js: '.js',
      };
    }
    return {
      js: '.cjs', 
    };
  },
})
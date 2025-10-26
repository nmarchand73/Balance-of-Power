import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'game-engine': ['src/game/GameEngine.ts', 'src/game/GameState.ts'],
          'ai-engine': ['src/game/AIEngine.ts'],
          'crisis-manager': ['src/game/CrisisManager.ts'],
          'content-manager': ['src/game/ContentManager.ts'],
          'ui-components': ['src/ui/UIManager.ts', 'src/ui/CountryListRenderer.ts', 'src/ui/CountryDetailModal.ts'],
          'data': ['src/data/countries.ts', 'src/data/relations.ts', 'src/data/constants.ts']
        }
      }
    },
    target: 'es2020',
    assetsInlineLimit: 4096
  },
  server: {
    port: 3001,
    open: true,
    host: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    include: ['src/game/GameEngine.ts', 'src/game/AIEngine.ts']
  }
})

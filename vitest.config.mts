import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// .mts so Vite loads this as ESM. package.json has no "type": "module"
// (Next expects CJS for next.config), so the extension carries the signal.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx', 'lib/**/*.test.ts'],
  },
  resolve: { alias: { '@': path.resolve(import.meta.dirname, '.') } },
})

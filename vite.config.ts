import { defineConfig, mergeConfig } from 'vite'
import { defineConfig as defineTestConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const testConfig = defineTestConfig({
  test: {
    environment: 'jsdom',
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: false },
    },
  },
})

export default mergeConfig(
  defineConfig({
    plugins: [react(), tailwindcss()],
  }),
  testConfig,
)

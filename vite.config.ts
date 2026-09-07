import { defineConfig } from 'vite'
import uniPackage from '@dcloudio/vite-plugin-uni'

const uni = (uniPackage as unknown as { default?: typeof uniPackage }).default ?? uniPackage

export default defineConfig({
  plugins: [uni()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})

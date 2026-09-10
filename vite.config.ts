import { defineConfig } from 'vite'
import uniPackage from '@dcloudio/vite-plugin-uni'

const uni = (uniPackage as unknown as { default?: typeof uniPackage }).default ?? uniPackage

export default defineConfig({
  plugins: [uni()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      // uni 编译器会在页面目录里创建 .*.tmpdir 临时目录,Windows 上
      // watcher 监视到其内部文件被锁定时会以 EBUSY 崩溃,忽略之。
      ignored: ['**/.*.tmpdir/**', '**/*.tmp'],
    },
  },
})

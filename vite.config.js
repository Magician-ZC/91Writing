import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: true
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 7520,
    open: true,
    // 配置开发服务器支持 SPA 路由
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks(id) {
          // 将node_modules中的代码单独打包
          if (id.includes('node_modules')) {
            // element-plus单独打包
            if (id.includes('element-plus')) {
              return 'element-plus'
            }
            // vue相关库单独打包
            if (id.includes('vue') || id.includes('pinia')) {
              return 'vue-vendor'
            }
            // echarts单独打包
            if (id.includes('echarts')) {
              return 'echarts'
            }
            // vis-network单独打包
            if (id.includes('vis-network')) {
              return 'vis-network'
            }
            // 其他第三方库
            return 'vendor'
          }
        },
        // 静态资源分类
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除console
        drop_debugger: true,
        pure_funcs: ['console.log'] // 移除console.log
      }
    },
    // 文件大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 生成sourcemap
    sourcemap: false,
    // 资源内联阈值
    assetsInlineLimit: 4096,
    // 清空输出目录
    emptyOutDir: true
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      '@element-plus/icons-vue'
    ],
    exclude: ['vis-network'] // 较大的库不预构建
  },
  // 性能优化
  esbuild: {
    // 删除生产环境的console和debugger
    drop: ['console', 'debugger']
  }
})
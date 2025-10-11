import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化应用
async function initApp() {
  try {
    // 动态导入认证store以避免循环依赖
    const { useAuthStore } = await import('./stores/authStore')
    const authStore = useAuthStore()
    
    // 初始化API管理器和数据同步服务
    const { default: apiManager } = await import('./services/apiManager')
    const { default: dataSyncService } = await import('./services/dataSync')
    
    // 初始化PWA功能
    const { registerServiceWorker, setupPWAInstallPrompt, setupNetworkListeners } = await import('./utils/pwa')
    
    // 注册 Service Worker
    if (import.meta.env.PROD) {
      await registerServiceWorker()
    }
    
    // 设置PWA安装提示
    const pwaInstaller = setupPWAInstallPrompt()
    window.pwaInstaller = pwaInstaller // 全局访问
    
    // 设置网络状态监听
    setupNetworkListeners(
      () => {
        console.log('网络已连接')
        // 只有用户已登录时才同步数据
        if (apiManager.getMode() === 'hybrid' && authStore.isAuthenticated) {
          console.log('用户已登录，开始同步数据')
          dataSyncService.autoSync()
        }
      },
      () => {
        console.log('网络已断开，切换到离线模式')
      }
    )
    
    // 设置token拦截器（保留兼容性）
    authStore.setupTokenInterceptor()
    
    // 如果是混合模式且在线，且用户已登录，才执行自动同步
    if (apiManager.getMode() === 'hybrid' && navigator.onLine && authStore.isAuthenticated) {
      // 延迟执行同步，避免阻塞应用启动
      setTimeout(() => dataSyncService.autoSync(), 2000)
    }
    
    // 挂载应用
    app.mount('#app')
  } catch (error) {
    console.error('应用初始化失败:', error)
    // 即使初始化失败也要挂载应用
    app.mount('#app')
  }
}

initApp()
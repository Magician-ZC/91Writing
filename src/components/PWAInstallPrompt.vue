<template>
  <el-dialog
    v-model="showInstallDialog"
    title="安装91Writing应用"
    width="400px"
    :close-on-click-modal="false"
  >
    <div class="install-prompt">
      <div class="install-icon">
        <el-icon :size="64"><Download /></el-icon>
      </div>
      <h3>将91Writing添加到主屏幕</h3>
      <p>安装应用后，您可以：</p>
      <ul>
        <li>快速访问，无需打开浏览器</li>
        <li>离线使用，随时随地创作</li>
        <li>接收实时通知和更新</li>
        <li>更好的性能和用户体验</li>
      </ul>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dismissInstall">稍后再说</el-button>
        <el-button type="primary" @click="installApp">立即安装</el-button>
      </div>
    </template>
  </el-dialog>
  
  <!-- 浮动安装按钮 -->
  <transition name="fade">
    <div v-if="showFloatingButton && !isInstalled" class="floating-install-btn" @click="showInstallDialog = true">
      <el-icon><Download /></el-icon>
      <span>安装应用</span>
    </div>
  </transition>
  
  <!-- 网络状态提示 -->
  <transition name="slide-down">
    <div v-if="!isOnline" class="network-status offline">
      <el-icon><WarningFilled /></el-icon>
      <span>离线模式 - 某些功能可能受限</span>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Download, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { isInstalledPWA, isOnline as checkOnline } from '@/utils/pwa'

const showInstallDialog = ref(false)
const showFloatingButton = ref(false)
const isInstalled = ref(false)
const isOnline = ref(true)

let pwaInstaller = null

onMounted(() => {
  // 检查是否已安装
  isInstalled.value = isInstalledPWA()
  
  // 检查网络状态
  isOnline.value = checkOnline()
  
  // 监听PWA安装事件
  window.addEventListener('pwa-install-available', handleInstallAvailable)
  window.addEventListener('pwa-installed', handleInstalled)
  
  // 监听网络状态变化
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  // 获取PWA安装器
  pwaInstaller = window.pwaInstaller
  
  // 如果有可用的安装提示，延迟显示浮动按钮
  setTimeout(() => {
    if (pwaInstaller && pwaInstaller.hasPrompt() && !isInstalled.value) {
      showFloatingButton.value = true
    }
  }, 3000)
})

onUnmounted(() => {
  window.removeEventListener('pwa-install-available', handleInstallAvailable)
  window.removeEventListener('pwa-installed', handleInstalled)
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})

function handleInstallAvailable(event) {
  console.log('PWA安装可用', event.detail)
  pwaInstaller = event.detail.installer || window.pwaInstaller
  
  if (!isInstalled.value) {
    // 延迟显示浮动按钮，避免过于突兀
    setTimeout(() => {
      showFloatingButton.value = true
    }, 2000)
  }
}

function handleInstalled() {
  console.log('PWA已安装')
  isInstalled.value = true
  showFloatingButton.value = false
  showInstallDialog.value = false
  
  ElMessage.success({
    message: '应用安装成功！',
    duration: 3000,
  })
}

function handleOnline() {
  isOnline.value = true
  ElMessage.success('网络已连接')
}

function handleOffline() {
  isOnline.value = false
  ElMessage.warning('网络已断开，进入离线模式')
}

async function installApp() {
  if (!pwaInstaller) {
    ElMessage.error('安装功能不可用')
    return
  }
  
  const result = await pwaInstaller.showInstallPrompt()
  
  if (result.outcome === 'accepted') {
    ElMessage.success('开始安装应用...')
  } else if (result.outcome === 'dismissed') {
    ElMessage.info('已取消安装')
  }
  
  showInstallDialog.value = false
  showFloatingButton.value = false
}

function dismissInstall() {
  showInstallDialog.value = false
  
  // 7天后再次提示
  localStorage.setItem('pwa-install-dismissed', Date.now().toString())
}
</script>

<style scoped>
.install-prompt {
  text-align: center;
  padding: 20px;
}

.install-icon {
  margin-bottom: 20px;
  color: #409EFF;
}

.install-prompt h3 {
  margin-bottom: 15px;
  font-size: 18px;
  color: #303133;
}

.install-prompt p {
  margin-bottom: 10px;
  color: #606266;
}

.install-prompt ul {
  text-align: left;
  margin: 15px auto;
  max-width: 280px;
  color: #606266;
}

.install-prompt li {
  margin: 8px 0;
  line-height: 1.5;
}

.floating-install-btn {
  position: fixed;
  bottom: 80px;
  right: 30px;
  background: linear-gradient(135deg, #409EFF 0%, #53a8ff 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 30px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  transition: all 0.3s ease;
}

.floating-install-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.6);
}

.network-status {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  z-index: 2000;
  transition: all 0.3s ease;
}

.network-status.offline {
  background: #FFA500;
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
}
</style>

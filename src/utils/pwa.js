/**
 * PWA工具函数
 */

// 注册 Service Worker
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        '/service-worker.js',
        { scope: '/' }
      );
      
      console.log('[PWA] Service Worker 注册成功:', registration.scope);
      
      // 监听更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('[PWA] 发现新版本');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // 新版本已安装，提示用户刷新
            if (confirm('发现新版本，是否立即更新？')) {
              window.location.reload();
            }
          }
        });
      });
      
      return registration;
    } catch (error) {
      console.error('[PWA] Service Worker 注册失败:', error);
      return null;
    }
  } else {
    console.warn('[PWA] 浏览器不支持 Service Worker');
    return null;
  }
}

// 注销 Service Worker
export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('[PWA] Service Worker 已注销');
  }
}

// 检查是否支持 PWA
export function isPWASupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// 检查是否已安装为 PWA
export function isInstalledPWA() {
  // 检查是否在独立模式运行
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // 检查是否在 iOS Safari 全屏模式
  if (window.navigator.standalone === true) {
    return true;
  }
  
  return false;
}

// 监听 PWA 安装事件
export function setupPWAInstallPrompt() {
  let deferredPrompt = null;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('[PWA] 可以安装应用');
    e.preventDefault();
    deferredPrompt = e;
    
    // 触发自定义事件，通知应用可以显示安装按钮
    window.dispatchEvent(new CustomEvent('pwa-install-available', {
      detail: { prompt: deferredPrompt }
    }));
  });
  
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] 应用已安装');
    deferredPrompt = null;
    
    // 触发自定义事件
    window.dispatchEvent(new Event('pwa-installed'));
  });
  
  return {
    showInstallPrompt: async () => {
      if (!deferredPrompt) {
        return { outcome: 'dismissed', reason: 'no-prompt' };
      }
      
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('[PWA] 用户选择:', outcome);
      deferredPrompt = null;
      
      return { outcome };
    },
    
    hasPrompt: () => !!deferredPrompt,
  };
}

// 检查网络状态
export function isOnline() {
  return navigator.onLine;
}

// 监听网络状态变化
export function setupNetworkListeners(onOnline, onOffline) {
  window.addEventListener('online', () => {
    console.log('[PWA] 网络已连接');
    if (onOnline) onOnline();
  });
  
  window.addEventListener('offline', () => {
    console.log('[PWA] 网络已断开');
    if (onOffline) onOffline();
  });
}

// 请求通知权限
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[PWA] 浏览器不支持通知');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

// 显示本地通知
export function showNotification(title, options = {}) {
  if (!('Notification' in window)) {
    console.warn('[PWA] 浏览器不支持通知');
    return;
  }
  
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      ...options,
    });
  }
}

// 订阅推送通知
export async function subscribePushNotifications(registration) {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        // 这里应该使用实际的 VAPID 公钥
        import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
      ),
    });
    
    console.log('[PWA] 推送通知订阅成功:', subscription);
    return subscription;
  } catch (error) {
    console.error('[PWA] 推送通知订阅失败:', error);
    return null;
  }
}

// 取消订阅推送通知
export async function unsubscribePushNotifications(registration) {
  try {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('[PWA] 推送通知已取消订阅');
      return true;
    }
    return false;
  } catch (error) {
    console.error('[PWA] 取消订阅失败:', error);
    return false;
  }
}

// 工具函数：Base64 转 Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// 预缓存重要资源
export async function precacheAssets(assets) {
  if ('serviceWorker' in navigator && 'caches' in window) {
    try {
      const cache = await caches.open('91writing-assets');
      await cache.addAll(assets);
      console.log('[PWA] 资源预缓存完成');
    } catch (error) {
      console.error('[PWA] 资源预缓存失败:', error);
    }
  }
}

// 清除所有缓存
export async function clearAllCaches() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('[PWA] 所有缓存已清除');
  }
}

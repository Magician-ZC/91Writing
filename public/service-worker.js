// 91Writing PWA Service Worker
const CACHE_NAME = '91writing-v1.0.0';
const RUNTIME_CACHE = '91writing-runtime';

// 需要预缓存的资源
const PRE_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
];

// 安装事件：预缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 安装中...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] 预缓存资源');
        return cache.addAll(PRE_CACHE_URLS);
      })
      .then(() => self.skipWaiting()) // 强制激活新的 Service Worker
  );
});

// 激活事件：清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 激活中...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // 立即控制所有页面
  );
});

// 请求拦截：缓存策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非 GET 请求
  if (request.method !== 'GET') {
    return;
  }

  // API 请求：网络优先，失败时使用缓存
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      networkFirstStrategy(request)
    );
    return;
  }

  // 静态资源：缓存优先
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      cacheFirstStrategy(request)
    );
    return;
  }

  // 其他请求：网络优先
  event.respondWith(
    networkFirstStrategy(request)
  );
});

// 缓存优先策略
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // 后台更新缓存
    fetch(request).then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
    });
    return cachedResponse;
  }
  
  const response = await fetch(request);
  if (response && response.status === 200) {
    cache.put(request, response.clone());
  }
  return response;
}

// 网络优先策略
async function networkFirstStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('[Service Worker] 使用缓存:', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

// 判断是否是静态资源
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// 后台同步
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] 后台同步:', event.tag);
  
  if (event.tag === 'sync-chapters') {
    event.waitUntil(syncChapters());
  }
});

// 同步章节数据
async function syncChapters() {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    const pendingSyncs = await getPendingSyncs();
    
    for (const sync of pendingSyncs) {
      const response = await fetch(sync.url, {
        method: sync.method,
        headers: sync.headers,
        body: JSON.stringify(sync.data),
      });
      
      if (response.ok) {
        await removePendingSync(sync.id);
      }
    }
  } catch (error) {
    console.error('[Service Worker] 同步失败:', error);
  }
}

// 获取待同步数据
async function getPendingSyncs() {
  // 从 IndexedDB 获取待同步数据
  // 这里简化处理，实际应该使用 IndexedDB
  return [];
}

// 移除已同步数据
async function removePendingSync(id) {
  // 从 IndexedDB 移除已同步数据
  // 这里简化处理，实际应该使用 IndexedDB
}

// 推送通知
self.addEventListener('push', (event) => {
  console.log('[Service Worker] 收到推送:', event);
  
  const options = {
    body: event.data ? event.data.text() : '新消息',
    icon: '/vite.svg',
    badge: '/vite.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: '查看',
      },
      {
        action: 'close',
        title: '关闭',
      },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification('91Writing', options)
  );
});

// 通知点击
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] 通知点击:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

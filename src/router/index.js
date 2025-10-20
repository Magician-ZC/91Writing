import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import HomePage from '../views/HomePage.vue'
import PromptsLibrary from '../views/PromptsLibrary.vue'
import NovelManagement from '../views/NovelManagement.vue'
import NovelManagementCloud from '../views/NovelManagementCloud.vue'
import DataMigrationWizard from '../views/DataMigrationWizard.vue'
import NovelListTest from '../views/NovelListTest.vue'
import WritingGoals from '../views/WritingGoals.vue'
import TokenBilling from '../views/TokenBilling.vue'
import ApiConfig from '../views/ApiConfig.vue'
import Settings from '../views/Settings.vue'
import ChapterManagement from '../views/ChapterManagement.vue'
import Writer from '../views/Writer.vue'
import WriterRefactored from '../views/Writer_refactored.vue'
import Home from '../views/Home.vue'
import GenreManagement from '../views/GenreManagement.vue'
import ToolsLibrary from '../views/ToolsLibrary.vue'
import ShortStory from '../views/ShortStory.vue'
import BookAnalysis from '../views/BookAnalysis.vue'
import NovelWizard from '../components/wizard/NovelWizard.vue'
import MaterialManagement from '../views/MaterialManagement.vue'
import MindMapView from '../views/MindMapView.vue'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  // 顶级注册路由（支持邀请链接）
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true, title: '注册 - 91Writing' }
  },
  
  // 认证路由（不需要登录）
  {
    path: '/auth',
    name: 'Auth',
    meta: { requiresGuest: true },
    children: [
      {
        path: 'login',
        name: 'Login',
        component: Login,
        meta: { title: '登录 - 91Writing' }
      },
      {
        path: 'register',
        name: 'AuthRegister', 
        component: Register,
        meta: { title: '注册 - 91Writing' }
      }
    ]
  },
  
  // 独立的后台管理系统
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/AdminLogin.vue'),
    meta: { requiresGuest: true, title: '管理员登录 - 91Writing' }
  },
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/dashboard/AdminDashboard.vue'),
        meta: { title: '管理后台仪表盘 - 91Writing' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/users/UserManagement.vue'),
        meta: { title: '用户管理 - 91Writing' }
      },
      {
        path: 'subscriptions',
        name: 'AdminSubscriptions',
        component: () => import('../views/admin/subscriptions/SubscriptionManagement.vue'),
        meta: { title: '订阅管理 - 91Writing' }
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('../views/admin/orders/OrderManagement.vue'),
        meta: { title: '订单管理 - 91Writing' }
      },
      {
        path: 'packages',
        name: 'AdminPackages',
        component: () => import('../views/admin/packages/PackageManagement.vue'),
        meta: { title: '套餐管理 - 91Writing' }
      },
      {
        path: 'analytics',
        name: 'AdminAnalytics',
        component: () => import('../views/admin/analytics/DataAnalytics.vue'),
        meta: { title: '数据分析 - 91Writing' }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../views/admin/settings/SystemSettings.vue'),
        meta: { title: '系统设置 - 91Writing' }
      }
    ]
  },
  
  // 主应用路由（需要登录）
  {
    path: '/',
    component: Dashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'HomePage',
        component: HomePage,
        meta: { title: '首页 - 91Writing' }
      },
      {
        path: 'prompts',
        name: 'PromptsLibrary',
        component: PromptsLibrary,
        meta: { title: '提示词库 - 91Writing' }
      },
      {
        path: 'novels',
        name: 'NovelManagement',
        component: NovelManagement,
        meta: { title: '作品管理 - 91Writing' }
      },
      {
        path: 'novels-cloud',
        name: 'NovelManagementCloud',
        component: NovelManagementCloud,
        meta: { title: '云端作品管理 - 91Writing' }
      },
      {
        path: 'migration',
        name: 'DataMigration',
        component: DataMigrationWizard,
        meta: { title: '数据迁移 - 91Writing' }
      },
      {
        path: 'novels-test',
        name: 'NovelListTest',
        component: NovelListTest,
        meta: { title: '小说测试 - 91Writing' }
      },
      {
        path: 'goals',
        name: 'WritingGoals',
        component: WritingGoals,
        meta: { title: '写作目标 - 91Writing' }
      },
      {
        path: 'billing',
        name: 'TokenBilling',
        component: TokenBilling,
        meta: { title: '费用统计 - 91Writing' }
      },
      {
        path: 'config',
        name: 'ApiConfig',
        component: ApiConfig,
        meta: { title: 'API配置 - 91Writing' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
        meta: { title: '系统设置 - 91Writing' }
      },
      {
        path: 'chapters',
        name: 'ChapterManagement',
        component: ChapterManagement,
        meta: { title: '章节管理 - 91Writing' }
      },
      {
        path: 'writer',
        name: 'Writer',
        component: Writer,
        meta: { title: '智能写作 - 91Writing' }
      },
      {
        path: 'writer/:id',
        name: 'WriterRefactored',
        component: WriterRefactored,
        meta: { title: '智能写作 - 91Writing' }
      },
      {
        path: 'genres',
        name: 'GenreManagement',
        component: GenreManagement,
        meta: { title: '题材管理 - 91Writing' }
      },
      {
        path: 'tools',
        name: 'ToolsLibrary',
        component: ToolsLibrary,
        meta: { title: '工具库 - 91Writing' }
      },
      {
        path: 'short-story',
        name: 'ShortStory',
        component: ShortStory,
        meta: { title: '短篇创作 - 91Writing' }
      },
      {
        path: 'book-analysis',
        name: 'BookAnalysis',
        component: BookAnalysis,
        meta: { title: '作品分析 - 91Writing' }
      },
      {
        path: 'materials',
        name: 'MaterialManagement',
        component: MaterialManagement,
        meta: { title: '素材管理 - 91Writing' }
      },
      {
        path: 'mindmap/:novelId',
        name: 'MindMapView',
        component: MindMapView,
        meta: { title: '思维导图 - 91Writing' }
      },
      {
        path: 'wizard',
        name: 'NovelWizard',
        component: NovelWizard,
        meta: { title: '创作向导 - 91Writing' }
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('../views/auth/UserProfile.vue'),
        meta: { title: '个人资料 - 91Writing' }
      },
      {
        path: 'data-migration',
        name: 'DataMigration',
        component: () => import('../views/DataMigrationPage.vue'),
        meta: { title: '数据迁移 - 91Writing' }
      },
      {
        path: 'subscription',
        name: 'SubscriptionPlans',
        component: () => import('../views/SubscriptionPlans.vue'),
        meta: { title: '套餐订阅 - 91Writing' }
      },
      {
        path: 'payment/success',
        name: 'PaymentSuccess',
        component: () => import('../views/PaymentSuccess.vue'),
        meta: { title: '支付成功 - 91Writing' }
      },
      {
        path: 'payment/failed',
        name: 'PaymentFailed',
        component: () => import('../views/PaymentFailed.vue'),
        meta: { title: '支付失败 - 91Writing' }
      },
      {
        path: 'invite',
        name: 'InviteCenter',
        component: () => import('../views/InviteCenter.vue'),
        meta: { title: '邀请中心 - 91Writing' }
      }
    ]
  },
  
  // 404页面重定向
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  } else {
    document.title = '91Writing - 智能写作平台'
  }
  
  // 初始化认证状态（仅在首次加载时）
  if (!authStore.isAuthenticated && !authStore.loading) {
    await authStore.initAuth()
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // 未登录，重定向到登录页面
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // 检查用户状态
    if (!authStore.isActive) {
      // 用户被禁用
      await authStore.logout()
      next({
        name: 'Login',
        query: { message: '账户已被禁用，请联系管理员' }
      })
      return
    }
  }
  
  // 检查是否需要游客状态（未登录）
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // 已登录用户访问登录/注册页面
    // 如果是管理员访问管理员登录页，重定向到管理后台
    if (to.name === 'AdminLogin' && authStore.isAdmin) {
      next('/admin/dashboard')
      return
    }
    // 普通用户访问登录页，重定向到首页
    if (to.name === 'Login' || to.name === 'Register' || to.name === 'AuthRegister') {
      next('/')
      return
    }
    // 其他情况也需要调用 next()
    next()
    return
  }
  
  // 检查管理员权限
  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated) {
      // 未登录，重定向到管理员登录页
      next({
        name: 'AdminLogin',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    if (!authStore.isAdmin) {
      console.log('管理员权限检查失败:', {
        requiresAdmin: to.meta.requiresAdmin,
        isAdmin: authStore.isAdmin,
        user: authStore.user,
        userRole: authStore.userRole
      })
      next({
        name: 'HomePage',
        query: { message: '权限不足' }
      })
      return
    }
  }
  
  next()
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
})

export default router
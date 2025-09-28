import { apiManager } from './apiManager'

class PackageService {
  constructor() {
    this.baseURL = '/packages'
  }

  /**
   * 获取可用套餐列表
   */
  async getActivePackages() {
    try {
      const response = await apiManager.request({
        method: 'GET',
        endpoint: `${this.baseURL}/active`
      })
      return response
    } catch (error) {
      console.error('获取套餐列表失败:', error)
      throw error
    }
  }

  /**
   * 获取所有套餐列表（管理员）
   */
  async getAllPackages(params = {}) {
    try {
      const response = await apiManager.request({
        method: 'GET',
        endpoint: this.baseURL,
        params
      })
      return response
    } catch (error) {
      console.error('获取全部套餐列表失败:', error)
      throw error
    }
  }

  /**
   * 获取套餐详情
   */
  async getPackage(id) {
    try {
      const response = await apiManager.request({
        method: 'GET',
        endpoint: `${this.baseURL}/${id}`
      })
      return response
    } catch (error) {
      console.error('获取套餐详情失败:', error)
      throw error
    }
  }

  /**
   * 创建套餐（管理员）
   */
  async createPackage(data) {
    try {
      const response = await apiManager.request({
        method: 'POST',
        endpoint: this.baseURL,
        data
      })
      return response
    } catch (error) {
      console.error('创建套餐失败:', error)
      throw error
    }
  }

  /**
   * 更新套餐（管理员）
   */
  async updatePackage(id, data) {
    try {
      const response = await apiManager.request({
        method: 'PATCH',
        endpoint: `${this.baseURL}/${id}`,
        data
      })
      return response
    } catch (error) {
      console.error('更新套餐失败:', error)
      throw error
    }
  }

  /**
   * 删除套餐（管理员）
   */
  async deletePackage(id) {
    try {
      const response = await apiManager.request({
        method: 'DELETE',
        endpoint: `${this.baseURL}/${id}`
      })
      return response
    } catch (error) {
      console.error('删除套餐失败:', error)
      throw error
    }
  }

  /**
   * 获取套餐功能配置
   */
  getPackageFeatures(packageData) {
    if (!packageData?.features) return {}
    
    const features = packageData.features
    return {
      maxNovels: features.maxNovels || 1,
      maxChaptersPerNovel: features.maxChaptersPerNovel || 10,
      aiGenerationLimit: features.aiGenerationLimit || 10,
      advancedFeatures: features.advancedFeatures || false,
      customPrompts: features.customPrompts || false,
      prioritySupport: features.prioritySupport || false,
      dataBackup: features.dataBackup || false,
      exportFormats: features.exportFormats || ['txt'],
      collaborativeEditing: features.collaborativeEditing || false,
      apiAccess: features.apiAccess || false
    }
  }

  /**
   * 检查功能是否可用
   */
  checkFeatureAvailable(packageData, featureName) {
    const features = this.getPackageFeatures(packageData)
    return !!features[featureName]
  }

  /**
   * 获取套餐级别
   */
  getPackageLevel(packageName) {
    if (!packageName) return 'free'
    
    const name = packageName.toLowerCase()
    if (name.includes('pro') || name.includes('专业')) return 'pro'
    if (name.includes('premium') || name.includes('高级')) return 'premium'
    if (name.includes('basic') || name.includes('基础')) return 'basic'
    return 'free'
  }

  /**
   * 比较套餐级别
   */
  comparePackageLevel(currentLevel, requiredLevel) {
    const levels = { free: 0, basic: 1, premium: 2, pro: 3 }
    return levels[currentLevel] >= levels[requiredLevel]
  }

  /**
   * 获取推荐套餐
   */
  getRecommendedPackage(packages) {
    if (!packages || packages.length === 0) return null
    
    // 找到标记为推荐的套餐
    const recommended = packages.find(pkg => 
      pkg.name.toLowerCase().includes('premium') ||
      pkg.name.toLowerCase().includes('推荐')
    )
    
    if (recommended) return recommended
    
    // 如果没有推荐标记，返回中等价位的套餐
    const sorted = packages.sort((a, b) => a.price - b.price)
    const middle = Math.floor(sorted.length / 2)
    return sorted[middle]
  }

  /**
   * 计算套餐性价比
   */
  calculateValue(packageData) {
    if (!packageData) return 0
    
    const features = this.getPackageFeatures(packageData)
    const price = parseFloat(packageData.price)
    const days = parseInt(packageData.durationDays)
    
    // 计算功能分数
    let featureScore = 0
    featureScore += features.maxNovels * 10
    featureScore += features.maxChaptersPerNovel * 1
    featureScore += features.aiGenerationLimit * 0.1
    featureScore += features.advancedFeatures ? 50 : 0
    featureScore += features.customPrompts ? 30 : 0
    featureScore += features.prioritySupport ? 20 : 0
    featureScore += features.dataBackup ? 25 : 0
    
    // 计算每日价值
    const dailyValue = featureScore / (price / days)
    return Math.round(dailyValue * 100) / 100
  }

  /**
   * 格式化价格显示
   */
  formatPrice(price, currency = '¥') {
    return `${currency}${parseFloat(price).toFixed(2)}`
  }

  /**
   * 格式化时长显示
   */
  formatDuration(days) {
    if (days < 7) return `${days}天`
    if (days < 30) return `${Math.floor(days / 7)}周`
    if (days < 365) return `${Math.floor(days / 30)}个月`
    return `${Math.floor(days / 365)}年`
  }
}

export const packageService = new PackageService()

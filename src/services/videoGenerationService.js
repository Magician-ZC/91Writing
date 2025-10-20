import apiManager from './apiManager'

/**
 * 视频生成服务
 */
class VideoGenerationService {
  /**
   * 生成章节视频
   * @param {Object} params 生成参数
   * @param {string} params.chapterId 章节ID
   * @param {number} params.sceneCount 分镜数量
   * @param {number} params.videoDuration 视频时长
   * @param {string} params.visualStyle 视觉风格
   * @param {boolean} params.forceRegenerate 是否强制重新生成
   */
  async generateVideo(params) {
    try {
      const response = await apiManager.post('/ai/video-generation/generate', params)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '视频生成请求失败')
    }
  }

  /**
   * 查询视频生成状态
   * @param {string} chapterId 章节ID
   */
  async getVideoStatus(chapterId) {
    try {
      const response = await apiManager.get(`/ai/video-generation/status/${chapterId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取视频状态失败')
    }
  }

  /**
   * 删除章节视频
   * @param {string} chapterId 章节ID
   */
  async deleteVideo(chapterId) {
    try {
      // 通过novel service的章节接口删除
      // 注意：需要从章节信息中获取novelId
      const response = await apiManager.delete(`/novel/chapters/${chapterId}/video`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '删除视频失败')
    }
  }

  /**
   * 批量生成视频
   * @param {string} novelId 小说ID
   * @param {Array<string>} chapterIds 章节ID列表
   * @param {Object} options 生成选项
   */
  async batchGenerateVideos(novelId, chapterIds, options = {}) {
    try {
      const tasks = chapterIds.map(chapterId => 
        this.generateVideo({
          chapterId,
          ...options
        })
      )

      // 并发控制：一次最多3个
      const results = []
      for (let i = 0; i < tasks.length; i += 3) {
        const batch = tasks.slice(i, i + 3)
        const batchResults = await Promise.allSettled(batch)
        results.push(...batchResults)
      }

      return results
    } catch (error) {
      throw new Error('批量生成视频失败')
    }
  }

  /**
   * 获取视频元数据
   * @param {string} videoUrl 视频URL
   */
  async getVideoMetadata(videoUrl) {
    // 通过创建video元素获取元数据
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.src = videoUrl
      
      video.onloadedmetadata = () => {
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          ratio: video.videoWidth / video.videoHeight
        })
      }
      
      video.onerror = () => {
        reject(new Error('无法加载视频元数据'))
      }
    })
  }

  /**
   * 下载视频
   * @param {string} videoUrl 视频URL
   * @param {string} filename 文件名
   */
  async downloadVideo(videoUrl, filename = 'video.mp4') {
    try {
      const response = await fetch(videoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(url)
    } catch (error) {
      throw new Error('下载视频失败')
    }
  }
}

export const videoGenerationService = new VideoGenerationService()
export default videoGenerationService


/**
 * 文生图请求参数
 */
export interface TextToImageRequest {
  prompt: string; // 正向提示词
  negativePrompt?: string; // 负向提示词
  width?: number; // 图片宽度
  height?: number; // 图片高度
  seed?: number; // 随机种子
  steps?: number; // 迭代步数
  cfgScale?: number; // CFG参数
  sampler?: string; // 采样器
  referenceImage?: string; // 参考图URL(用于一致性)
  referenceWeight?: number; // 参考图权重
  batchSize?: number; // 批量生成数量
}

/**
 * 文生图响应结果
 */
export interface TextToImageResponse {
  success: boolean;
  images: string[]; // 生成的图片URL列表
  seed?: number; // 使用的种子值
  duration: number; // 生成耗时(秒)
  metadata?: {
    model: string;
    resolution: string;
    steps: number;
    [key: string]: any;
  };
  error?: string;
}

/**
 * 图生视频请求参数
 */
export interface ImageToVideoRequest {
  imageUrl: string; // 输入图片URL
  motionPrompt: string; // 运动提示词
  duration: number; // 视频时长(秒)
  motionIntensity?: 'low' | 'medium' | 'high'; // 运动幅度
  fps?: number; // 帧率
  resolution?: string; // 分辨率
  characterId?: string; // 人物一致性ID
  seed?: number; // 随机种子
}

/**
 * 图生视频响应结果
 */
export interface ImageToVideoResponse {
  success: boolean;
  taskId?: string; // 任务ID(异步任务)
  videoUrl?: string; // 视频URL(同步任务)
  status: 'pending' | 'processing' | 'completed' | 'failed';
  duration?: number; // 耗时(秒)
  metadata?: {
    model: string;
    resolution: string;
    fps: number;
    duration: number;
    [key: string]: any;
  };
  error?: string;
}

/**
 * 任务状态查询响应
 */
export interface TaskStatusResponse {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number; // 进度 0-100
  result?: {
    videoUrl?: string;
    imageUrls?: string[];
    [key: string]: any;
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedTimeRemaining?: number; // 预计剩余时间(秒)
}

/**
 * 文生图Provider接口
 */
export interface ITextToImageProvider {
  /**
   * 生成图片
   */
  generateImage(request: TextToImageRequest): Promise<TextToImageResponse>;

  /**
   * 批量生成图片
   */
  generateImageBatch(requests: TextToImageRequest[]): Promise<TextToImageResponse[]>;

  /**
   * 检查服务可用性
   */
  checkHealth(): Promise<boolean>;
}

/**
 * 图生视频Provider接口
 */
export interface IImageToVideoProvider {
  /**
   * 提交图生视频任务
   */
  submitVideoTask(request: ImageToVideoRequest): Promise<ImageToVideoResponse>;

  /**
   * 查询任务状态
   */
  queryTaskStatus(taskId: string): Promise<TaskStatusResponse>;

  /**
   * 等待任务完成(轮询)
   */
  waitForTaskCompletion(taskId: string, timeout?: number): Promise<ImageToVideoResponse>;

  /**
   * 取消任务
   */
  cancelTask(taskId: string): Promise<boolean>;

  /**
   * 检查服务可用性
   */
  checkHealth(): Promise<boolean>;
}


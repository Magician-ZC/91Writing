import { All, Controller, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { NovelService } from './novel.service';

@ApiTags('Novel Service Proxy')
@Controller()
export class NovelController {
  constructor(private readonly novelService: NovelService) {}

  // 代理所有novels相关请求
  @All('novels*')
  async proxyNovels(@Req() req: Request, @Res() res: Response) {
    return this.proxyToNovelService(req, res);
  }

  // 代理所有chapters相关请求
  @All('chapters*')
  async proxyChapters(@Req() req: Request, @Res() res: Response) {
    return this.proxyToNovelService(req, res);
  }

  // 代理所有memories相关请求
  @All('memories*')
  async proxyMemories(@Req() req: Request, @Res() res: Response) {
    return this.proxyToNovelService(req, res);
  }

  // 代理所有materials相关请求
  @All('materials*')
  async proxyMaterials(@Req() req: Request, @Res() res: Response) {
    return this.proxyToNovelService(req, res);
  }

  // 代理所有prompts相关请求
  @All('prompts*')
  async proxyPrompts(@Req() req: Request, @Res() res: Response) {
    return this.proxyToNovelService(req, res);
  }

  // 代理所有collaboration相关请求
  @All('collaboration*')
  async proxyCollaboration(@Req() req: Request, @Res() res: Response) {
    return this.proxyToNovelService(req, res);
  }

  // 代理所有versions相关请求
  @All('versions*')
  async proxyVersions(@Req() req: Request, @Res() res: Response) {
    return this.proxyToNovelService(req, res);
  }

  // 代理所有comments相关请求
  @All('comments*')
  async proxyComments(@Req() req: Request, @Res() res: Response) {
    return this.proxyToNovelService(req, res);
  }

  private async proxyToNovelService(req: Request, res: Response) {
    try {
      // req.path already includes /api/v1/ from gateway's global prefix
      // Just forward to novel service as is
      const path = req.path;
      const result = await this.novelService.proxyRequest(
        path,
        req.method,
        req.headers,
        req.body,
        req.query,
      );
      
      return res.status(200).json(result);
    } catch (error) {
      const status = error.statusCode || error.status || 500;
      const message = error.message || 'Internal Server Error';
      return res.status(status).json(error);
    }
  }
}

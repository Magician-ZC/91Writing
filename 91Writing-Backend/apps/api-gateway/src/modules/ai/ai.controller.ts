import { Controller, All, Req, Res } from '@nestjs/common';
import { ApiTags, ApiExcludeController } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AiService } from './ai.service';

@ApiTags('ai')
@ApiExcludeController()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @All('*')
  async proxyToAiService(@Req() req: Request, @Res() res: Response) {
    return this.aiService.forwardRequest(req, res);
  }
}


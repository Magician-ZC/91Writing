import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ValidationPipe,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common/guards';
import { AssistantService } from './assistant.service';
import { InitializeSessionDto, ConversationDto } from '../../dto/conversation.dto';
import { GeneralChatDto } from './dto/general-chat.dto';
import { GeneralChatStreamDto } from './dto/general-chat-stream.dto';

@ApiTags('AI助手')
@ApiBearerAuth('JWT-auth')
@Controller('assistant')
@UseGuards(JwtAuthGuard)
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('sessions')
  async initializeSession(
    @Request() req,
    @Body(ValidationPipe) initDto: InitializeSessionDto,
  ) {
    return this.assistantService.initializeSession(req.user.id, initDto);
  }

  @Post('chat')
  async handleConversation(
    @Request() req,
    @Body(ValidationPipe) conversationDto: ConversationDto,
  ) {
    return this.assistantService.handleConversation(req.user.id, conversationDto);
  }

  @Get('sessions/:sessionId/history')
  async getConversationHistory(
    @Request() req,
    @Param('sessionId') sessionId: string,
  ) {
    return this.assistantService.getConversationHistory(req.user.id, sessionId);
  }

  @Post('sessions/cleanup')
  async cleanupSessions() {
    this.assistantService.cleanupSessions();
    return { message: '会话清理完成' };
  }

  @Post('general')
  @ApiOperation({ 
    summary: '通用AI对话',
    description: '不关联具体小说的通用AI对话，用于题材分析、创意生成等场景'
  })
  @ApiResponse({
    status: 200,
    description: 'AI响应成功',
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', example: 'AI的回复内容...' },
        model: { type: 'string', example: 'deepseek-chat' },
        provider: { type: 'string', example: 'DEEPSEEK' },
        tokensUsed: { type: 'number', example: 1250 }
      }
    }
  })
  async generalChat(
    @Request() req,
    @Body(ValidationPipe) chatDto: GeneralChatDto,
  ) {
    return this.assistantService.generalChat(req.user.id, chatDto);
  }

  @Post('general/stream')
  @ApiOperation({ 
    summary: '通用AI对话（流式）',
    description: '流式输出，实时返回AI生成的内容，逐字符推送'
  })
  async generalChatStream(
    @Request() req,
    @Body(ValidationPipe) chatDto: GeneralChatStreamDto,
    @Res() res: Response,
  ) {
    // 设置响应头为流式传输
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.status(HttpStatus.OK);

    try {
      // 逐块写入响应
      for await (const chunk of this.assistantService.generalChatStream(req.user.id, chatDto)) {
        res.write(chunk); // 立即发送每个chunk
      }
      
      res.end(); // 结束响应
    } catch (error) {
      res.write(`\n\nERROR: ${error.message}`);
      res.end();
    }
  }
}

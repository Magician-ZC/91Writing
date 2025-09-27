import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/common/guards';
import { AssistantService } from './assistant.service';
import { InitializeSessionDto, ConversationDto } from '../../dto/conversation.dto';

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
}

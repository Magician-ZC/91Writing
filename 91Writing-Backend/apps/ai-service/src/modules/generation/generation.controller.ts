import { Controller, Post, Body, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '@app/common/guards';
import { GenerationService } from './generation.service';
import { GenerateContentDto } from '../../dto/conversation.dto';

@Controller('generation')
@UseGuards(JwtAuthGuard)
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post('content')
  async generateContent(
    @Request() req,
    @Body(ValidationPipe) dto: GenerateContentDto,
  ) {
    return this.generationService.generateContent(req.user.id, dto);
  }
}

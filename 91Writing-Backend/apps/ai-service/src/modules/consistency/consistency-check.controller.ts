import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common';
import { ConsistencyCheckService } from './consistency-check.service';
import { CreateConsistencyCheckDto } from './dto/create-consistency-check.dto';
import { ResolveIssueDto } from './dto/resolve-issue.dto';

@ApiTags('一致性检测')
@Controller()  // ⚠️ 微服务不添加前缀
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ConsistencyCheckController {
  constructor(
    private readonly consistencyService: ConsistencyCheckService
  ) {}

  @Post('novels/:novelId/consistency-check')
  @ApiOperation({ summary: '创建一致性检测任务' })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiResponse({ status: 201, description: '检测任务创建成功，将异步执行' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 404, description: '小说不存在' })
  async createCheck(
    @Request() req,
    @Param('novelId') novelId: string,
    @Body(ValidationPipe) createDto: CreateConsistencyCheckDto,
  ) {
    return this.consistencyService.createCheck(req.user.id, novelId, createDto);
  }

  @Get('novels/:novelId/consistency-checks')
  @ApiOperation({ summary: '获取一致性检测历史' })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getHistory(
    @Request() req,
    @Param('novelId') novelId: string,
  ) {
    return this.consistencyService.getCheckHistory(req.user.id, novelId);
  }

  @Get('consistency-checks/:checkId')
  @ApiOperation({ summary: '获取检测结果详情' })
  @ApiParam({ name: 'checkId', description: '检测记录ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '检测记录不存在' })
  async getCheckResult(
    @Request() req,
    @Param('checkId') checkId: string,
  ) {
    return this.consistencyService.getCheckResult(req.user.id, checkId);
  }

  @Patch('consistency-issues/:issueId/resolve')
  @ApiOperation({ summary: '解决/处理一致性问题' })
  @ApiParam({ name: 'issueId', description: '问题ID' })
  @ApiResponse({ status: 200, description: '处理成功' })
  @ApiResponse({ status: 404, description: '问题不存在' })
  @HttpCode(HttpStatus.OK)  // ⚠️ PATCH返回200
  async resolveIssue(
    @Request() req,
    @Param('issueId') issueId: string,
    @Body(ValidationPipe) resolveDto: ResolveIssueDto,
  ) {
    return this.consistencyService.resolveIssue(req.user.id, issueId, resolveDto);
  }
}


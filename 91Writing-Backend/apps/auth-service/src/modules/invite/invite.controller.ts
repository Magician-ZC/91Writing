import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { InviteService } from './invite.service';
import { JwtAuthGuard } from '@app/common';

@ApiTags('邀请系统')
@Controller('invite')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Get('my-code')
  @ApiOperation({ 
    summary: '获取我的邀请码',
    description: '获取当前用户的专属邀请码'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            inviteCode: { type: 'string', example: 'ABC123' },
            inviteCount: { type: 'number', example: 5 },
            shareUrl: { type: 'string', example: 'https://91writing.com/register?invite=ABC123' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: '无效的访问令牌',
  })
  async getMyInviteCode(@Request() req): Promise<any> {
    return this.inviteService.getMyInviteCode(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: '获取邀请统计',
    description: '获取当前用户的邀请统计信息'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
  })
  async getInviteStats(@Request() req): Promise<any> {
    return this.inviteService.getInviteStats(req.user.id);
  }

  @Get('rewards')
  @ApiOperation({ 
    summary: '获取邀请奖励记录',
    description: '获取当前用户的邀请奖励记录'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
  })
  async getInviteRewards(@Request() req): Promise<any> {
    return this.inviteService.getInviteRewards(req.user.id);
  }

  @Get('invitees')
  @ApiOperation({ 
    summary: '获取邀请的用户列表',
    description: '获取当前用户邀请的用户列表'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
  })
  async getInvitees(@Request() req): Promise<any> {
    return this.inviteService.getInvitees(req.user.id);
  }

  @Post('claim-reward')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '领取邀请奖励',
    description: '手动领取待发放的邀请奖励'
  })
  @ApiResponse({
    status: 200,
    description: '领取成功',
  })
  async claimReward(@Request() req, @Body() body: { rewardId: string }): Promise<any> {
    return this.inviteService.claimReward(req.user.id, body.rewardId);
  }
}

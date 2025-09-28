import { Module } from '@nestjs/common';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';
import { InviteRewardService } from './invite-reward.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  controllers: [InviteController],
  providers: [InviteService, InviteRewardService],
  exports: [InviteService, InviteRewardService],
})
export class InviteModule {}

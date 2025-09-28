import { Module } from '@nestjs/common';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  controllers: [InviteController],
  providers: [InviteService],
  exports: [InviteService],
})
export class InviteModule {}

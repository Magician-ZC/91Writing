import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { AuthModule } from '@app/auth';
import { ConsistencyController } from './consistency.controller';
import { ConsistencyService } from './consistency.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ConsistencyController],
  providers: [ConsistencyService],
  exports: [ConsistencyService],
})
export class ConsistencyModule {}


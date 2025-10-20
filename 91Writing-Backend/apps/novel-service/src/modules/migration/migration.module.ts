import { Module } from '@nestjs/common';
import { MigrationController } from './migration.controller';
import { MigrationService } from './migration.service';
import { DatabaseModule } from '@app/database';
import { JwtAuthGuard } from '@app/common/guards';

@Module({
  imports: [DatabaseModule],
  controllers: [MigrationController],
  providers: [MigrationService, JwtAuthGuard],
  exports: [MigrationService],
})
export class MigrationModule {}


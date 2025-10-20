import { Module } from '@nestjs/common';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';
import { DatabaseModule } from '@app/database';
import { JwtAuthGuard } from '@app/common/guards';

@Module({
  imports: [DatabaseModule],
  controllers: [MaterialController],
  providers: [MaterialService, JwtAuthGuard],
  exports: [MaterialService],
})
export class MaterialModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { ConsistencyCheckController } from './consistency-check.controller';
import { ConsistencyCheckService } from './consistency-check.service';
import { JwtStrategy } from '../../strategies/jwt.strategy';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule,
    ConfigModule,
  ],
  controllers: [ConsistencyCheckController],
  providers: [ConsistencyCheckService, JwtStrategy],
  exports: [ConsistencyCheckService],
})
export class ConsistencyModule {}


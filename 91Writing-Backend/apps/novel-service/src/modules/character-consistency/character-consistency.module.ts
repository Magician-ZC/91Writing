import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { CharacterConsistencyController } from './character-consistency.controller';
import { CharacterConsistencyService } from './character-consistency.service';
import { JwtStrategy } from '../../strategies/jwt.strategy';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule,
    ConfigModule,
  ],
  controllers: [CharacterConsistencyController],
  providers: [CharacterConsistencyService, JwtStrategy],
  exports: [CharacterConsistencyService],
})
export class CharacterConsistencyModule {}


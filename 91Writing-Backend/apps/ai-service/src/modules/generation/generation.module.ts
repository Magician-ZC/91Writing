import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GenerationService } from './generation.service';
import { GenerationController } from './generation.controller';
import { AICallerService } from '../../services/ai-caller.service';
import { ContextManagerService } from '../../services/context-manager.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USER_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.USER_SERVICE_PORT) || 3004,
        },
      },
    ]),
  ],
  controllers: [GenerationController],
  providers: [GenerationService, AICallerService, ContextManagerService],
  exports: [GenerationService],
})
export class GenerationModule {}

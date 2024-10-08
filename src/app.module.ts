import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProducerModule } from './producer/producer.module';
import { ProducerController } from './producer/producer.controller';

@Module({
  imports: [ProducerModule],
  controllers: [AppController, ProducerController],
  providers: [AppService],
})
export class AppModule {}

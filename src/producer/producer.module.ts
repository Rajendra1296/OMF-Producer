import { Module } from '@nestjs/common';
import { ProducerController } from './producer.controller';
import { ProducerService } from './producer.service';
import { SqsModule } from '@ssut/nestjs-sqs';

@Module({
  imports: [
    SqsModule.register({
      consumers: [],
      producers: [
        {
          name: 'TASKOMF',
          queueUrl: 'https://sqs.us-east-1.amazonaws.com/484907524104/TASKOMF',
          region: 'us-east-1',
        },
      ],
    }),
  ],
  controllers: [ProducerController],
  providers: [ProducerService],
  exports: [ProducerService],
})
export class ProducerModule {}

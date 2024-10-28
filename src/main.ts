import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as AWSXRay from 'aws-xray-sdk';
dotenv.config();
async function bootstrap() {
  AWSXRay.captureAWS(require('aws-sdk'));
  AWSXRay.setDaemonAddress('52.91.247.140:2000');

  const app = await NestFactory.create(AppModule);

  app.use(AWSXRay.express.openSegment('nestjs-xray-example'));
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('OMF_USER')
    .setDescription('API for user senario')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('OMF', app, document);

  await app.listen(3006);
  app.use(AWSXRay.express.closeSegment());
}
bootstrap();

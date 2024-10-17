import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProducerModule } from './producer/producer.module';
import { ProducerController } from './producer/producer.controller';
// import { AdminController } from './Admin/admin.controller';
// import { AdminService } from './Admin/admin.service';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [ProducerModule, AdminModule],
  controllers: [AppController, ProducerController],
  providers: [AppService],
})
export class AppModule {}

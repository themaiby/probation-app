import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppModule } from './app/app.module';
import { ConfigModule } from './core/config/config.module';
import { DatabaseModule } from './core/database/database.module';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule, DatabaseModule, AppModule],
  controllers: [],
  providers: [],
})
export class MainModule {}

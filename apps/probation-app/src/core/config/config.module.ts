import { Module } from '@nestjs/common';
import { ConfigModule as BaseConfigModule } from '@nestjs/config';
import { appConfig } from './app.config';
import { dbConfig } from './db.config';
import { probationApiConfig } from './probation-api.config';
import { redisConfig } from './redis.conf';

@Module({
  imports: [
    BaseConfigModule.forRoot({
      load: [appConfig, dbConfig, redisConfig, probationApiConfig],
      isGlobal: true,
      cache: true,
    }),
  ],
})
export class ConfigModule {}

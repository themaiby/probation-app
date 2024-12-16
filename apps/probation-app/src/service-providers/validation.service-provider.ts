import { ValidationPipe } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { appConfig } from '../core/config/app.config';
import { BaseServiceProvider } from './base-service-provider';

export class ValidationServiceProvider extends BaseServiceProvider {
  public constructor(
    protected readonly app: NestExpressApplication,
    protected readonly appConf: ConfigType<typeof appConfig>,
  ) {
    super(app, appConf);
  }

  public async register(): Promise<void> {
    const validationPipe = new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true, exposeDefaultValues: true },
    });

    this.app.useGlobalPipes(validationPipe);
  }
}

import { Logger, NotImplementedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { appConfig } from '../core/config/app.config';

export type ServiceProviderList = (typeof BaseServiceProvider)[];

export class BaseServiceProvider {
  protected logger: Logger;

  public constructor(
    protected readonly app: NestExpressApplication,
    protected readonly appConf: ConfigType<typeof appConfig>,
  ) {
    this.setupLogger();
  }

  public async beforeRegistrationHook() {
    this.logger.log(`Started initialization for ${this.constructor.name}`);
  }

  public async afterRegistrationHook() {
    this.logger.log(`ServiceProvider ${this.constructor.name} initialized`);
  }

  public async register() {
    throw new NotImplementedException(`Method "register()" not implemented for ${this.constructor.name}`);
  }

  private setupLogger() {
    this.logger = new Logger(this.constructor.name);
  }
}

import { Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { appConfig } from './core/config/app.config';
import { MainModule } from './main.module';
import { BaseServiceProvider } from './service-providers/base-service-provider';
import { SwaggerServiceProvider } from './service-providers/swagger.service-provider';
import { ValidationServiceProvider } from './service-providers/validation.service-provider';

const serviceProviders: (typeof BaseServiceProvider)[] = [ValidationServiceProvider, SwaggerServiceProvider];

const registerServiceProviders = async (app: NestExpressApplication, appConf: ConfigType<typeof appConfig>) => {
  const providers = serviceProviders.map(async (sp) => {
    const provider = new sp(app, appConf);

    await provider.beforeRegistrationHook();
    await provider.register();
    await provider.afterRegistrationHook();
  });

  await Promise.all(providers);
};

const bootstrap = async () => {
  const globalPrefix = 'api';

  const app = await NestFactory.create<NestExpressApplication>(MainModule, new ExpressAdapter(), { bufferLogs: true });
  const config = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  app.setGlobalPrefix(globalPrefix);

  await registerServiceProviders(app, config);
  await app.listen(config.port);

  Logger.log(`${config.name} is running on: http://localhost:${config.port}/${globalPrefix}`);
};

void bootstrap();

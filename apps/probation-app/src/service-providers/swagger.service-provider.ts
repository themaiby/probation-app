import { ConfigType } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as process from 'node:process';
import * as path from 'path';
import * as yaml from 'yaml';
import { appConfig } from '../core/config/app.config';
import { BaseServiceProvider } from './base-service-provider';

export class SwaggerServiceProvider extends BaseServiceProvider {
  private readonly path = `/docs`;

  public constructor(
    protected readonly app: NestExpressApplication,
    protected readonly appConf: ConfigType<typeof appConfig>,
  ) {
    super(app, appConf);
  }

  public async register() {
    const document = SwaggerModule.createDocument(
      this.app,
      new DocumentBuilder().addBearerAuth().setTitle(this.appConf.name).build(),
    );

    this.toYAML(document);

    SwaggerModule.setup(this.path, this.app, document);

    this.logger.log(`Swagger is running on: http://127.0.0.1:${this.appConf.port}${this.path}`);
  }

  protected toYAML(document: OpenAPIObject) {
    const yamlString: string = yaml.stringify(document, {});

    fs.writeFileSync(path.join(process.cwd(), './swagger.yaml'), yamlString);
  }
}

import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { get } from 'lodash';
import * as process from 'node:process';
import { registerValidatedEnvConfig } from '../utils/register-env-config.util';

class AppConfig {
  @IsNotEmpty()
  @IsString()
  public readonly name: string = get(process.env, 'APP_NAME');

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(65535)
  public readonly port: number = +get(process.env, 'APP_PORT', 3000);
}

export const appConfig = registerValidatedEnvConfig(AppConfig);

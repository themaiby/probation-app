import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { get } from 'lodash';
import * as process from 'node:process';
import { registerValidatedEnvConfig } from '../utils/register-env-config.util';

class RedisConf {
  @IsNotEmpty()
  @IsString()
  public readonly host: string = get(process.env, 'REDIS_HOST');

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(65535)
  public readonly port: number = +get(process.env, 'REDIS_PORT');
}

export const redisConfig = registerValidatedEnvConfig(RedisConf);

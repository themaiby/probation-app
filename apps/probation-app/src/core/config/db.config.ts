import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { get } from 'lodash';
import * as process from 'node:process';
import { registerValidatedEnvConfig } from '../utils/register-env-config.util';

class DbConfig {
  @IsNotEmpty()
  @IsString()
  public readonly host: string = get(process.env, 'DB_HOST');

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(65535)
  public readonly port: number = +get(process.env, 'DB_PORT');

  @IsNotEmpty()
  @IsString()
  public readonly user: string = get(process.env, 'DB_USER');

  @IsNotEmpty()
  @IsString()
  public readonly password: string = get(process.env, 'DB_PASSWORD');

  @IsNotEmpty()
  @IsString()
  public readonly database: string = get(process.env, 'DB_DATABASE');

  @IsNotEmpty()
  @IsString()
  public readonly schema: string = get(process.env, 'DB_SCHEMA', 'public');

  @IsNotEmpty()
  @IsNumber()
  public readonly cacheDurationMs: number = +get(process.env, 'DB_CACHE_DURATION_MS', 60000);
}

export const dbConfig = registerValidatedEnvConfig(DbConfig);

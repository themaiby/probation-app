import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { get } from 'lodash';
import * as process from 'node:process';
import { registerValidatedEnvConfig } from '../utils/register-env-config.util';

class ProbationApiConfig {
  @IsNotEmpty()
  @IsUrl()
  public readonly baseURL = get(process.env, 'PROBATION_API_URL');

  @IsNotEmpty()
  @IsString()
  public readonly apiKey = get(process.env, 'PROBATION_API_KEY');

  @IsNotEmpty()
  @IsString()
  // can be added custom IsCron validation
  public readonly cronTab: string = get(process.env, 'PROBATION_API_FETCH_CRONTAB');
}

export const probationApiConfig = registerValidatedEnvConfig(ProbationApiConfig);

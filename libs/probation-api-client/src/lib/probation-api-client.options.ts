import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

export const API_KEY_HEADER = 'x-api-key' as const;
export const OPTIONS_TOKEN = Symbol('PROBATION_API_CLIENT_OPTIONS');

export interface ProbationApiClientOptions {
  baseURL: string;
  apiKey: string;
}

export type ProbationApiClientAsyncOptions = Pick<ModuleMetadata, 'imports' | 'providers'> &
  Pick<FactoryProvider<ProbationApiClientOptions>, 'useFactory' | 'inject'>;

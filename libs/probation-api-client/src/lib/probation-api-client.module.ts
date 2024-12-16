import { HttpModule } from '@nestjs/axios';
import { DynamicModule, FactoryProvider, Module } from '@nestjs/common';
import {
  API_KEY_HEADER,
  OPTIONS_TOKEN,
  ProbationApiClientAsyncOptions,
  ProbationApiClientOptions,
} from './probation-api-client.options';
import { ProbationApiClient } from './probation-api.client';

/**
 * Exports preconfigured ProbationApiClient
 */
@Module({})
export class ProbationApiClientModule {
  public static forFeature(options: ProbationApiClientOptions): DynamicModule {
    return {
      module: ProbationApiClientModule,
      imports: [
        HttpModule.register({
          baseURL: options.baseURL,
          headers: { [API_KEY_HEADER]: options.apiKey },
        }),
      ],
      providers: [ProbationApiClient],
      exports: [ProbationApiClient],
    };
  }

  public static forFeatureAsync(options: ProbationApiClientAsyncOptions): DynamicModule {
    const asyncOptionsProvider: FactoryProvider<ProbationApiClientOptions> = {
      provide: OPTIONS_TOKEN,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: ProbationApiClientModule,
      imports: [
        ...(options.imports || []),
        HttpModule.registerAsync({
          imports: [
            {
              module: ProbationApiClientModule,
              providers: [asyncOptionsProvider],
              exports: [asyncOptionsProvider],
            },
          ],
          inject: [OPTIONS_TOKEN],
          useFactory: (resolvedOptions: ProbationApiClientOptions) => ({
            baseURL: resolvedOptions.baseURL,
            headers: { [API_KEY_HEADER]: resolvedOptions.apiKey },
          }),
        }),
      ],
      providers: [asyncOptionsProvider, ...(options.providers || []), ProbationApiClient],
      exports: [ProbationApiClient],
    };
  }
}

import { Logger, ValidationError } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { RuntimeException } from '@nestjs/core/errors/exceptions';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import * as process from 'node:process';

const logger = new Logger();

const getLoggerContext = (configClass: ClassConstructor<unknown>): string => {
  return `ConfigLoader::${configClass.name}`;
};

/**
 * Loads environment variables into the given configuration class instance and validates it using class-validator.
 */
const loadAndValidateEnvConfig = async <T extends object>(configClass: ClassConstructor<T>): Promise<T> => {
  const configInstance = plainToInstance(configClass, process.env);

  const validationErrors: ValidationError[] = await validate(configInstance, {
    whitelist: true,
    enableDebugMessages: true,
  });

  if (validationErrors.length === 0) {
    logger.log(`${configClass.name} configuration validated successfully.`, getLoggerContext(configClass));

    return configInstance;
  }

  // log all validation errors if validation fails
  for (const error of validationErrors) {
    const constraints = Object.values(error.constraints ?? []).join('; ');

    logger.error(`Config "${configClass.name}" failed validation: ${constraints}`, getLoggerContext(configClass));
  }

  throw new RuntimeException(`Configuration validation failed. Check the logs for details.`);
};

/**
 * Registers a configuration loader for ConfigModule which:
 *
 * - Loads the config from ENV variables into the given class.
 * - Validates the class instance.
 * - Returns the validated instance if successful.
 */
export const registerValidatedEnvConfig = <T extends object>(configClass: ClassConstructor<T>) => {
  return registerAs(configClass.name, () => loadAndValidateEnvConfig(configClass));
};

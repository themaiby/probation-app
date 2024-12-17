import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { MetaResource } from '../resources/meta.resource';

/**
* Decorators for wrapping data and metadata in documentation examples
**/
export const ApiOkPaginationResponse = <TModel extends Type>(model: TModel, status: HttpStatus = HttpStatus.OK) => {
  return applyDecorators(
    ApiExtraModels(MetaResource, model),
    ApiResponse({
      status,
      schema: {
        allOf: [
          {
            properties: {
              data: { type: 'array', items: { $ref: getSchemaPath(model) } },
              meta: { $ref: getSchemaPath(MetaResource) },
            },
          },
        ],
      },
    }),
  );
};

export const ApiOkObjectResponse = <TModel extends Type>(model: TModel, status: HttpStatus = HttpStatus.OK) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      schema: {
        allOf: [{ properties: { data: { $ref: getSchemaPath(model) } } }],
      },
    }),
  );
};

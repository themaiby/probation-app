import { ClassConstructor, plainToInstance } from 'class-transformer';
import { MetaResource } from './resources/meta.resource';
import { PaginationQuery } from './resources/pagination.query';

export class ResponseWrapper {
  public static object<T, V extends Partial<T> & unknown>(responseClass: ClassConstructor<T>, data: V) {
    return { data: plainToInstance(responseClass, data, { enableImplicitConversion: true, strategy: 'excludeAll' }) };
  }

  public static pagination<T>(
    responseClass: ClassConstructor<T>,
    data: T[],
    totalCount: number,
    pagination: PaginationQuery,
  ): { data: T[]; meta: MetaResource } {
    return {
      data: plainToInstance(responseClass, data, {
        enableImplicitConversion: true,
        strategy: 'excludeAll',
      }),
      meta: new MetaResource(pagination.page, pagination.limit, totalCount, data.length),
    };
  }
}

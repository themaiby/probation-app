import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import { get } from 'lodash';
import { map, Observable } from 'rxjs';
import { ReportsQuery } from '../types/reports.query';
import { ReportsResponse } from '../types/reports.response';

@Injectable()
export class ProbationApiClient {
  public constructor(private readonly http: HttpService) {
    // convert exception to nestjs exception for easier debug
    this.http.axiosRef.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const message = get(error, 'response.data.error.message', 'Unexpected error occurred');
        const description = get(error, 'response.data.error.message');

        throw new HttpException(description || message, status);
      },
    );
  }

  public getByUrl<T>(url: string): Observable<T> {
    return this.http.get<T>(url).pipe(map((res) => res.data));
  }

  public getReports(params: ReportsQuery): Observable<ReportsResponse> {
    const uri = '/tasks/campaign/reports';

    return this.http.get<ReportsResponse>(uri, { params }).pipe(map((res) => res.data));
  }
}

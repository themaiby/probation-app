import { ApiProperty } from '@nestjs/swagger';

export class MetaResource {
  @ApiProperty({ description: 'Items limit per page', example: 10 })
  public readonly limit: number;
  @ApiProperty({ description: 'Number of current page', example: 1 })
  public readonly currentPage: number;
  @ApiProperty({ description: 'Number of last page', example: 10 })
  public readonly lastPage: number;
  @ApiProperty({ description: 'Items count on current page', example: 5 })
  public readonly currentCount: number;
  @ApiProperty({ description: 'Items count in total', example: 100 })
  public readonly totalCount: number;

  public constructor(currentPage: number, limit: number, totalCount: number, currentCount: number) {
    this.limit = limit;
    this.totalCount = totalCount;
    this.currentPage = currentPage;
    this.currentCount = currentCount;
    this.lastPage = Math.ceil(totalCount / limit);
  }
}

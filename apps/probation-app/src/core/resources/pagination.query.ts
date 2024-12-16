import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationQuery {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @ApiProperty({ required: false, minimum: 1, default: 1 })
  public readonly page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiProperty({ required: false, minimum: 1, maximum: 100, default: 5 })
  public readonly limit: number = 1;

  @Exclude()
  public getOffset() {
    return (this.page - 1) * this.limit;
  }
}

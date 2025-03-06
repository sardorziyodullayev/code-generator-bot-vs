import { Expose, Transform } from 'class-transformer';
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { CommonDtoGroup } from './common.dto';

export enum QuerySortTypeEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type QuerySortType = 'ASC' | 'DESC';

export class PagingDto<T = any> {
  @IsOptional({ groups: [CommonDtoGroup.PAGINATION] })
  @IsMongoId({ groups: [CommonDtoGroup.PAGINATION] })
  id?: string;

  @Transform(({ value }) => Number(value))
  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
      maxDecimalPlaces: 0,
    },
    {
      groups: [CommonDtoGroup.PAGINATION],
    },
  )
  limit = 10;

  @Transform(({ value }) => Number(value))
  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
      maxDecimalPlaces: 0,
    },
    {
      groups: [CommonDtoGroup.PAGINATION],
    },
  )
  page = 1;

  @Expose({ toClassOnly: true })
  @Transform(({ value }) => value?.trim() || '')
  @IsOptional({
    groups: [CommonDtoGroup.PAGINATION],
  })
  @IsString({
    groups: [CommonDtoGroup.PAGINATION],
  })
  search?: string;

  @IsOptional({ groups: [CommonDtoGroup.PAGINATION] })
  @IsString({ groups: [CommonDtoGroup.PAGINATION] })
  orderBy?: keyof T;

  @IsOptional({ groups: [CommonDtoGroup.PAGINATION] })
  @IsEnum(QuerySortTypeEnum, { groups: [CommonDtoGroup.PAGINATION] })
  orderType?: QuerySortType = 'ASC';
}

import { IsMongoId, IsNumber, IsOptional } from 'class-validator';

export class CommonDtoGroup {
  static readonly CREATE = 'create';
  static readonly UPDATE = 'update';
  static readonly DELETE = 'delete';
  static readonly GET_BY_ID = 'getById';
  static readonly PAGINATION = 'pagination';
}

export class CommonDto {
  @IsOptional({ groups: [CommonDtoGroup.PAGINATION] })
  @IsMongoId({
    groups: [
      CommonDtoGroup.UPDATE,
      CommonDtoGroup.DELETE,
      CommonDtoGroup.GET_BY_ID,
      CommonDtoGroup.PAGINATION,
    ],
  })
  _id!: string;

  @IsOptional({ groups: [CommonDtoGroup.PAGINATION, CommonDtoGroup.UPDATE] })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    {
      groups: [
        CommonDtoGroup.UPDATE,
        CommonDtoGroup.DELETE,
        CommonDtoGroup.GET_BY_ID,
        CommonDtoGroup.PAGINATION,
      ],
    },
  )
  id!: number;

  @IsOptional({ groups: [CommonDtoGroup.CREATE] })
  @IsMongoId({ groups: [CommonDtoGroup.CREATE] })
  createdBy?: string;

  @IsOptional({ groups: [CommonDtoGroup.DELETE] })
  @IsMongoId({ groups: [CommonDtoGroup.DELETE] })
  deletedBy?: string;

  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class GetPagingDto {}

import { IsNumber, IsOptional, IsString } from 'class-validator';
import { CommonDto, CommonDtoGroup } from '../../common/validation/dto/common.dto';

export class GiftDtoGroup extends CommonDtoGroup {}

class GiftImageDto {
  @IsOptional({ groups: [GiftDtoGroup.UPDATE] })
  @IsString({ groups: [GiftDtoGroup.CREATE, GiftDtoGroup.UPDATE] })
  uz: string;

  @IsOptional({ groups: [GiftDtoGroup.UPDATE] })
  @IsString({ groups: [GiftDtoGroup.CREATE, GiftDtoGroup.UPDATE] })
  ru: string;
}

export class GiftDto extends CommonDto {
  @IsOptional({ groups: [GiftDtoGroup.UPDATE] })
  @IsString({ groups: [GiftDtoGroup.CREATE, GiftDtoGroup.UPDATE] })
  name!: string;

  @IsOptional({ groups: [GiftDtoGroup.UPDATE] })
  @IsString({ groups: [GiftDtoGroup.CREATE, GiftDtoGroup.UPDATE] })
  image!: string;

  @IsOptional({ groups: [GiftDtoGroup.UPDATE] })
  images!: GiftImageDto;

  @IsOptional({ groups: [GiftDtoGroup.UPDATE] })
  @IsNumber({ allowInfinity: false, allowNaN: false }, { groups: [GiftDtoGroup.CREATE, GiftDtoGroup.UPDATE] })
  totalCount!: number;

  @IsOptional({ groups: [GiftDtoGroup.UPDATE] })
  @IsNumber({ allowInfinity: false, allowNaN: false }, { groups: [GiftDtoGroup.CREATE, GiftDtoGroup.UPDATE] })
  usedCount!: number;
}

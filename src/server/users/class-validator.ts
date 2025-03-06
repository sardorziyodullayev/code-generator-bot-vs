import { IsOptional, IsString, Matches } from 'class-validator';
import { PagingDto } from '../../common/validation/dto/paging.dto';
import { CommonDto, CommonDtoGroup } from '../../common/validation/dto/common.dto';
import { regexps } from '../../common/constant/regex';
import { Gender, UserStatus } from '../../db/models/users.model';

export class AuthDtoGroup extends CommonDtoGroup {
  static readonly LOGIN = 'login';
  static readonly CHANGE_PASSWORD = 'change_password';
}

export class UserDtoGroup extends CommonDtoGroup {
  static readonly PARAM_IDS = 'param_ids';
}

export class AuthDto {
  @IsString({ groups: [AuthDtoGroup.LOGIN] })
  username: string;

  @IsString({ groups: [AuthDtoGroup.LOGIN, AuthDtoGroup.CHANGE_PASSWORD] })
  password: string;
}

export class UserDto extends CommonDto {
  // @IsOptional({ groups: [UserDtoGroup.UPDATE] })
  // @IsString({ groups: [UserDtoGroup.CREATE, UserDtoGroup.UPDATE] })
  // @IsEnum(Role, { groups: [UserDtoGroup.CREATE, UserDtoGroup.UPDATE] })
  // role: Role;

  @IsOptional({ groups: [UserDtoGroup.UPDATE] })
  @IsString({ groups: [UserDtoGroup.CREATE, UserDtoGroup.UPDATE] })
  firstName: string;

  @IsOptional({ groups: [UserDtoGroup.UPDATE] })
  @IsString({ groups: [UserDtoGroup.CREATE, UserDtoGroup.UPDATE] })
  lastName?: string;

  @IsOptional({ groups: [UserDtoGroup.CREATE, UserDtoGroup.UPDATE] })
  @Matches(regexps.PG_DATE_FORMAT, {
    groups: [UserDtoGroup.CREATE, UserDtoGroup.UPDATE],
  })
  birthday?: string;

  @IsOptional({ groups: [UserDtoGroup.UPDATE] })
  @IsString({ groups: [UserDtoGroup.CREATE, UserDtoGroup.UPDATE] })
  password: string;

  @IsOptional({ groups: [UserDtoGroup.UPDATE] })
  @IsString({ groups: [UserDtoGroup.CREATE, UserDtoGroup.UPDATE] })
  confirmPassword?: string;

  @IsOptional({ groups: [UserDtoGroup.UPDATE] })
  @IsString({ groups: [UserDtoGroup.CREATE, UserDtoGroup.UPDATE] })
  username: string;

  tgId!: number;

  lang!: string;

  tgFirstName!: string;

  tgLastName?: string;

  tgUsername: string;

  phoneNumber?: string;

  otp?: string;

  otpSend?: Date;

  otpRetry?: number;

  gender!: Gender;

  image?: string;

  status!: UserStatus;
}

export class GetUsersRequestDto extends PagingDto {}

export class UserLoginRequestDto {
  @IsString({ groups: [UserDtoGroup.CREATE] })
  username: string;

  @IsString({ groups: [UserDtoGroup.CREATE] })
  password: string;

  @IsOptional({ groups: [UserDtoGroup.CREATE] })
  @IsString({ groups: [UserDtoGroup.UPDATE] })
  refreshToken: string;
}

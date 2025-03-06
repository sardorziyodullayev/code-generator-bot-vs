import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, UserModel } from '../../db/models/users.model';
import { BaseService } from '../base.service';
import { UserException } from './error';
import { ENV } from '../../common/config/config';
import { UserDto } from './class-validator';
import { UserWTPayloadInterface } from './auth.dto';

const defaultSaltOrRounds = 10;

export class UserAuthService<Dto> extends BaseService<User, Dto> {
  constructor(model: typeof UserModel) {
    super(model);
  }

  async login({ username, password }) {
    const user = await this.model.findOne({ username: username }, { _id: 1, password: 1 }).lean();

    if (!user || !(await this.comparePassword(password, user.password))) {
      throw UserException.Unauthorized();
    }

    const jwtPayload: UserWTPayloadInterface = { _id: user._id.toString() };
    return {
      accessToken: await this.signAsync(jwtPayload, 'access'),
      refreshToken: await this.signAsync(jwtPayload, 'refresh'),
    };
  }

  async getMe(id: string): Promise<Partial<UserDto>> {
    const user = await this.model
      .findOne(
        {
          _id: id,
          isDeleted: false,
        },
        { _id: 1, firstName: 1, lastName: 1, username: 1, image: 1, lang: 1, phoneNumber: 1 },
      )
      .lean();

    if (!user) {
      throw UserException.NotFound();
    }

    return user as unknown as Partial<UserDto>;
  }

  async refreshToken(token: string) {
    const decoded = await this.authorizeUser(token, 'refresh');

    return {
      accessToken: await this.signAsync(decoded, 'access'),
      refreshToken: await this.signAsync(decoded, 'refresh'),
    };
  }

  async authorizeUser(token: string, tokenType: 'access' | 'refresh') {
    const decoded = await this.verifyJwt(token, tokenType);

    // Check if the user's role is authorized to access the endpoint
    if (!decoded) {
      throw UserException.Unauthorized();
    }

    return decoded;
  }

  async hashPassword(password: string | Buffer, saltOrRounds?: number | string): Promise<string> {
    let salt: string | number = saltOrRounds
      ? typeof saltOrRounds === 'number'
        ? await bcrypt.genSalt(saltOrRounds)
        : saltOrRounds
      : await bcrypt.genSalt(defaultSaltOrRounds);

    return await bcrypt.hash(password, salt);
  }

  private async comparePassword(password: string, encrypted: string): Promise<boolean> {
    return await bcrypt.compare(password, encrypted);
  }

  private signAsync(
    payload: UserWTPayloadInterface,
    tokenType: 'access' | 'refresh',
    options?: jwt.SignOptions,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        tokenType === 'access' ? ENV.JWT_SECRET_ACCESS : ENV.JWT_SECRET_REFRESH,
        options,
        (err: Error | null, token: string) => {
          if (err) {
            reject(err);
          } else {
            resolve(token);
          }
        },
      );
    });
  }

  private verifyJwt(token: string, tokenType: 'access' | 'refresh'): Promise<UserWTPayloadInterface> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        tokenType === 'access' ? ENV.JWT_SECRET_ACCESS : ENV.JWT_SECRET_REFRESH,
        (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded as UserWTPayloadInterface);
          }
        },
      );
    });
  }
}

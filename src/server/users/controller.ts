import { validateIt } from '../../common/validation/validate';
import { isMongoId } from 'class-validator';
import { UserDto, UserDtoGroup, GetUsersRequestDto, UserLoginRequestDto } from './class-validator';
import { NextFunction, Request, Response } from 'express';
import { UserService } from './service';
import { CommonDtoGroup } from '../../common/validation/dto/common.dto';
import { UserException } from './error';

class UserController {
  private readonly userService = new UserService();

  constructor() {
    // this.create = this.create.bind(this);
    this.updateById = this.updateById.bind(this);
    this.getById = this.getById.bind(this);
    this.getMe = this.getMe.bind(this);
    this.getAll = this.getAll.bind(this);
    this.deleteById = this.deleteById.bind(this);
    this.login = this.login.bind(this);
    this.authorizeUser = this.authorizeUser.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  // async create(req: Request, res: Response) {
  //   const body = await validateIt(req.body, UserDto, [UserDtoGroup.CREATE]);

  //   // if (!roleAccess[req.user.role].includes(body.role)) {
  //   //   return res.status(403).send({
  //   //     error: 'Access denied',
  //   //     data: {},
  //   //     code: 101,
  //   //   });
  //   // }

  //   const user = await this.userService.create(body);
  //   res.success(user, {}, StatusCodes.CREATED);
  // }

  async updateById(req: Request, res: Response) {
    const body = await validateIt(req.body, UserDto, [UserDtoGroup.UPDATE]);

    if (body.password) {
      if (body.password !== body.confirmPassword) {
        throw UserException.InvalidPassword();
      }

      body.password = await this.userService.hashPassword(body.password);
    }
    // if (!(roleAccess[req.user.role].includes(body.role) || req.user.id === req.params.id)) {
    //   return res.status(403).send({
    //     error: 'Access denied',
    //     data: {},
    //     code: 101,
    //   });
    // }

    const user = await this.userService.findByIdAndUpdateUser(body);
    res.success(user);
  }

  public async getById(req: Request, res: Response) {
    const id = req.params.id;

    if (!isMongoId(id)) {
      return res.status(400).send({ message: 'Invalid user id' });
    }

    const user = await this.userService.findById(id);

    res.success(user);
  }

  public async getMe(req: Request, res: Response) {
    const id = req.user._id;

    if (!isMongoId(id)) {
      return res.status(400).send({ message: 'Invalid user id' });
    }

    const user = await this.userService.getMe(id);

    res.success(user);
  }

  public async getAll(req: Request, res: Response) {
    const query = await validateIt(req.query, GetUsersRequestDto, [CommonDtoGroup.PAGINATION]);

    const data = await this.userService.getPaging(query);

    return res.success(data.data, {
      currentPage: query.page,
      limit: query.limit,
      totalCount: data.total,
      pageCount: Math.ceil(data.total / query.limit),
    });
  }

  public async deleteById(req: Request, res: Response) {
    const id = req.params.id;

    if (!isMongoId(id)) {
      return res.status(400).json({ error: 'invalid mongoId' });
    }

    await this.userService.deleteById(id, req.user._id);

    return res.success({ id: id });
  }

  //! Auth
  public async login(req: Request, res: Response) {
    // console.log('body:', req.body);

    const body = await validateIt(req.body, UserLoginRequestDto, [CommonDtoGroup.CREATE]);

    const data = await this.userService.login(body);

    return res.success(data, {});
  }

  async authorizeUser(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json(UserException.Unauthorized());
      }

      req.user = await this.userService.authorizeUser(token, 'access');

      next();
    } catch (err) {
      console.log(err);

      // telegramBot.sendMessage(err.toString() + '\n\nerror while authorizeUser');

      return res.status(401).json(UserException.Unauthorized());
    }
  }

  async refreshToken(req: Request, res: Response) {
    const body = await validateIt(req.body, UserLoginRequestDto, [CommonDtoGroup.UPDATE]);
    const data = await this.userService.refreshToken(body.refreshToken);

    return res.success(data, {});
  }
}

export const userController = new UserController();

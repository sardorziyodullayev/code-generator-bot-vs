import { PipelineStage, Types, UpdateQuery } from 'mongoose';
import { QuerySort } from '../../common/validation/types';
import { UserModel } from '../../db/models/users.model';
import { UserAuthService } from './auth.service';
import { GetUsersRequestDto, UserDto } from './class-validator';
import { COLLECTIONS } from '../../common/constant/tables';
import { UserException } from './error';

export class UserService extends UserAuthService<UserDto> {
  constructor(model: typeof UserModel = UserModel) {
    super(model);
  }
  async findByIdAndUpdateUser(data: UserDto): Promise<UserDto | null> {
    const user = await this.model.findById(this.toObjectId(data._id), { _id: 1, username: 1 }).lean();
    if (!user) {
      throw UserException.NotFound();
    }

    if (data.username && data._id.toString() !== user._id.toString()) {
      const userByUsername = await this.model
        .findOne(
          {
            username: data.username,
          },
          { _id: 1 },
        )
        .lean();

      if (!userByUsername) {
        throw UserException.AllreadyExist('username');
      }
    }

    const newUser = await this.findByIdAndUpdate(data, { new: true });

    return { ...newUser, _id: newUser._id.toString() };
  }
  async getPaging(query: GetUsersRequestDto): Promise<{ data: UserDto[]; total: number }> {
    const filter = { deletedAt: null };
    if (query.search) {
      filter['$or'] = [
        { tgFirstName: { $regex: query.search } },
        { tgLastName: { $regex: query.search } },
        { tgUsername: { $regex: query.search } },
        { tgId: { $regex: query.search } },
        { username: { $regex: query.search } },
        { firstName: { $regex: query.search } },
        { lastName: { $regex: query.search } },
        { phoneNumber: { $regex: query.search } },
      ];
    }

    const orderType = query.orderType === 'ASC' ? 1 : -1;
    const sort: QuerySort<UserDto> = query.orderBy ? { [query.orderBy]: orderType } : { _id: -1 };

    const $match = { $match: filter };
    const $project = {
      $project: {
        _id: 1,
        firstName: 1,
        lastName: 1,
        tgFirstName: 1,
        tgLastName: 1,
        tgUsername: 1,
        tgId: 1,
        username: 1,
        phoneNumber: 1,
        createdAt: 1,
      },
    };

    const $sort = { $sort: sort };
    const $limit = { $limit: query.limit ?? 10 };
    const $skip = { $skip: ((query.page ?? 1) - 1) * (query.limit ?? 10) };
    const $lookup: PipelineStage.Lookup = {
      $lookup: {
        from: COLLECTIONS.codes,
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$usedById', '$$userId'],
                  },
                  {
                    $eq: ['$deletedAt', null],
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: COLLECTIONS.gifts,
              let: { giftId: '$giftId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$_id', '$$giftId'],
                        },
                        {
                          $eq: ['$deletedAt', null],
                        },
                      ],
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    id: 1,
                    name: 1,
                    image: 1,
                    type: 1,
                  },
                },
              ],
              as: 'gifts',
            },
          },
          {
            $project: {
              id: 1,
              value: 1,
              giftId: 1,
              isUsed: 1,
              usedById: 1,
              usedAt: 1,
              gift: { $first: '$gifts' },
            },
          },
        ],
        as: 'codes',
      },
    };

    const pipeline: PipelineStage.FacetPipelineStage[] = [$match, $project];

    const res = await this.model.aggregate([
      {
        $facet: {
          data: [...pipeline, $sort, $skip, $limit, $lookup],
          total: [$match, { $count: 'total' }],
        },
      },
    ]);

    return {
      data: res[0].data,
      total: res[0].total[0] && res[0].total[0].total ? res[0].total[0].total : 0,
    };
  }
}

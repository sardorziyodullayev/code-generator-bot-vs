import { PipelineStage } from 'mongoose';
import { PagingDto } from '../../common/validation/dto/paging.dto';
import { Code, CodeModel } from '../../db/models/codes.model';
import { BaseService } from '../base.service';
import { CodeDto, CodePagingDto } from './class-validator';
import { COLLECTIONS } from '../../common/constant/tables';
import { CodeException } from './error';
import { GiftModel } from '../../db/models/gifts.model';
import { QuerySort } from '../../common/validation/types';
import { isMongoId } from 'class-validator';

export class CodeService extends BaseService<Code, CodeDto> {
  constructor(model: typeof CodeModel = CodeModel, private readonly giftModel: typeof GiftModel = GiftModel) {
    super(model);
  }

  async codeGiftGive(codeId: string, giftGivenBy: string) {
    return await this.model.findByIdAndUpdate(
      this.toObjectId(codeId),
      {
        giftGivenBy: giftGivenBy,
        giftGivenAt: new Date().toISOString(),
      },
      { lean: true, new: true },
    );
  }

  async getPaging(query: CodePagingDto): Promise<{ data: CodeDto[]; total: number; totalUsedCount: number }> {
    const filter = { deletedAt: null };

    if (query.isUsed == true || query.isUsed == false) {
      filter['usedAt'] = query.isUsed ? { $ne: null } : null;
    }

    if (query.search) {
      filter['$or'] = [{ value: query.search }, { id: query.search }];
    }

    if (query.giftId) {
      if (query.giftId === 'withGift') {
        filter['giftId'] = { $ne: null };
      } else if (isMongoId(query.giftId)) {
        filter['giftId'] = this.toObjectId(query.giftId);
      }
    }

    query.limit = query.limit ?? 10;
    query.page = query.page ?? 1;
    const $match: PipelineStage.Match = { $match: filter };
    const $project = {
      $project: {
        _id: 1,
        id: 1,
        value: 1,
        giftId: 1,
        isUsed: 1,
        usedAt: 1,
        usedById: 1,
      },
    };
    const $sort: PipelineStage.Sort = { $sort: { usedAt: -1, id: 1 } };
    const $limit = { $limit: query.limit };
    const $skip = { $skip: (query.page - 1) * query.limit };
    const $lookupUser: PipelineStage.Lookup = {
      $lookup: {
        from: COLLECTIONS.users,
        let: { usedById: '$usedById' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$usedById'],
              },
            },
          },
          {
            $project: {
              _id: 1,
              tgId: 1,
              tgFirstName: 1,
              tgLastName: 1,
              firstName: 1,
              phoneNumber: 1,
            },
          },
        ],
        as: 'usedBy',
      },
    };
    const $lookupGift: PipelineStage.Lookup = {
      $lookup: {
        from: COLLECTIONS.gifts,
        let: { giftId: '$giftId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$giftId'],
              },
            },
          },
          {
            $project: {
              _id: 1,
              id: 1,
              name: 1,
              image: 1,
              images: 1,
              totalCount: 1,
              usedCount: 1,
            },
          },
        ],
        as: 'gift',
      },
    };

    const $lastProject: PipelineStage.Project = {
      $project: {
        usedBy: { $arrayElemAt: ['$usedBy', 0] },
        gift: { $arrayElemAt: ['$gift', 0] },
        ...$project.$project,
      },
    };
    const pipeline: PipelineStage.FacetPipelineStage[] = [
      $match,
      $project,
      $sort,
      $skip,
      $limit,
      $lookupUser,
      $lookupGift,
      $lastProject,
    ];

    const res = await this.model.aggregate<{
      data: CodeDto[];
      total: [{ total: number }];
      totalUsedCount: [{ total: number }];
    }>([
      {
        $facet: {
          data: pipeline,
          total: [$match, { $count: 'total' }],
          totalUsedCount: [
            { $match: { deletedAt: null, isUsed: true, usedAt: { $ne: null } } },
            { $count: 'total' },
          ],
        },
      },
    ]);

    return {
      data: res[0].data,
      total: res[0].total[0] && res[0].total[0].total ? res[0].total[0].total : 0,
      totalUsedCount: res[0].total[0] && res[0].totalUsedCount[0].total ? res[0].totalUsedCount[0].total : 0,
    };
  }

  async getUsedByUserPaging(query: PagingDto, usedById: string): Promise<{ data: CodeDto[]; total: number }> {
    const filter = {
      deletedAt: null,
      usedById: this.toObjectId(usedById),
    };
    if (query.search) {
      filter['$or'] = [{ value: { $regex: query.search } }, { id: Number(query.search) }];
    }

    query.limit = query.limit ?? 10;
    query.page = query.page ?? 1;

    const $match = { $match: filter };
    const $project = {
      $project: {
        _id: 1,
        id: 1,
        value: 1,
        giftId: 1,
        isUsed: 1,
        usedAt: 1,
        usedById: 1,
      },
    };
    const orderType = query.orderType === 'ASC' ? 1 : -1;
    const sort: QuerySort<CodeDto> = query.orderBy ? { [query.orderBy]: orderType } : { id: 1 };

    const $sort: PipelineStage.Sort = { $sort: sort };
    const $limit = { $limit: query.limit };
    const $skip = { $skip: (query.page - 1) * query.limit };

    const $lookupGift: PipelineStage.Lookup = {
      $lookup: {
        from: COLLECTIONS.gifts,
        let: { giftId: '$giftId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$giftId'],
              },
            },
          },
          {
            $project: {
              _id: 1,
              id: 1,
              name: 1,
              image: 1,
              images: 1,
              type: 1,
              totalCount: 1,
              usedCount: 1,
            },
          },
        ],
        as: 'gift',
      },
    };

    const $lastProject: PipelineStage.Project = {
      $project: {
        gift: { $arrayElemAt: ['$gift', 0] },
        ...$project.$project,
      },
    };
    const pipeline: PipelineStage.FacetPipelineStage[] = [
      $match,
      $project,
      $sort,
      $skip,
      $limit,
      $lookupGift,
      $lastProject,
    ];

    const res = await this.model.aggregate<{ data: CodeDto[]; total: [{ total: number }] }>([
      {
        $facet: {
          data: pipeline,
          total: [$match, { $count: 'total' }],
        },
      },
    ]);

    return {
      data: res[0].data,
      total: res[0].total[0] && res[0].total[0].total ? res[0].total[0].total : 0,
    };
  }

  async checkCode(value: string) {
    const code = await this.findOne({ value: value, deletedAt: null }, { value: 1, giftId: 1 });
    if (!code) {
      throw CodeException.NotFound();
    }

    if (!code.giftId) {
      return {
        value: code.value,
        gift: null,
      };
    }

    const gift = await this.giftModel
      .findOne({ _id: code.giftId, deletedAt: null }, { name: 1, image: 1, images: 1 })
      .lean();
    if (!gift) {
      return {
        value: code.value,
        gift: null,
      };
    }

    return {
      value: code.value,
      gift: gift,
    };
  }
}

import { validateIt } from '../../common/validation/validate';
import { Request, Response } from 'express';
import { GiftService } from './service';
import { GiftDto, GiftDtoGroup } from './class-validator';
import { StatusCodes } from '../../common/utility/status-codes';
import { GiftModel } from '../../db/models/gifts.model';
import { CodeModel } from '../../db/models/codes.model';
import { PagingDto } from '../../common/validation/dto/paging.dto';

class GiftController {
  private readonly giftService = new GiftService(GiftModel);

  constructor() {
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.updateById = this.updateById.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.deleteById = this.deleteById.bind(this);
  }

  public async create(req: Request, res: Response) {
    const body = await validateIt(req.body, GiftDto, [GiftDtoGroup.CREATE]);

    const result = await this.giftService.create(body);

    return res.success(result, {}, StatusCodes.CREATED);
  }

  public async updateById(req: Request, res: Response) {
    const body = await validateIt(req.body, GiftDto, [GiftDtoGroup.UPDATE]);

    const gift = await this.giftService.findByIdAndUpdate(body, {
      lean: true,
      new: true,
      projection: { _id: 1, id: 1, name: 1, image: 1, images: 1, totalCount: 1, usedCount: 1, createdAt: 1 },
    });

    return res.success(gift);
  }

  public async getById(req: Request, res: Response) {
    const data = await validateIt(req.params, GiftDto, [GiftDtoGroup.GET_BY_ID]);

    const result = await this.giftService.findById(data._id);
    return res.success(result);
  }

  public async getAll(req: Request, res: Response) {
    const query = await validateIt(req.query, PagingDto, [GiftDtoGroup.PAGINATION]);
    const gifts = await this.giftService.getPaging(query);

    return res.success(gifts.data, {
      currentPage: query.page,
      totalData: gifts.total,
      totalPages: Math.ceil(gifts.total / query.limit),
      limit: query.limit,
    });
  }

  public async deleteById(req: Request, res: Response) {
    const data = await validateIt(req.params, GiftDto, [GiftDtoGroup.DELETE]);

    await this.giftService.deleteById(data._id, req.user._id);

    return res.success({ _id: data._id });
  }
}

export const giftController = new GiftController();

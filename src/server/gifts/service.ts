import { PagingDto } from '../../common/validation/dto/paging.dto';
import { Gift, GiftModel } from '../../db/models/gifts.model';
import { BaseService } from '../base.service';
import { GiftDto } from './class-validator';

export class GiftService extends BaseService<Gift, GiftDto> {
  constructor(model: typeof GiftModel) {
    super(model);
  }
  async getPaging(query: PagingDto): Promise<{ data: GiftDto[]; total: number }> {
    const filter = { deletedAt: null };
    if (query.search) {
      filter['$or'] = [{ name: { $regex: query.search } }, { id: query.search }];
    }

    return await this.findPaging(filter, { _id: -1 }, query.limit ?? 10, query.page ?? 1, {
      _id: 1,
      id: 1,
      name: 1,
      image: 1,
      images: 1,
      totalCount: 1,
      usedCount: 1,
    });
  }
}

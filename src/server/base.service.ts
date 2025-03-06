import mongoose, { Model } from 'mongoose';
import { PagingDto } from '../common/validation/dto/paging.dto';
import { BaseEntity } from './base.entity';
import { CommonException } from '../common/errors/common.error';
import { QuerySort } from '../common/validation/types';

export type ModelType<Entity extends BaseEntity> = Model<Entity>;

export class BaseService<Entity extends BaseEntity, Dto = any> {
  constructor(protected readonly model: ModelType<Entity>) {}

  newObjectId(): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId();
  }

  toObjectId(id: string | mongoose.Types.ObjectId, is_throw = true): mongoose.Types.ObjectId {
    try {
      return new mongoose.Types.ObjectId(id);
    } catch (er) {
      this.sendError('to ObjectId', `${id} is not ObjectId`);
      if (is_throw) throw new Error(`${id} is not ObjectId`);
    }
  }

  private static get defaultOptions(): mongoose.QueryOptions {
    return { lean: true };
  }

  private static getQueryOptions(options?: mongoose.QueryOptions): mongoose.QueryOptions {
    const mergedOptions = {
      ...BaseService.defaultOptions,
      ...(options || {}),
    };

    return mergedOptions;
  }

  async sendError(on: string, message: string) {
    const msg = `Error on: ${on}\nError: ${message}`;
    // await this.sendMessage(msg);
  }

  createInstance(doc?: Partial<Dto>): mongoose.HydratedDocument<Entity> {
    return new this.model(doc);
  }

  async create(doc: Dto) {
    try {
      return (await this.createInstance(doc).save()).toJSON({ versionKey: false });
    } catch (e) {
      this.sendError('BaseService.save', e?.message);
      throw CommonException.InternalServerError();
    }
  }

  async insertMany(docs: Entity[]) {
    try {
      docs = docs.map((doc) => {
        doc._id = new mongoose.Types.ObjectId();
        return doc;
      });
      return await this.model.insertMany(docs);
    } catch (e) {
      this.sendError('BaseService.save', e?.message);
      throw CommonException.InternalServerError();
    }
  }

  async countAsync(filter: mongoose.FilterQuery<Entity>): Promise<number> {
    try {
      return await this.model.countDocuments(filter);
    } catch (e) {
      this.sendError('BaseService.countAsync', e?.message);
      return 0;
    }
  }

  async findById(
    id: string | mongoose.Types.ObjectId,
    projection?: mongoose.ProjectionType<Entity> | null,
    options?: mongoose.QueryOptions,
  ): Promise<Entity | null> {
    id = this.toObjectId(id, false);
    return await this.model.findById(id, projection).setOptions(BaseService.getQueryOptions(options));
  }

  async findOne(
    filter: mongoose.FilterQuery<Entity>,
    projection?: mongoose.ProjectionType<Entity> | null,
  ): Promise<Entity | null> {
    return await this.model.findOne(filter, projection);
  }

  async findByIdAndUpdate(
    data: mongoose.UpdateQuery<Entity>,
    options: mongoose.QueryOptions = {},
  ): Promise<Entity | null> {
    return await this.model
      .findByIdAndUpdate(data._id, data)
      .setOptions(BaseService.getQueryOptions(options));
  }

  async findOneAndUpdate(
    query: mongoose.FilterQuery<Entity>,
    data: mongoose.UpdateQuery<Entity>,
    options: mongoose.QueryOptions<Entity> = { lean: true },
  ): Promise<Entity> {
    return this.model.findOneAndUpdate(query, data, options);
  }

  protected async findPaging(
    filter: mongoose.FilterQuery<Dto>,
    sort: QuerySort<Dto>,
    limit = 10,
    page = 1,
    projection?: { [P in keyof Entity]?: number | string } | null,
  ): Promise<{ data: Dto[]; total: number }> {
    const $match = { $match: filter };
    const $project = { $project: projection };
    const $sort = { $sort: sort };
    const $limit = { $limit: limit };
    const $skip = { $skip: (page - 1) * limit };

    const pipeline: mongoose.PipelineStage.FacetPipelineStage[] = [$match];
    if (projection) {
      pipeline.push($project);
    }

    const res = await this.model.aggregate([
      {
        $facet: {
          data: [...pipeline, $sort, $skip, $limit],
          total: [$match, { $count: 'total' }],
        },
      },
    ]);

    return {
      data: res[0].data,
      total: res[0].total[0] && res[0].total[0].total ? res[0].total[0].total : 0,
    };
  }

  async deleteById(id: string, deleteById: string) {
    await this.model.updateOne(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date().toISOString(), deletedBy: deleteById } },
      { lean: true },
    );

    return id;
  }
}

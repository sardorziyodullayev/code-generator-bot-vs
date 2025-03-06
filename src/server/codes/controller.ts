import { validateIt } from '../../common/validation/validate';
import { Request, Response } from 'express';
import { CodeService } from './service';
import { CodeDto, CodeDtoGroup, CodePagingDto } from './class-validator';
import { PagingDto } from '../../common/validation/dto/paging.dto';

class CodeController {
  private readonly codesService = new CodeService();

  constructor() {
    this.getById = this.getById.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.checkCode = this.checkCode.bind(this);
    this.getUsedBy = this.getUsedBy.bind(this);
    this.codeGiftGive = this.codeGiftGive.bind(this);
  }

  public async getById(req: Request, res: Response) {
    const data = await validateIt(req.params, CodeDto, [CodeDtoGroup.GET_BY_ID]);

    const result = await this.codesService.findById(data._id);
    return res.success(result);
  }

  public async codeGiftGive(req: Request, res: Response) {
    const data = await validateIt(req.params, CodeDto, [CodeDtoGroup.GET_BY_ID]);

    const result = await this.codesService.codeGiftGive(data._id, req.user._id);
    return res.success(result);
  }

  public async getAll(req: Request, res: Response) {
    const query = await validateIt(req.query, CodePagingDto, [CodeDtoGroup.PAGINATION]);
    const codes = await this.codesService.getPaging(query);

    return res.success(codes.data, {
      currentPage: query.page,
      totalData: codes.total,
      totalUsedCount: codes.totalUsedCount,
      totalPages: Math.ceil(codes.total / query.limit),
      limit: query.limit,
    });
  }

  public async getUsedBy(req: Request, res: Response) {
    const param = await validateIt(req.params, CodeDto, [CodeDtoGroup.GET_USED_BY_USER_ID]);
    const query = await validateIt(req.query, PagingDto, [CodeDtoGroup.PAGINATION]);

    const codes = await this.codesService.getUsedByUserPaging(query, param.usedById);

    return res.success(codes.data, {
      currentPage: query.page,
      totalData: codes.total,
      totalPages: Math.ceil(codes.total / query.limit),
      limit: query.limit,
    });
  }

  public async checkCode(req: Request, res: Response) {
    const data = await validateIt(req.body, CodeDto, [CodeDtoGroup.CHECK_CODE]);

    const result = await this.codesService.checkCode(data.value);
    return res.success(result);
  }
}

export const codesController = new CodeController();

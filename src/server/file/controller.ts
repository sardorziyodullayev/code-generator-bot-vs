import { isEnum } from 'class-validator';
import { Request, Response } from 'express';
import { FileService } from './service';
import { FileBucketEnum, FileTypeEnum, FileBucketTypes } from './typings';
import { StatusCodes } from '../../common/utility/status-codes';
import { FileException } from '../../common/errors/common.error';

class FileController {
  private fileService: FileService;

  constructor() {
    this.fileService = new FileService();
    this.get = this.get.bind(this);
    this.upload = this.upload.bind(this);
  }

  async upload(req: Request, res: Response) {
    const bucketName = req.params.type as FileBucketTypes;
    // checkBucket name enum ['schema', 'passport']

    if (!isEnum(bucketName, FileBucketEnum)) {
      return res.status(400).send({
        error: `Invalid bucket name`,
        data: {},
        code: 4221,
      });
    }

    const file = req.file;
    const allowedTypes = [FileTypeEnum.JPEG, FileTypeEnum.JPG, FileTypeEnum.PNG, FileTypeEnum.PDF];

    if (!file) {
      throw FileException.InvalidFileType();
    }
    // must check file type. hack qilinishi mumkin
    const currentMimeType = file.mimetype.split('/')[1];
    const foundType = allowedTypes.find((e) => e === currentMimeType);

    if (!foundType) {
      return res.status(400).send({
        error: `file type must allowed extension`,
        data: {},
      });
    }

    const fileRes = await this.fileService.upload(file, bucketName);

    return res.success(fileRes, {}, StatusCodes.CREATED);
  }

  async get(req: Request, res: Response) {
    const { bucketName, id } = req.params;
    // checkBucket name enum ['schema', 'passport']

    const fileRes = await this.fileService.getById(id, bucketName);

    // res.type(".png");
    res.write(fileRes);

    return res.status(StatusCodes.OK).send();
  }
}

export const fileController = new FileController();

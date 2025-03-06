import { randomUUID } from 'crypto';
import { ENV } from '../../common/config/config';
import { FileBucketEnum, FileBucketTypes } from './typings';
import { FileException } from '../../common/errors/common.error';
import fs from 'fs/promises';

const filesPath = `${process.cwd()}/files/`;

export class FileService {
  private async checkBucket(bucketName: string) {
    const folderPath = `${filesPath}${bucketName}`;
    try {
      await fs.access(folderPath);
    } catch (err) {
      if (err.code == 'ENOENT') {
        await fs.mkdir(folderPath);
      }
    }
  }

  async upload(
    file: Express.Multer.File,
    bucketName: FileBucketTypes,
  ): Promise<{ fileName: string; fileUrl: string } | null> {
    await this.checkBucket(bucketName);
    const filenameParts = file.originalname.split('.');
    const filename = `${randomUUID()}.${filenameParts[filenameParts.length - 1]}`;

    await fs.writeFile(`${filesPath}${bucketName}/${filename}`, file.buffer);

    return {
      fileName: `/files/${bucketName}/${filename}`,
      fileUrl: `/files/${bucketName}/${filename}`,
    };
  }

  async getById(id: string, bucketName: string): Promise<Buffer> {
    const file = await fs.readFile(`${filesPath}${bucketName}/${id}`);

    return file;
  }
}

/* Customer Service */
export const fileService = new FileService();

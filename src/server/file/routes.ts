import { Router } from 'express';
import { fileController } from './controller';
import multer from 'multer';
import { runAsyncWrapper } from '../../common/utility/run-async-wrapper';

const filesRouter = Router()
  .post('/:type', multer().single('file'), runAsyncWrapper(fileController.upload))
  .get('/:bucketName/:id', runAsyncWrapper(fileController.get));

export { filesRouter };

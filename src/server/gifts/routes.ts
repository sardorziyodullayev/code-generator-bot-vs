import { Router } from 'express';
import { runAsyncWrapper } from '../../common/utility/run-async-wrapper';
// import { employeeController } from '../employee/controller';
import { giftController } from './controller';

const giftsRouter = Router()
  .post('/', runAsyncWrapper(giftController.create))
  .put('/', runAsyncWrapper(giftController.updateById))
  .get('/', runAsyncWrapper(giftController.getAll))
  .get('/:id', runAsyncWrapper(giftController.getById))
  .delete('/:id', runAsyncWrapper(giftController.deleteById));

export { giftsRouter };

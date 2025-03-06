import { Router } from 'express';
import { userController } from './controller';
import { runAsyncWrapper } from '../../common/utility/run-async-wrapper';

const usersRouter = Router()
  // .post('/', runAsyncWrapper(userController.create))
  .post('/login', runAsyncWrapper(userController.login))
  .put('/', userController.authorizeUser, runAsyncWrapper(userController.updateById))
  .get('/me', userController.authorizeUser, runAsyncWrapper(userController.getMe))
  .post('/update-token', userController.authorizeUser, runAsyncWrapper(userController.refreshToken))
  .get('/:id', userController.authorizeUser, runAsyncWrapper(userController.getById))
  .get('/', userController.authorizeUser, runAsyncWrapper(userController.getAll))
  .delete('/:id', userController.authorizeUser, runAsyncWrapper(userController.deleteById));

export { usersRouter };

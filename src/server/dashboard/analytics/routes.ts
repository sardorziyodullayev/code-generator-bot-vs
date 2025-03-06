import { Router } from 'express';
import { analyticsController } from './controller';
import { runAsyncWrapper } from '../../../common/utility/run-async-wrapper';

const analyticsRouter = Router().get('/', runAsyncWrapper(analyticsController.get));

export { analyticsRouter };

import { Router } from 'express';
import { analyticsRouter } from './analytics/routes';

const dashboardRouter = Router().use('/analytics', analyticsRouter);

export { dashboardRouter };

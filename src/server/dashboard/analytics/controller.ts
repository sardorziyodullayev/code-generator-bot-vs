import { Request, Response } from 'express';
import { AnalyticsService } from './service';
import { isDate } from 'class-validator';
import { DashboardException } from './error';

class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
    this.get = this.get.bind(this);
  }

  async get(req: Request, res: Response) {
    const from = new Date(req.query.from?.toString());
    const to = new Date(req.query.to?.toString());

    if (!(isDate(from) && isDate(to))) {
      throw DashboardException.TimeFormatError();
    }

    const analyticsRes = await this.analyticsService.get(from, to);

    return res.success(analyticsRes);
  }
}

export const analyticsController = new AnalyticsController();

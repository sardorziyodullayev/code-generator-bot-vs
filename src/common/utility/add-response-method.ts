import { NextFunction, Request, RequestHandler, Response } from 'express';
import { StatusCodes } from './status-codes';
import { Server } from 'http';

export const addMethodToResponse = (_req: Request, res: Response, next: NextFunction) => {
  res.success = function (data, meta: any = {}, httpCode = StatusCodes.OK) {
    return res.status(httpCode).json({ data, meta, code: 200, message: 'OK' });
  };

  return next();
};

declare module 'express' {
  export interface Response {
    success: (data: any, meta?: object, httpCode?: StatusCodes) => void;
  }
}

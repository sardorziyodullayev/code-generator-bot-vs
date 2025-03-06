import { Request, Response } from 'express';
import { StatusCodes } from './status-codes';
import { CommonException } from '../errors/common.error';

export const globalErrorHandler = (err: any, _req: Request, res: Response, _next) => {
  console.log('err:', err);

  // const jsonStringErr = JSON.stringify(err);

  console.error(
    '================================ GLOBAL ERROR HANDLER =================================\n',
    err.message,
  );

  if (err.code) {
    const statusCode = err.statusCode;
    err.statusCode = undefined;
    return res.status(statusCode).send(err);
  }

  let fail;
  if (err instanceof Error) {
    fail = CommonException.UnknownError(err.message);
    fail.message = err.message;
  } else {
    fail = CommonException.UnknownError(err);
  }
  fail.statusCode = undefined;

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(fail);
};

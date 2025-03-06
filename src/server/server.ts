// import routes
import express from 'express';
import 'reflect-metadata';
// import session from "express-session";
import { addMethodToResponse } from '../common/utility/add-response-method';
import { globalErrorHandler } from '../common/utility/global-error-handler';
import { router } from './router';
import cors from 'cors';

const app = express();
app.use(cors());

app
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(addMethodToResponse)
  .use(router)
  .use(globalErrorHandler);

export default app;

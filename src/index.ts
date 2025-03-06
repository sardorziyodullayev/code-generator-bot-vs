import { ENV } from './common/config/config';
import app from './server/server';
import { Server } from 'http';
import { runCronJobs } from "./common/cron-job/cron-job";
import { mongoDataBase } from './db/connect.db';

let server: Server;
let status: 'online' | 'offline' | 'starting' | 'stopping' = 'offline';

async function runServer() {
  status = 'online';

  let err = await mongoDataBase.initialize();
  if (err) {
    // server.log.error(err, "mongodb connection error");
    console.log(err, "mongodb connection error");
    return err; // graceFullShutdown(err)
  }
  console.log("success connect: mongoDataBase ");

  await import('./bot/core/index');
  // /* Cron - Job */
  // runCronJobs();

  server = app.listen(ENV.HTTP_PORT, ENV.HTTP_HOST);
  console.log(`Server running. ${ENV.HTTP_HOST}:${ENV.HTTP_PORT}`);
  server.on('close', () => {
    console.log(`server.on('close') => the express server is down. status: ${status}`);
  });
}

async function gracefulShutDown(reason: string) {
  let err;
  console.log(`reason: ${reason}. status: ${status}`);

  if (status !== 'online') return;

  status = 'stopping';

  // close server
  server?.close((err) => {
    if (err) console.log(err, 'error while stop express server');
    else console.log(`the express server is down. status: ${status}`);
  });

  await new Promise((resolve) => {
    if (server)
      server.on('close', () => {
        resolve('OK');
      });
    else resolve('OK');
  });

  // close connection with postgres
  err = await mongoDataBase.closeConnection();
  if (err) {
    console.log(err, 'error while mongoDataBase.closeConnection()');
  }

  status = 'offline';
  console.log(`the server is down. status: ${status}`);
  process.exit(1); // dblar o'chmasdan qilmaslik krk
}

function onErrorHandler(err: Error, reason: string) {
  console.log(err, reason);

  gracefulShutDown(reason);
}

function initNodeJSEventHandlers() {
  // Enable graceful stop
  process.on('beforeExit', (code) => {
    console.log('Process beforeExit event with code: ', code);
  });

  // process.on("rejectionHandled", (err: Error) =>
  //   onErrorHandler(err, "rejectionHandled"),
  // );
  // process.on("uncaughtException", (err: Error) =>
  //   onErrorHandler(err, "uncaughtException"),
  // );
  // process.on("unhandledRejection", (err: Error) =>
  //   onErrorHandler(err, "unhandledRejection"),
  // );
  // process.on("uncaughtExceptionMonitor", (err: Error) =>
  //   onErrorHandler(err, "uncaughtExceptionMonitor"),
  // );
  process.on('SIGINT', (err: Error) => onErrorHandler(err, 'SIGINT'));
  process.on('SIGTERM', (err: Error) => onErrorHandler(err, 'SIGTERM'));
}

initNodeJSEventHandlers();
runServer();

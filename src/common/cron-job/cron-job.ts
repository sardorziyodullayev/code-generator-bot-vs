import { createWriteStream } from 'fs';
// import mongoose from 'mongoose';
import archiver from 'archiver';
import cron from 'node-cron';
import { CronExpression } from './cron-expression.enum';
import { ENV } from '../config/config';
import bot from '../../bot/core/bot';
import { InputFile } from 'grammy';
import { join } from 'path';

async function zip(backupFileName: string) {
  const output = createWriteStream(join(process.cwd(), backupFileName));
  const archive = archiver('zip', { zlib: { chunkSize: 100 * 1024, level: 2 } });

  return new Promise<void>(async (resolve, reject) => {
    output.on('close', function () {
      console.log('archiver has been finalized and the output file descriptor has closed.');
      resolve();
    });

    archive.on('error', function (err) {
      reject(err);
    });

    archive.pipe(output);

    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory(process.cwd(), '');

    await archive.finalize();
  });
}

async function backupMethod() {
  console.log('===================== STARTING CRON JOB =====================');

  const fileName = 'mongo_dump.zip';
  // for (const collectionName of Object.keys(mongoose.connection.collections)) {
  //   const path = `${process.cwd()}/files/backups/${collectionName}.json`;
  //   const stream = createWriteStream(path);
  //   stream.write('[');

  //   const collectionCursor = mongoose.connection.collections[collectionName].find({});
  //   collectionCursor.forEach((doc) => {
  //     stream.write(Buffer.from(JSON.stringify(doc) + ','));
  //   });

  //   collectionCursor.on('close', async () => {
  //     stream.end(']');
  //     await bot.api
  //       .sendDocument(ENV.BOT.BACKUP_CHANNEL_ID, new InputFile(path), {
  //         message_thread_id: 12,
  //         caption: `${collectionName}`,
  //         parse_mode: 'HTML',
  //       })
  //       .catch((err) => {
  //         console.log('===================== Error while backup =====================');
  //         console.log(err);
  //       });
  //   });
  // }

  await zip(fileName);

  await bot.api
    .sendDocument(ENV.BOT.BACKUP_CHANNEL_ID, new InputFile(join(process.cwd(), fileName)), {
      message_thread_id: 12,
      caption: `#valesco #valescoCheck #dump`,
      parse_mode: 'HTML',
    })
    .catch((err) => {
      console.log('===================== Error while backup =====================');
      console.log(err);
    });
}

export function runCronJobs() {
  console.log('===================== REGISTER CRON JOBS =====================');
  cron.schedule(CronExpression.EVERY_DAY_AT_MIDNIGHT, backupMethod, {
    timezone: 'Asia/Tashkent',
  });
}

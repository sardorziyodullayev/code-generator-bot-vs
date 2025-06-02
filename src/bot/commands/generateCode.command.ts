import mongoose from 'mongoose';
import { Code, CodeModel } from '../../db/models/codes.model';
import { MyContext } from '../types/types';
import { DocumentType } from '@typegoose/typegoose';
import XLSX from 'xlsx';
import { rm } from 'fs/promises';
import { InputFile } from 'grammy';

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numbs = '0123456789';

function randomString(strLength: number, numLength: number) {
  let result = '';
  for (let i = strLength; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  result += '-';

  for (let i = numLength; i > 0; --i) {
    result += numbs[Math.floor(Math.random() * numbs.length)];
  }

  return result;
}

export async function generateCodeCommand(ctx: MyContext) {
  if (ctx.message?.chat.id !== 915007652) {
    return await ctx.reply(`Access denied`);
  }

  const vaCount = 150_000;
  const codesLen = await CodeModel.countDocuments({}, { lean: true });

  const oldCodes = await CodeModel.find({}, { value: 1 }).lean();
  const set = new Set<string>();
  for (const oldCode of oldCodes) {
    set.add(oldCode.value);
  }

  const recursiveCodeGen = (): string => {
    let code;
    do {
      code = `VA${randomString(4, 4)}`;
    } while (set.has(code));
    set.add(code);
    return code;
  };

  const vaCodes = [];
  for (let i = 0; i < vaCount; i++) {
    vaCodes.push(new CodeModel({
      id: codesLen + i + 1,
      value: recursiveCodeGen(),
      isUsed: false,
      version: 2,
      deletedAt: null,
    }));
  }

  console.log('Saving all VA codes to MongoDB...');
  await CodeModel.bulkSave(vaCodes);
  console.log('All VA codes saved.');

  const ws = XLSX.utils.json_to_sheet(
    vaCodes.map((code) => ({
      id: code.id - codesLen,
      code: code.value,
    })),
    { header: ['id', 'code'] },
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Codes');

  const filePath = `${process.cwd()}/${new mongoose.Types.ObjectId().toString()}.xlsx`;
  XLSX.writeFileXLSX(wb, filePath);

  setTimeout(async () => {
    try {
      await rm(filePath, { force: true });
      console.log('Temporary file deleted:', filePath);
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  }, 3000);

  ctx.session.is_editable_message = true;

  try {
  console.log('Sending file to Telegram:', filePath);

  await ctx.replyWithDocument(new InputFile(filePath, 'codes.xlsx'), {
    parse_mode: 'HTML',
  });

  console.log('File successfully sent to Telegram!');
} catch (err) {
  console.error('❌ Error while sending file to Telegram:', err);
  await ctx.reply(`❌ Fayl jo‘natishda xatolik yuz berdi: ${err.message}`);
}
}

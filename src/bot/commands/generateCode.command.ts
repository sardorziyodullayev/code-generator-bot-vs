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

  const vsCount = 100_000;
  const vaCount = 150_000;
  const totalLen = vsCount + vaCount;
  const codes = new Array<DocumentType<Code>>(totalLen);

  const oldCodes = await CodeModel.find({}, { value: 1 }).lean();
  const codesLen = await CodeModel.countDocuments({}, { lean: true });

  const set = new Set<string>();
  for (const oldCode of oldCodes) {
    set.add(oldCode.value);
  }

  const recursiveCodeGen = (code: string): string => {
    if (set.has(code)) {
      return recursiveCodeGen(randomString(4, 4));
    }
    set.add(code);
    return code;
  };

  for (let i = 0; i < vsCount; i++) {
    codes[i] = new CodeModel({
      id: codesLen + i + 1,
      value: `VS${recursiveCodeGen(randomString(4, 4))}`,
      isUsed: false,
      version: 2,
      deletedAt: null,
    });
  }

  for (let i = 0; i < vaCount; i++) {
    codes[vsCount + i] = new CodeModel({
      id: codesLen + vsCount + i + 1,
      value: `VA${recursiveCodeGen(randomString(4, 4))}`,
      isUsed: false,
      version: 2,
      deletedAt: null,
    });
  }

  const res = await CodeModel.bulkSave(codes);
  const ws = XLSX.utils.json_to_sheet(
    codes.map((code) => ({
      id: code.id - codesLen,
      code: code.value,
    })),
    { header: ['id', 'code'] },
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Codes');

  const filePath = `${process.cwd()}/files/${new mongoose.Types.ObjectId().toString()}.xlsx`;

  XLSX.writeFileXLSX(wb, filePath);

  setTimeout(async () => {
    await rm(filePath, { force: true });
  }, 3000);

  ctx.session.is_editable_message = true;

  return await ctx.replyWithDocument(new InputFile(filePath, 'codes.xlsx'), {
    parse_mode: 'HTML',
  });
}

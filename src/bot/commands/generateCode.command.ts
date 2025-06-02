import mongoose from 'mongoose';
import { Code, CodeModel } from '../../db/models/codes.model';
import { MyContext } from '../types/types';
import { DocumentType } from '@typegoose/typegoose';
import XLSX from 'xlsx';
import { rm } from 'fs/promises';
import { InputFile } from 'grammy';
import path from 'path';

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
  const codesLen = await CodeModel.countDocuments({}, { lean: true });
  const oldCodes = await CodeModel.find({}, { value: 1 }).lean();

  const set = new Set<string>();
  for (const oldCode of oldCodes) {
    set.add(oldCode.value);
  }

  const recursiveCodeGen = (prefix: string): string => {
    let code;
    do {
      code = `${prefix}${randomString(4, 4)}`;
    } while (set.has(code));
    set.add(code);
    return code;
  };

  const vsCodes: DocumentType<Code>[] = [];
  for (let i = 0; i < vsCount; i++) {
    vsCodes.push(new CodeModel({
      id: codesLen + i + 1,
      value: recursiveCodeGen('VS'),
      isUsed: false,
      version: 2,
      deletedAt: null,
    }));
  }

  console.log('Saving VS codes...');
  await CodeModel.bulkSave(vsCodes);
  console.log('VS codes saved.');

  const vsSheet = XLSX.utils.json_to_sheet(
    vsCodes.map(code => ({
      id: code.id,
      code: code.value,
    })),
    { header: ['id', 'code'] }
  );
  const vsWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(vsWb, vsSheet, 'VS Codes');
  const vsFileName = `VS_${new mongoose.Types.ObjectId().toString()}.xlsx`;
  const vsFilePath = path.join(process.cwd(), vsFileName);
  XLSX.writeFileXLSX(vsWb, vsFilePath);

  const vaCodes: DocumentType<Code>[] = [];
  for (let i = 0; i < vaCount; i++) {
    vaCodes.push(new CodeModel({
      id: codesLen + vsCount + i + 1,
      value: recursiveCodeGen('VA'),
      isUsed: false,
      version: 2,
      deletedAt: null,
    }));
  }

  console.log('Saving VA codes...');
  await CodeModel.bulkSave(vaCodes);
  console.log('VA codes saved.');

  const vaSheet = XLSX.utils.json_to_sheet(
    vaCodes.map(code => ({
      id: code.id,
      code: code.value,
    })),
    { header: ['id', 'code'] }
  );
  const vaWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(vaWb, vaSheet, 'VA Codes');
  const vaFileName = `VA_${new mongoose.Types.ObjectId().toString()}.xlsx`;
  const vaFilePath = path.join(process.cwd(), vaFileName);
  XLSX.writeFileXLSX(vaWb, vaFilePath);

  ctx.session.is_editable_message = true;

  try {
    await ctx.replyWithDocument(new InputFile(vsFilePath, vsFileName), {
      caption: 'VS codes',
      parse_mode: 'HTML',
    });

    await ctx.replyWithDocument(new InputFile(vaFilePath, vaFileName), {
      caption: 'VA codes',
      parse_mode: 'HTML',
    });

    console.log('Files sent successfully.');
  } catch (err) {
    console.error('Error sending files:', err);
    await ctx.reply('❌ Fayllarni yuborishda xatolik yuz berdi.');
  } finally {
    try {
      await rm(vsFilePath, { force: true });
      await rm(vaFilePath, { force: true });
      console.log('Temporary files deleted.');
    } catch (err) {
      console.error('Failed to delete temp files:', err);
    }
  }
}

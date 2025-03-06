import 'dotenv/config';
import { GiftType } from '../../db/models/gifts.model';

interface MessageI {
  start: number;
  codeFake: number;
  codeUsed: number;
  codeReal: number;
  codeWithGift: Record<GiftType, number>;
  codeUsageLimit: number;
}

export const BOT_TOKEN = process.env.BOT_TOKEN as string;
export const messageIds: Record<'uz' | 'ru', MessageI> = {
  uz: {
    start: 3,
    codeWithGift: {
      premium: 32,
      standard: 34,
      economy: 36,
      symbolic: 38,
    },
    codeReal: 12,
    codeFake: 13,
    codeUsed: 19,
    codeUsageLimit: 40
  },
  ru: {
    start: 14,
    codeWithGift: {
      premium: 33,
      standard: 35,
      economy: 37,
      symbolic: 39,
    },
    codeReal: 16,
    codeFake: 17,
    codeUsed: 20,
    codeUsageLimit: 41
  },
};

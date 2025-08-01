import { InputFile } from 'grammy';
import { CodeModel } from '../../db/models/codes.model';
import { MyContext } from '../types/types';
import bot from '../core/bot';
import { chooseLang } from '../helpers/inline.keyboard';
import { UserModel } from '../../db/models/users.model';
import { contactRequestKeyboard } from '../helpers/keyboard';
import { mainMenu } from '../commands/start.handler';
import { phoneCheck } from '../helpers/util';
import { GiftModel } from '../../db/models/gifts.model';
import { messageIds } from '../config';
import { CodeLogModel } from '../../db/models/code-logs.model';
import { Types } from 'mongoose';
import { SettingsModel } from '../../db/models/settings.model';
import winners from '../../config/winners.json';

const channelId = -1001886860465;

type GiftTier = 'premium' | 'standard' | 'economy' | 'symbolic';
const norm = (s: string) => (s || '').trim().toUpperCase();
const hyphenize = (s: string) =>
  s.includes('-') ? s : (s.length > 6 ? s.slice(0, 6) + '-' + s.slice(6) : s);

const tierMap = new Map<string, GiftTier>();
if ((winners as any)?.tiers) {
  for (const [tier, arr] of Object.entries(winners.tiers as Record<string, string[]>)) {
    for (const code of arr || []) tierMap.set(norm(code), tier as GiftTier);
  }
}
const getTier = (code: string): GiftTier | null => tierMap.get(norm(code)) ?? null;

async function registerUserName(ctx: MyContext) {
  const text = ctx.message!.text as string;
  await UserModel.findByIdAndUpdate(ctx.session.user.db_id, { $set: { firstName: text } }, { lean: true });
  ctx.session.user.first_name = text;
  ctx.session.user_state = 'REGISTER_PHONE_NUMBER';
  ctx.session.is_editable_image = false;
  ctx.session.is_editable_message = false;

  return await ctx.reply(ctx.i18n.t('auth.requestPhoneNumber'), {
    reply_markup: contactRequestKeyboard(ctx.i18n.t('auth.sendContact')),
    parse_mode: 'HTML',
  });
}

async function registerUserPhoneNumber(ctx: MyContext) {
  const text = ctx.message?.text?.replace('+', '') as string;
  const contact = ctx.message?.contact;
  let phoneNumber = '';

  if (text && phoneCheck(text)) phoneNumber = text;
  else if (contact && contact.phone_number && phoneCheck(contact.phone_number)) phoneNumber = contact.phone_number;
  else return await ctx.reply(ctx.i18n.t('validation.invalidPhoneNumber'));

  phoneNumber = phoneNumber.replace('+', '');
  await UserModel.findByIdAndUpdate(ctx.session.user.db_id, { $set: { phoneNumber } }, { lean: true });

  ctx.session.user_state = '';
  ctx.session.is_editable_image = false;
  ctx.session.is_editable_message = false;

  const msg = await ctx.reply('.', { reply_markup: { remove_keyboard: true } });
  await ctx.api.deleteMessage(msg.chat.id, msg.message_id);
  return await mainMenu(ctx);
}

async function checkCode(ctx: MyContext) {
  const lang = ctx.i18n.languageCode as 'uz' | 'ru';

  if (ctx.session.is_editable_message && ctx.session.main_menu_message) {
    await ctx.api.editMessageReplyMarkup(ctx.message!.chat.id, ctx.session.main_menu_message.message_id, {
      reply_markup: { inline_keyboard: [] },
    });
    ctx.session.main_menu_message = undefined;
  }

  ctx.session.is_editable_image = false;
  ctx.session.is_editable_message = false;

  const usedCodesCount = await CodeModel.countDocuments({ usedById: ctx.session.user.db_id, deletedAt: null });
  const settings = await SettingsModel.findOne({ deletedAt: null }).lean();

  if (settings?.codeLimitPerUser?.status && settings.codeLimitPerUser.value <= usedCodesCount) {
    return await ctx.api.forwardMessage(ctx.from.id, channelId, messageIds[lang].codeUsageLimit);
  }

  const raw = (ctx.message?.text ?? '').trim();
  const upper = norm(raw);
  const hyphened = hyphenize(upper);
  const variants = Array.from(new Set([raw, upper, hyphened].filter(Boolean)));

  const tier = getTier(hyphened);
  const code = await CodeModel.findOne(
    { $and: [{ $or: variants.map((v) => ({ value: v })) }, { deletedAt: null }] },
    { value: 1, isUsed: 1, usedById: 1, giftId: 1, productId: 1 },
  ).lean();

  await CodeLogModel.create({
    _id: new Types.ObjectId(),
    userId: ctx.session.user.db_id,
    value: ctx.message!.text,
    codeId: code ? code._id : null,
  });

  if (!tier) {
    const msgId = code ? messageIds[lang].codeReal : messageIds[lang].codeFake;
    return await ctx.api.forwardMessage(ctx.from.id, channelId, msgId);
  }

  if (code?.isUsed && code.usedById?.toString() !== ctx.session.user.db_id.toString()) {
    return await ctx.api.forwardMessage(ctx.from.id, channelId, messageIds[lang].codeUsed);
  }

  const nowIso = new Date().toISOString();
  if (!code) {
    await CodeModel.create({
      value: hyphened,
      version: 2,
      giftId: null,
      isUsed: true,
      usedById: ctx.session.user.db_id,
      usedAt: nowIso,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else if (!code.isUsed) {
    await CodeModel.updateOne(
      { _id: code._id },
      { $set: { isUsed: true, usedAt: nowIso, usedById: ctx.session.user.db_id } },
      { lean: true },
    );
  }

  return await ctx.api.forwardMessage(ctx.from.id, channelId, messageIds[lang].codeWithGift[tier]);
}

const onMessageHandler = async (ctx: MyContext) => {
  switch (ctx.session.user_state) {
    case 'REGISTER_NAME':
      return await registerUserName(ctx);
    case 'REGISTER_PHONE_NUMBER':
      return await registerUserPhoneNumber(ctx);
    default:
      return await checkCode(ctx);
  }
};

bot.on('message', onMessageHandler);

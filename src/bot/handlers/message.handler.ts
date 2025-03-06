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

const channelId = -1001886860465;

async function registerUserName(ctx: MyContext) {
  const text = ctx.message!.text as string;

  await UserModel.findByIdAndUpdate(
    ctx.session.user.db_id,
    {
      $set: { firstName: text },
    },
    { lean: true },
  );

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

  if (text && phoneCheck(text)) {
    phoneNumber = text;
  } else if (contact && contact.phone_number && phoneCheck(contact.phone_number)) {
    phoneNumber = contact.phone_number;
  } else {
    return await ctx.reply(ctx.i18n.t('validation.invalidPhoneNumber'));
  }

  phoneNumber = phoneNumber.replace('+', '');

  await UserModel.findByIdAndUpdate(
    ctx.session.user.db_id,
    {
      $set: { phoneNumber: phoneNumber },
    },
    { lean: true },
  );

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

  const usedCodesCount = await CodeModel.find({ usedById: ctx.session.user.db_id, deletedAt: null }).count();

  const settings = await SettingsModel.findOne({ deletedAt: null }).lean();

  if (settings.codeLimitPerUser.status && settings.codeLimitPerUser.value >= usedCodesCount) {
    return await ctx.api.forwardMessage(ctx.from.id, channelId, messageIds[lang].codeUsageLimit);
  }

  const text = (ctx.message?.text ?? '').toUpperCase();

  const code = await CodeModel.findOne(
    {
      $and: [
        {
          $or: [
            { value: ctx.message?.text },
            { value: text },
            { value: text.substring(0, 6) + '-' + text.substring(6) },
          ],
        },
        { deletedAt: null },
      ],
    },
    { value: 1, isUsed: 1, usedById: 1, giftId: 1, productId: 1 },
  ).lean();

  await CodeLogModel.create({
    _id: new Types.ObjectId(),
    userId: ctx.session.user.db_id,
    value: ctx.message.text,
    codeId: code ? code._id : null,
  });

  if (!code) {
    return await ctx.api.forwardMessage(ctx.from.id, channelId, messageIds[lang].codeFake);
    return await ctx.api.forwardMessage(ctx.from.id, -1001886860465, lang == 'uz' ? 12 : 17);
  }

  if (code.isUsed && code.usedById && code.usedById.toString() !== ctx.session.user.db_id.toString()) {
    return await ctx.api.forwardMessage(ctx.from.id, channelId, messageIds[lang].codeUsed);
    return await ctx.api.forwardMessage(ctx.from.id, -1001886860465, lang == 'uz' ? 19 : 20);
  }

  if (!code.isUsed) {
    await CodeModel.updateOne(
      { _id: code._id },
      {
        $set: {
          isUsed: true,
          usedAt: new Date().toISOString(),
          usedById: ctx.session.user.db_id,
        },
      },
      { lean: true, new: true },
    );
  }

  let caption = ctx.i18n.t('common.codeReal');
  if (!code.giftId) {
    return await ctx.api.forwardMessage(ctx.from.id, channelId, messageIds[lang].codeReal);
    return await ctx.api.forwardMessage(ctx.from.id, -1001886860465, lang == 'uz' ? 12 : 15);
  }

  const gift = await GiftModel.findById(code.giftId).lean();
  caption = ctx.i18n.t('common.codeWithGift');

  await GiftModel.findByIdAndUpdate(
    code.giftId,
    {
      $set: {
        $inc: {
          usedCount: await CodeModel.countDocuments({ giftId: gift._id }).lean(),
        },
      },
    },
    { lean: true },
  );
  return await ctx.api.forwardMessage(ctx.from.id, channelId, messageIds[lang].codeWithGift[gift.type]);
  return await ctx.api.forwardMessage(ctx.from.id, -1001886860465, 8);

  const filePath = `${process.cwd()}/files/${gift!.image}`;
  ctx.session.is_editable_image = true;
  ctx.session.is_editable_message = false;

  return await ctx.replyWithPhoto(new InputFile(filePath), {
    caption: caption,
    parse_mode: 'HTML',
  });
}

const onMessageHandler = async (ctx: MyContext) => {
  // console.log(ctx.message);

  // await ctx.api.forwardMessage(ctx.from.id, -1001886860465, 3);
  // return;
  switch (ctx.session.user_state) {
    case 'REGISTER_NAME':
      return await registerUserName(ctx);
      break;
    case 'REGISTER_PHONE_NUMBER':
      return await registerUserPhoneNumber(ctx);
      break;
    default:
      return await checkCode(ctx);
      break;
  }
};

bot.on('message', onMessageHandler);

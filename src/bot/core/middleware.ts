import * as path from 'path';
import { I18n } from '@grammyjs/i18n';
import { NextFunction, session } from 'grammy';
import { SessionData } from '../types/session';
import { MyContext } from '../types/types';
import { User, UserModel } from '../../db/models/users.model';
import mongoose from 'mongoose';
import { chooseLang } from '../helpers/inline.keyboard';
import { contactRequestKeyboard } from '../helpers/keyboard';

function initial(): SessionData {
  const session: SessionData = {
    step: '',
    user_state: '',
    is_editable_message: false,
    is_editable_image: false,
    main_menu_message: undefined,
    user: {
      id: 1,
      first_name: '',
      is_bot: false,
      db_id: new mongoose.Types.ObjectId(),
      lang: 'uz',
    },
  };
  return session;
}

export const sessionMiddleware = session({ initial });
export const i18n = new I18n({
  defaultLanguageOnMissing: true, // implies `allowMissing` = `true`
  directory: path.resolve(__dirname, '../locales'),
  defaultLanguage: 'uz',
  sessionName: 'i18n_session',
  useSession: true,
});

// i18n.loadLocale("uz", {});

async function registerUserLang(ctx: MyContext) {
  ctx.session.user_state = 'REGISTER_LANG';

  return await ctx.reply(ctx.i18n.t('auth.requestChooseLang'), {
    reply_markup: chooseLang,
    parse_mode: 'HTML',
  });
}

export async function registerUserFirstName(ctx: MyContext) {
  ctx.session.user_state = 'REGISTER_NAME';

  return await ctx.reply(ctx.i18n.t('auth.requestName'), {
    parse_mode: 'HTML',
  });
}

export const checkUserMiddleWare = async (ctx: MyContext, next: NextFunction) => {
  if (ctx.chat?.type !== 'private') {
    return;
    // return next();
  }

  ctx.session.user_state = ctx.session.user_state || '';
  ctx.session.user.id = ctx.from?.id as number;
  ctx.session.user.first_name = ctx.from?.first_name as string;
  ctx.session.user.is_bot = ctx.from?.is_bot as boolean;

  const user = await UserModel.findOne({ tgId: ctx.from?.id }).lean();
  if (!user) {
    const newUser = await new UserModel({
      _id: new mongoose.Types.ObjectId(),
      tgId: ctx.from?.id,
      tgFirstName: ctx.from?.first_name,
      tgLastName: ctx.from?.last_name,
      lastUseAt: new Date().toISOString(),
      phoneNumber: '',
    }).save();

    ctx.session.user = {
      db_id: newUser._id,
      first_name: newUser.firstName,
      id: newUser.id,
      is_bot: false,
      lang: newUser.lang,
    };

    return registerUserLang(ctx);
  }

  // await UserModel.findOneAndUpdate(
  //   { _id: user._id },
  //   { $set: { lastUseAt: new Date() } },
  //   { lean: true },
  // );

  ctx.session.user = {
    db_id: user._id,
    first_name: user.firstName,
    id: user.id,
    is_bot: false,
    lang: user.lang,
  };

  if (!user.lang) {
    if (ctx.session.user_state === 'REGISTER_LANG' && ctx.callbackQuery) {
      return next();
    }

    return registerUserLang(ctx);
  }
  ctx.i18n.locale(user.lang);

  if (!user.firstName) {
    if (
      ctx.session.user_state === 'REGISTER_NAME' &&
      ctx.message?.text &&
      !ctx.message?.text?.includes('/')
    ) {
      return next();
    }

    return await registerUserFirstName(ctx);
  }

  if (!user.phoneNumber) {
    if (
      ctx.session.user_state === 'REGISTER_PHONE_NUMBER' &&
      (ctx.message?.contact || (ctx.message?.text && !ctx.message?.text?.includes('/')))
    ) {
      return next();
    }

    ctx.session.user_state = 'REGISTER_PHONE_NUMBER';

    return await ctx.reply(ctx.i18n.t('auth.requestPhoneNumber'), {
      reply_markup: contactRequestKeyboard(ctx.i18n.t('auth.requestPhoneNumber')),
      parse_mode: 'HTML',
    });
  }

  return next();
};

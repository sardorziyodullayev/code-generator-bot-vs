import { CallbackActions, Languages } from "../types/enum";
import { MyContext } from "../types/types";
import bot from "../core/bot";
import {
  languagesListInline,
  settingsInline,
} from "../helpers/inline.keyboard";
import { UserModel } from "../../db/models/users.model";
import { registerUserFirstName } from "../core/middleware";

async function setLang(ctx: MyContext, lang: string) {
  await UserModel.findByIdAndUpdate(
    ctx.session.user.db_id,
    {
      $set: { lang: lang },
    },
    { lean: true },
  );
  ctx.session.user.lang = lang;
  ctx.i18n.locale(lang);
}

bot.callbackQuery(CallbackActions.SETTINGS, async (ctx) => {
  await ctx.answerCallbackQuery();

  if (ctx.session.is_editable_message == true) {
    return await ctx.editMessageText(ctx.i18n.t("menu.settingsContent"), {
      reply_markup: settingsInline(ctx),
    });
  } else {
    ctx.session.is_editable_message = true;
    return await ctx.reply(ctx.i18n.t("menu.settingsContent"), {
      reply_markup: settingsInline(ctx),
    });
  }
});

bot.callbackQuery(CallbackActions.LANG_LIST, async (ctx) => {
  await ctx.answerCallbackQuery();

  if (ctx.session.is_editable_message == true) {
    return await ctx.editMessageText(ctx.i18n.t("menu.langListContent"), {
      reply_markup: languagesListInline(ctx),
    });
  } else {
    ctx.session.is_editable_message = true;
    return await ctx.reply(ctx.i18n.t("menu.langListContent"), {
      reply_markup: languagesListInline(ctx),
    });
  }
});

bot.callbackQuery(
  new RegExp(`^${CallbackActions.CHANGE_LANG}.`),
  async (ctx) => {
    await ctx.answerCallbackQuery();

    const [, lang] = ctx.callbackQuery.data.split(".");

    if (ctx.session.user.lang == lang) return;

    await setLang(ctx, lang as string);

    if (ctx.session.user_state === "REGISTER_LANG") {
      await ctx.deleteMessage();
      return await registerUserFirstName(ctx);
    }

    if (ctx.session.is_editable_message == true) {
      return await ctx.editMessageText(ctx.i18n.t("menu.langListContent"), {
        reply_markup: languagesListInline(ctx),
      });
    } else {
      ctx.session.is_editable_message = true;
      return await ctx.reply(ctx.i18n.t("menu.langListContent"), {
        reply_markup: languagesListInline(ctx),
      });
    }
  },
);

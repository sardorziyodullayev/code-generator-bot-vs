import bot from "../core/bot";
import { CallbackActions } from "../types/enum";
import { backInlineKeyboard } from "../helpers/inline.keyboard";

bot.callbackQuery(CallbackActions.ABOUT, async (ctx) => {
  await ctx.answerCallbackQuery();
  const replyMarkup = backInlineKeyboard(
    ctx.i18n.t("common.back"),
    CallbackActions.MAIN_MENU,
  );

  if (ctx.session.is_editable_message == true) {
    return await ctx.editMessageText(ctx.i18n.t("menu.aboutContent"), {
      reply_markup: replyMarkup,
    });
  } else {
    ctx.session.is_editable_message = true;
    return await ctx.reply(ctx.i18n.t("menu.aboutContent"), {
      reply_markup: replyMarkup,
    });
  }
});

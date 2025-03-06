import { InlineKeyboard, Keyboard } from "grammy";
import { CallbackActions, Languages } from "../types/enum";
import { MyContext } from "../types/types";

const languages = [
  { title: "🇺🇿 O'zbek", key: Languages.UZ },
  { title: "🇷🇺 Русский", key: Languages.RU },
];

const chooseLang = new InlineKeyboard();
languages.map((lang) => {
  chooseLang
    .text(lang.title, `${CallbackActions.CHANGE_LANG}.${lang.key}`)
    .row();
});

export { chooseLang };
// export const chooseLang = new InlineKeyboard()
//   .text("🇺🇿 O'zbek", `${CallbackActions.CHANGE_LANG}.${Languages.UZ}`)
//   .row()
//   .text("🇷🇺 Русский", `${CallbackActions.CHANGE_LANG}.${Languages.RU}`);

export const mainMenuInline = (ctx: MyContext) =>
  new InlineKeyboard()
    .text(ctx.i18n.t("inlineKeyboard.aboutMenu"), CallbackActions.ABOUT)
    .row()
    .text(ctx.i18n.t("inlineKeyboard.settingsMenu"), CallbackActions.SETTINGS)
    .row();

export const settingsInline = (ctx: MyContext) =>
  new InlineKeyboard()
    .text(ctx.i18n.t("inlineKeyboard.changeLang"), CallbackActions.LANG_LIST)
    .row()
    .text(ctx.i18n.t("common.back"), CallbackActions.MAIN_MENU)
    .row();

export const languagesListInline = (ctx: MyContext) => {
  const inline = new InlineKeyboard();

  languages.map((lang) => {
    inline.text(lang.title, `${CallbackActions.CHANGE_LANG}.${lang.key}`).row();
  });

  inline.text(ctx.i18n.t("common.back"), CallbackActions.SETTINGS).row();

  return inline;
};

export const customListInlineKeyboard = (
  list: any[],
  name: string,
  id: string,
  callback_data: string,
  back_title: string,
  back_callback_data: string,
): InlineKeyboard => {
  const inline_keyboard = new InlineKeyboard();

  for (const item of list) {
    inline_keyboard.text(item[name], `${callback_data}.${item[id]}`).row();
  }

  return inline_keyboard.text(back_title, back_callback_data);
};

export const backInlineKeyboard = (
  back_title: string,
  back_callback_data: string,
): InlineKeyboard => new InlineKeyboard().text(back_title, back_callback_data);

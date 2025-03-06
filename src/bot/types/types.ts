import { Context, SessionFlavor } from "grammy";
import { SessionData } from "./session";
import { I18nContextFlavor } from "@grammyjs/i18n";

export type MyContext = Context &
  SessionFlavor<SessionData> &
  I18nContextFlavor;

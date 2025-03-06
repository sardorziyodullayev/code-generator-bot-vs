import { Keyboard } from "grammy";

export const contactRequestKeyboard = (reqText: string) =>
  new Keyboard().requestContact(reqText).resized(true);

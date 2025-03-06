import { Message } from "grammy/out/types.node";
import { SessionBasketInterface, UserInterface } from "./interfaces";

export interface SessionData {
  step: "REGISTER_LANG" | "REGISTER_NAME" | "REGISTER_PHONE_NUMBER" | "";
  user_state: "REGISTER_LANG" | "REGISTER_NAME" | "REGISTER_PHONE_NUMBER" | "";
  is_editable_message: boolean;
  main_menu_message: Message.TextMessage | undefined;
  is_editable_image: boolean;
  user: UserInterface;
}

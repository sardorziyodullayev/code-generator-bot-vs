// import './start.handler'
// import './birthday.command'
import bot from "../core/bot";
import { generateCodeCommand } from "./generateCode.command";
import { mainMenu } from "./start.handler";

bot.command("generate", generateCodeCommand);
bot.command("start", async ctx => mainMenu(ctx));

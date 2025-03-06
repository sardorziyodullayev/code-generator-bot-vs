import { CallbackActions } from "../types/enum";
import { mainMenu } from "../commands/start.handler";
import bot from "../core/bot";

bot.callbackQuery(CallbackActions.MAIN_MENU, async (ctx) => {
    await ctx.answerCallbackQuery()

    return mainMenu(ctx, true)
})
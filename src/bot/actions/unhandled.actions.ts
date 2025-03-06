import bot from "../core/bot";

bot.on("callback_query:data", async (ctx) => {
    console.log("Unknown button event with payload", ctx.callbackQuery.data);
    await ctx.answerCallbackQuery(); // remove loading animation
});
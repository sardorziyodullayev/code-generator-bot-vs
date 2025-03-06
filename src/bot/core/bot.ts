import { Bot } from 'grammy';
import { BOT_TOKEN } from '../config';
import { MyContext } from '../types/types';
import { checkUserMiddleWare, i18n, sessionMiddleware } from './middleware';

const bot = new Bot<MyContext>(BOT_TOKEN);
bot.command('test', (ctx)=> {
  console.log(ctx.message);
  
})
bot.use(sessionMiddleware);
bot.use(i18n.middleware());

// bot.use((ctx) => {
//   console.log(ctx.channelPost);
//   console.log(ctx.chat);
//   console.log(ctx.from);
  
//   console.log(ctx.message);

//   return;
// });
bot.use(checkUserMiddleWare);

bot.api.setMyCommands([
  { command: 'start', description: 'start' },
  // { command: "generate", description: "For gen codes" },
]);

bot.catch((err) => {
  console.log(`Error catch bot error:`, err);
});

bot.start({
  onStart: (botInfo) => {
    console.log(`@${botInfo.username}`);
  },
});

export default bot;

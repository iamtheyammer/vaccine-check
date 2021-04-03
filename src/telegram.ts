import { Telegraf } from "telegraf";
import { createLogger } from "./logger";

const logger = createLogger("telegram");

const {
  TELEGRAM_KEY: telegramKey,
  TELEGRAM_CHANNEL_ID: channelId,
} = process.env;

if (!telegramKey || !channelId) {
  logger.error({
    message:
      "Unable to find the TELEGRAM_KEY or the TELEGRAM_CHANNEL_ID required environment variable",
  });
  process.exit(1);
}

const bot = new Telegraf(telegramKey);

bot.start((ctx) => {
  ctx.reply("This bot only works in approved Channels. Sorry.");
});

bot.help((ctx) => {
  ctx.reply("This bot only works in approved Channels. Sorry.");
});

export default function sendChatAlert(message: string) {
  // @ts-ignore
  bot.telegram.sendMessage(channelId, message);
}

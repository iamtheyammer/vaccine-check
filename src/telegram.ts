import { Telegraf } from "telegraf";
import { createLogger } from "./logger";
import { Location } from "./myturn/api/locationSearch";
import { LocationAvailabilityDate } from "./myturn/api/getLocationAvailableDates";
import dayjs from "dayjs";

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

export function sendNoLongerAvailableAtLocation(location: Location) {
  sendChatAlert(`No more appointments are available at ${location.name}.
You will be notified when more appointments are available.`);
}

export function sendAvailableAtLocation(
  location: Location,
  availabilityDate: LocationAvailabilityDate
) {
  sendChatAlert(`Appointments are available at ${location.name}!
  
The next available date is ${dayjs(availabilityDate.date).format(
    "dddd MMMM DD, YYYY"
  )}.`);
}

function sendChatAlert(message: string) {
  // @ts-ignore
  bot.telegram.sendMessage(channelId, message);
}

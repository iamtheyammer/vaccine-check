import Twitter from "twitter";
import { createLogger } from "./logger";
import {
  TWITTER_CONSUMER_KEY,
  TWITTER_ACCESS_TOKEN_KEY,
  TWITTER_ACCESS_TOKEN_SECRET,
  TWITTER_CONSUMER_SECRET,
} from "./env";

import { VaccinationLocation } from "./myturn/api/locationSearch";
import { LocationAvailabilityDate } from "./myturn/api/getLocationAvailableDates";
import { LocationAvailableSlotsResponseSlot } from "./myturn/api/getLocationAvailableSlots";
import dayjs from "dayjs";

const logger = createLogger("twitter");

let clientAvailable = false;

if (
  !TWITTER_CONSUMER_KEY ||
  !TWITTER_CONSUMER_SECRET ||
  !TWITTER_ACCESS_TOKEN_KEY ||
  !TWITTER_ACCESS_TOKEN_SECRET
) {
  logger.error({
    message:
      "Twitter environment variables are missing. Twitter integration is not available.",
  });
} else {
  clientAvailable = true;
}

const client = new Twitter({
  consumer_key: TWITTER_CONSUMER_KEY || "",
  consumer_secret: TWITTER_CONSUMER_SECRET || "",
  access_token_key: TWITTER_ACCESS_TOKEN_KEY || "",
  access_token_secret: TWITTER_ACCESS_TOKEN_SECRET || "",
});

const tweetFooter = `\n\n#COVID19 #TeamVaccine #VaccinateALL58 #BayArea`;

export function sendAvailableAtLocation(
  location: VaccinationLocation,
  availabilityDate: LocationAvailabilityDate,
  slotsWithAvailability: LocationAvailableSlotsResponseSlot[]
) {
  return sendChatAlert(
    `New appointments are available at ${location.name}!

The next available date (${dayjs(availabilityDate.date).format(
      "dddd MMMM DD, YYYY"
    )}) has up to ${slotsWithAvailability.length} slots available.

Schedule now at myturn.ca.gov.`,
    location.location
  );
}

export function sendNoLongerAvailableAtLocation(location: VaccinationLocation) {
  return sendChatAlert(
    `No more appointments are available at ${location.name}.`
  );
}

export async function sendChatAlert(
  message: string,
  location?: { lng: string; lat: string }
) {
  if (!clientAvailable) {
    logger.warn({
      message: `Unable to tweet because an environment variable is missing. Planned tweet: ${message}`,
      location,
    });
    return;
  }

  const tweet: {
    status: string;
    lat?: string;
    long?: string;
  } = {
    status: `${message}${tweetFooter}`,
  };

  if (location) {
    tweet.lat = location.lat;
    tweet.long = location.lng;
  }

  return client.post("statuses/update", tweet);
}

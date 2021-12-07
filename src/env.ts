export const {
  MYTURN_COOKIE,
  HTTP_PROXY,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_ACCESS_TOKEN_KEY,
  TWITTER_ACCESS_TOKEN_SECRET,
  DEBUG_ONE_LOCATION,
} = process.env;

export let CHECK_INTERVAL = 150000;

if (process.env.CHECK_INTERVAL) {
  const checkInterval = parseInt(process.env.CHECK_INTERVAL);

  if (!isNaN(checkInterval) && checkInterval > 0) {
    CHECK_INTERVAL = checkInterval;
  }
}

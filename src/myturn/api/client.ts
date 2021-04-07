import axios, { AxiosRequestConfig } from "axios";
import { HTTP_PROXY, MYTURN_COOKIE } from "../../env";
import axiosCookieJarSupport from "axios-cookiejar-support";
import {CookieJar} from "tough-cookie";

const clientConfig: AxiosRequestConfig = {
  baseURL: "https://api.myturn.ca.gov/public/",
  headers: {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-gpc": "1",
    "sec-ch-ua-mobile": "?0",
    origin: "https://myturn.ca.gov",
    referer: "https://myturn.ca.gov",
    "sec-ch-ua": `"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"`,
  },
  withCredentials: true,
};

if (HTTP_PROXY) {
  const [host, portStr] = HTTP_PROXY.split(":");
  const port = parseInt(portStr);

  clientConfig.proxy = {
    host,
    port,
  };
}

const client = axios.create(clientConfig);

// tough cookie support
const cookieJar = new CookieJar()
axiosCookieJarSupport(client);
client.defaults.jar = cookieJar;
// silences invalid domain errors that stop the requests from working.
// @ts-ignore
client.defaults.ignoreCookieErrors = true;

export default client;

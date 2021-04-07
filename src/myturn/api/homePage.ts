import { CookieJar } from "tough-cookie";
import client from "./client";

export default async function getHomePage(): Promise<void> {
  const homeReq = await client({
    method: "GET",
    url: "https://myturn.ca.gov",
    headers: {
      Cookie: "",
    },
  });
}

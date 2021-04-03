import dayjs from "dayjs";
import client from "./client";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export interface LocationAvailabilityResponseSlot {
  date: string;
  available: boolean;
  vaccineData: string;
}

export interface LocationAvailabilityResponse {
  vaccineData: string;
  locationExtId: string;
  availability: LocationAvailabilityResponseSlot[];
}

export default async function checkLocationAvailability(
  extId: string,
  vaccineData: string
) {
  const resp = await client({
    method: "POST",
    url: `locations/${extId}/availability`,
    data: {
      startDate: dayjs().local().format("YYYY-MM-DD"),
      endDate: "2021-12-31",
      vaccineData,
      doseNumber: 1,
      url: "https://myturn.ca.gov/appointment-select",
    },
  });

  return resp.data as LocationAvailabilityResponse;
}

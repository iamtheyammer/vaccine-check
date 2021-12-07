import client from "./client";
import dayjs from "dayjs";

export interface VaccinationLocation {
  displayAddress: string;
  distanceInMeters: number;
  extId: string;
  regionExternalId: string;
  startDate: string;
  endDate: string;
  location: {
    lat: string;
    lng: string;
  };
  name: string;
  timezone: string;
  openHours: {
    days: string[];
    localStart: string;
    localEnd: string;
  }[];
  type: string;
  vaccineData: string;
}

export interface LocationSearchResponse {
  eligible: boolean;
  vaccineData: string;
  locations: VaccinationLocation[];
}

async function searchLocations(
  vaccineData: string,
  location: { lat: number; lng: number }
): Promise<LocationSearchResponse> {
  const resp = await client({
    method: "POST",
    url: "locations/search",
    data: {
      location,
      fromDate: dayjs().format("YYYY-MM-DD"),
      vaccineData,
      locationQuery: {
        includePools: ["default", "COVID"],
        includeTags: [],
        excludeTags: [],
      },
      doseNumber: 1,
      groupSize: 1,
      locationType: "CombinedBooking",
      url: "https://myturn.ca.gov/location-select",
    },
  });

  return resp.data as LocationSearchResponse;
}

export default searchLocations;

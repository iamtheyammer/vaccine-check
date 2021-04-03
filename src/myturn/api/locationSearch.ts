import client from "./client";
import dayjs from "dayjs";

export interface Location {
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
  locations: Location[];
}

async function searchLocations(
  vaccineData: string
): Promise<LocationSearchResponse> {
  const resp = await client({
    method: "POST",
    url: "locations/search",
    data: {
      location: { lat: 37.5549479, lng: -122.2710602 },
      fromDate: dayjs().format("YYYY-MM-DD"),
      vaccineData,
      locationQuery: { includePools: ["default"] },
      doseNumber: 1,
      url: "https://myturn.ca.gov/location-select",
    },
  });

  return resp.data as LocationSearchResponse;
}

export default searchLocations;

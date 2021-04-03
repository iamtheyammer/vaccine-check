import { LocationAvailabilityDate } from "./getLocationAvailableDates";
import client from "./client";

export interface LocationAvailableSlotsResponseSlot {
  localStartTime: string;
  durationSeconds: number;
}

export interface LocationAvailableSlotsResponse {
  date: string;
  locationExtId: string;
  slotsWithAvailability: LocationAvailableSlotsResponseSlot[];
  vaccineData: string;
}

export default async function getLocationAvailableSlots(
  locationExtId: string,
  slot: LocationAvailabilityDate
): Promise<LocationAvailableSlotsResponse> {
  const req = await client({
    method: "POST",
    url: `locations/${locationExtId}/date/${slot.date}/slots`,
    data: {
      url: "https://myturn.ca.gov/appointment-select",
      vaccineData: slot.vaccineData,
    },
  });

  return req.data as LocationAvailableSlotsResponse;
}

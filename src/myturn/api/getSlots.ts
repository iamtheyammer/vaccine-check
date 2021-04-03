import { LocationAvailabilityResponseSlot } from "./locationAvailability";
import client from "./client";

export interface SlotAvailabilityResponseAvailableSlot {
  localStartTime: string;
  durationSeconds: number;
}

export interface SlotAvailabilityResponse {
  date: string;
  locationExtId: string;
  slotsWithAvailability: SlotAvailabilityResponseAvailableSlot[];
  vaccineData: string;
}

export default async function getSlots(
  locationExtId: string,
  slot: LocationAvailabilityResponseSlot
): Promise<SlotAvailabilityResponse> {
  const req = await client({
    method: "POST",
    url: `locations/${locationExtId}/date/${slot.date}/slots`,
    data: {
      url: "https://myturn.ca.gov/appointment-select",
      vaccineData: slot.vaccineData,
    },
  });

  return req.data as SlotAvailabilityResponse;
}

import client from "./client";
import { AxiosError } from "axios";

export interface ReserveSlotError {
  errorType: string;
}

export interface ReserveSlotSuccessResponse {
  reservationIds: string[];
  vaccineData: string;
}

export type ReserveSlotResponse = ReserveSlotError | ReserveSlotSuccessResponse;

export default async function reserveSlot(
  date: string,
  localStartTime: string,
  locationExtId: string,
  vaccineData: string
): Promise<ReserveSlotResponse> {
  try {
    const resp = await client({
      method: "POST",
      url: `locations/${locationExtId}/date/${date}/slots/reserve`,
      data: {
        date,
        localStartTime,
        locationExtId,
        vaccineData,
        dose: 1,
        groupSize: 1,
        url: "https://myturn.ca.gov/appointment-select",
      },
    });

    return resp.data as ReserveSlotResponse;
  } catch (e) {
    if (!(e as AxiosError).response) {
      throw e;
    }

    return (e as AxiosError).response!.data as ReserveSlotError;
  }
}

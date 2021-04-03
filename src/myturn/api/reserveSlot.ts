import client from "./client";

export interface ReserveSlotError {
  errorType: string;
}

export interface ReserveSlotSuccessResponse {
  reservationId: string;
  vaccineData: string;
  vaccineDetails: {
    numberOfDoses: 1;
    daysBetweenDoses: {
      min: 1;
      max: 2;
    };
  };
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
        url: "https://myturn.ca.gov/appointment-select",
      },
    });

    return resp.data as ReserveSlotResponse;
  } catch (e) {
    if (!e.response) {
      throw e;
    }

    return e.response.data as ReserveSlotError;
  }
}

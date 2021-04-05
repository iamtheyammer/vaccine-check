import dayjs from "dayjs";
import searchLocations, {
  VaccinationLocation,
  LocationSearchResponse,
} from "./api/locationSearch";
import getLocationAvailableDates, {
  LocationAvailabilityDate,
  LocationAvailabilityResponse,
} from "./api/getLocationAvailableDates";
import getLocationAvailableSlots, {
  LocationAvailableSlotsResponse,
} from "./api/getLocationAvailableSlots";
import reserveSlot from "./api/reserveSlot";
import { createLogger } from "../logger";

import state from "./state";

const logger = createLogger("myturn");

async function runCheck() {
  // let eligibilityResponse: EligibilityResponse;
  // try {
  //   eligibilityResponse = await checkEligibility();
  // } catch (e) {
  //   console.log(`Error checking for eligibility`, e);
  //   return;
  // }
  //
  // if (!eligibilityResponse.eligible) {
  //   console.log("You are not eligible at this time");
  //   return;
  // }

  const vaccineData =
    "WyJhM3F0MDAwMDAwMEN5SkJBQTAiLCJhM3F0MDAwMDAwMDFBZExBQVUiLCJhM3F0MDAwMDAwMDFBZE1BQVUiLCJhM3F0MDAwMDAwMDFBZ1VBQVUiLCJhM3F0MDAwMDAwMDFBZ1ZBQVUiLCJhM3F0MDAwMDAwMDFBc2FBQUUiXQ==";

  let searchResponse: LocationSearchResponse;
  try {
    // searchResponse = await searchLocations(eligibilityResponse.vaccineData);
    searchResponse = await searchLocations(vaccineData);
  } catch (e) {
    logger.log({
      level: "error",
      message: "Error searching for locations, will retry",
      error: e,
    });
    return;
  }

  const availableLocations = searchResponse.locations.filter(
    (l) => l.type !== "ThirdPartyBooking"
  );

  logger.info({
    message: `Found ${availableLocations.length} locations. (${dayjs().format(
      "YYYY-MM-DDTHH:mm:ss"
    )})`,
    locations: availableLocations,
  });

  if (availableLocations.length) {
    // run availability
    availableLocations.forEach((l) => queryLocation(l));
  } else if (state.anyLocationIsAvailable()) {
    state.markAllAsUnavailable();
    return;
  } else {
    return;
  }
}

async function queryLocation(location: VaccinationLocation) {
  const { extId, name } = location;
  let availability: LocationAvailabilityResponse;
  try {
    availability = await getLocationAvailableDates(extId, location.vaccineData);
  } catch (e) {
    logger.error({
      message: `Error searching for availability at ${name}, will retry`,
      error: e,
      location,
    });
    return;
  }

  const availableDays = availability.availability.filter((a) => a.available);

  if (!availableDays.length) {
    logger.info({
      message: `No availability at ${name}.`,
      location,
    });
    state.markLocationAsUnavailable(location);
    return;
  }

  logger.info({
    message: `Availability at ${location.name} on ${availableDays
      .map((d) => d.date)
      .join(", ")}!`,
    availableDays,
    location,
  });

  // check all days until we find a match or run out of days.
  availableDays.reverse();

  for (const day of availableDays) {
    const dayWasAvailable = await queryLocationOnDate(location, day);

    if (dayWasAvailable) {
      logger.info(
        `${name} is available on ${day.date}, no longer searching for available dates.`
      );
      break;
    }
  }
}

async function queryLocationOnDate(
  location: VaccinationLocation,
  dayToCheck: LocationAvailabilityDate
): Promise<boolean> {
  // check slot availability
  let availableSlotsReq: LocationAvailableSlotsResponse;
  try {
    availableSlotsReq = await getLocationAvailableSlots(
      location.extId,
      dayToCheck
    );
  } catch (e) {
    logger.error({
      message: `Error checking for slot availability at ${location.name}`,
      error: e,
      location,
    });
    return false;
  }

  if (!availableSlotsReq.slotsWithAvailability) {
    state.markLocationAsUnavailable(location);
    logger.info({
      message: `No slots available at ${location.name}`,
      location,
    });
    return false;
  }

  if (availableSlotsReq.slotsWithAvailability.length < 2) {
    state.markLocationAsUnavailable(location);
    logger.info({
      message: `Only one slot available at ${location.name}`,
      location,
    });
    return false;
  }

  // slot appears to be available, reserve it
  const slotToReserve =
    availableSlotsReq.slotsWithAvailability[
      availableSlotsReq.slotsWithAvailability.length - 1
    ];

  const slotReservation = await reserveSlot(
    dayToCheck.date,
    slotToReserve.localStartTime,
    location.extId,
    dayToCheck.vaccineData
  );

  if ("errorType" in slotReservation) {
    if (slotReservation.errorType === "location_no_capacity") {
      state.markLocationAsUnavailable(location);
      return false;
    }

    logger.warn({
      message: `Error booking a slot at ${location.name} for ${slotToReserve.localStartTime} on ${dayToCheck.date}: ${slotReservation.errorType}`,
      location,
      slotReservation,
      dayToCheck,
      slotToReserve,
    });
    return false;
  }

  // slot is available and unfortunately reserved to us for 15 mins :(
  state.markLocationAsAvailable(
    location,
    dayToCheck,
    availableSlotsReq.slotsWithAvailability
  );
  logger.info({
    message: `${availableSlotsReq.slotsWithAvailability.length} time slots available at ${location.name} (${location.extId}) on ${dayToCheck.date} at ${slotToReserve.localStartTime}.`,
    slotReservation,
  });

  return true;
}

runCheck();

setInterval(runCheck, 60000);

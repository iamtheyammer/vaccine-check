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
  LocationAvailableSlotsResponseSlot,
} from "./api/getLocationAvailableSlots";
import reserveSlot, { ReserveSlotResponse } from "./api/reserveSlot";
import { createLogger } from "../logger";

import state from "./state";
import { CHECK_INTERVAL } from "../env";

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

  let oneDayIsAvailable = false;
  for (const day of availableDays) {
    const {
      slotsWithAvailability,
      selectedSlot,
      error,
    } = await queryLocationOnDate(location, day);

    if (error) {
      logger.warn({
        message: `Error when querying location on date, not marking anything.`,
        error,
        location,
        day,
      });
      continue;
    }

    if (slotsWithAvailability && selectedSlot) {
      oneDayIsAvailable = true;
      logger.info(
        `${name} is available on ${day.date}, no longer searching for available dates.`
      );
      // ping available
      // slot is available and unfortunately reserved to us for 15 mins :(
      state.markLocationAsAvailable(location, day, slotsWithAvailability);
      logger.info({
        message: `${slotsWithAvailability.length} time slots available at ${location.name} (${location.extId}) on ${day.date} at ${selectedSlot.localStartTime}.`,
        selectedSlot,
      });

      break;
    }
  }

  if (!oneDayIsAvailable) {
    logger.info({
      message: `No days were available at ${location.name} (${location.extId})`,
      location,
    });
    state.markLocationAsUnavailable(location);
  }
}

async function queryLocationOnDate(
  location: VaccinationLocation,
  dayToCheck: LocationAvailabilityDate
): Promise<{
  slotsWithAvailability?: LocationAvailableSlotsResponseSlot[];
  selectedSlot?: LocationAvailableSlotsResponseSlot;
  error?: Error;
}> {
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
    return { error: e };
  }

  if (!availableSlotsReq.slotsWithAvailability) {
    logger.info({
      message: `No slots available at ${location.name}`,
      location,
    });
    return {};
  }

  if (availableSlotsReq.slotsWithAvailability.length < 2) {
    logger.info({
      message: `Only one slot available at ${location.name}`,
      location,
    });
    return {};
  }

  // slot appears to be available, reserve it
  const slotToReserve =
    availableSlotsReq.slotsWithAvailability[
      availableSlotsReq.slotsWithAvailability.length - 1
    ];

  let slotReservation: ReserveSlotResponse;
  try {
    slotReservation = await reserveSlot(
      dayToCheck.date,
      slotToReserve.localStartTime,
      location.extId,
      dayToCheck.vaccineData
    );
  } catch (e) {
    logger.error({
      message: `Error reserving a slot at ${location.name} (${location.extId})`,
      error: e,
      dayToCheck,
      slotToReserve,
      location,
    });
    return { error: e };
  }

  if ("errorType" in slotReservation) {
    if (slotReservation.errorType === "location_no_capacity") {
      return {};
    }

    logger.warn({
      message: `Error booking a slot at ${location.name} for ${slotToReserve.localStartTime} on ${dayToCheck.date}: ${slotReservation.errorType}`,
      location,
      slotReservation,
      dayToCheck,
      slotToReserve,
    });
    return {};
  }

  return {
    slotsWithAvailability: availableSlotsReq.slotsWithAvailability,
    selectedSlot: slotToReserve,
  };
}

runCheck();

setInterval(runCheck, CHECK_INTERVAL);

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
import { CHECK_INTERVAL, DEBUG_ONE_LOCATION } from "../env";
import getHomePage from "./api/homePage";

const logger = createLogger("myturn");

async function runCheck() {
  // sets our cookies in the Cookie Jar.
  // required: 403s if we don't do this.
  try {
    await getHomePage();
  } catch (e) {
    logger.error({
      message: `Error getting home page`,
      error: e,
    });
  }

  const previouslyAvailableLocations = await state.getAvailableLocations();

  logger.info({
    message: `Dynamo reported ${previouslyAvailableLocations.length} previously available locations.`,
    previouslyAvailableLocations,
  });

  const vaccineData =
    "WyJhM3F0MDAwMDAwMEN5SkJBQTAiLCJhM3F0MDAwMDAwMDFBZExBQVUiLCJhM3F0MDAwMDAwMDFBZE1BQVUiLCJhM3F0MDAwMDAwMDFBZ1VBQVUiLCJhM3F0MDAwMDAwMDFBZ1ZBQVUiLCJhM3F0MDAwMDAwMDFBc2FBQUUiXQ==";

  let northSearchResponse, southSearchResponse: LocationSearchResponse;
  try {
    // northSearchResponse = await searchLocations(eligibilityResponse.vaccineData);
    [northSearchResponse, southSearchResponse] = await Promise.all([
      // north
      searchLocations(vaccineData, { lat: 37.844124, lng: -122.332101 }),
      // south
      searchLocations(vaccineData, { lat: 37.412755, lng: -122.035193 }),
    ]);
  } catch (e) {
    logger.log({
      level: "error",
      message: "Error searching for locations, will retry",
      error: e,
    });
    return;
  }

  const locationExtIds = new Set();
  const allLocations: VaccinationLocation[] = [
    ...northSearchResponse.locations,
    ...southSearchResponse.locations,
  ];

  const locations = allLocations.filter((l) => {
    if (l.type === "ThirdPartyBooking") {
      return false;
    }

    // de-dupe
    if (!locationExtIds.has(l.extId)) {
      locationExtIds.add(l.extId);
      return true;
    }
    return false;
  });

  logger.info({
    message: `Found ${locations.length} unique locations. (${dayjs().format(
      "YYYY-MM-DDTHH:mm:ss"
    )})`,
    locations,
  });

  if (locations.length) {
    // run availability
    if (DEBUG_ONE_LOCATION === "true") {
      const l = locations[0];
      queryLocation(
        l,
        previouslyAvailableLocations.some((pl) => pl.locationExtId === l.extId)
      );
      logger.debug({
        message:
          "Stopped checking locations because DEBUG_ONE_LOCATION is set to true.",
      });
    } else {
      locations.forEach((l) =>
        queryLocation(
          l,
          previouslyAvailableLocations.some(
            (pl) => pl.locationExtId === l.extId
          )
        )
      );
    }
  } else if (previouslyAvailableLocations.length) {
    await state.markAllAsUnavailable(
      previouslyAvailableLocations.map((l) => l.locationExtId)
    );
    return;
  } else {
    return;
  }
}

async function queryLocation(
  location: VaccinationLocation,
  locationWasPreviouslyAvailable: boolean
) {
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
    if (locationWasPreviouslyAvailable) {
      await state.markLocationAsUnavailable(location);
    }
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
    return { error: e as Error };
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
    return { error: e as Error };
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

  if (
    dayjs().isAfter(dayjs(`${dayToCheck.date}T${slotToReserve.localStartTime}`))
  ) {
    logger.warn({
      message: `Error booking a slot at ${location.name} for ${slotToReserve.localStartTime} on ${dayToCheck.date}: Current time is after slot time.`,
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

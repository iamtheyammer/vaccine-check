// import checkEligibility, { EligibilityResponse } from "./api/eligibility";
import searchLocations, {
  LocationSearchResponse,
  Location,
} from "./api/locationSearch";
import checkLocationAvailability, {
  LocationAvailabilityResponse,
  LocationAvailabilityResponseSlot,
} from "./api/locationAvailability";
import getSlots, {
  SlotAvailabilityResponseAvailableSlot,
} from "./api/getSlots";
import reserveSlot, { ReserveSlotSuccessResponse } from "./api/reserveSlot";
import { createLogger } from "../logger";

const axios = require("axios");
const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/utc"));

const logger = createLogger("myturn");

let isChecking = false;

async function runCheck() {
  if (isChecking) {
    logger.log({
      level: "warn",
      message: "Still checking, will retry later",
    });
    return;
  }
  isChecking = true;

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
    availableLocations.forEach((l) => runAvailabilityCheck(l));
  }

  isChecking = false;
}

async function runAvailabilityCheck(location: Location) {
  const { extId, name } = location;
  let availability: LocationAvailabilityResponse;
  try {
    availability = await checkLocationAvailability(extId, location.vaccineData);
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
    return;
  }

  availableDays.forEach((slot) => checkForSlotAvailability(location, slot));

  logger.info({
    message: `Availability at ${name} on ${availableDays
      .map((d) => d.date)
      .join(", ")}!`,
    availableDays,
    location,
  });
}

async function checkForSlotAvailability(
  location: Location,
  slot: LocationAvailabilityResponseSlot
) {
  let availabilityReq;
  try {
    availabilityReq = await getSlots(location.extId, slot);
  } catch (e) {
    logger.error({
      message: `Error checking for slot availability at ${location.name}`,
      error: e,
      location,
    });
    return;
  }

  const { slotsWithAvailability } = availabilityReq;

  if (!slotsWithAvailability.length) {
    logger.info({
      message: `No slots available at ${location.name}`,
      location,
    });
    return;
  }

  slotsWithAvailability
    .slice(0, 3)
    .forEach((s) => attemptToReserveSlot(location, slot, s));
}

async function attemptToReserveSlot(
  location: Location,
  locationSlot: LocationAvailabilityResponseSlot,
  slot: SlotAvailabilityResponseAvailableSlot
) {
  const reserveReq = await reserveSlot(
    locationSlot.date,
    slot.localStartTime,
    location.extId,
    locationSlot.vaccineData
  );

  if ("errorType" in reserveReq) {
    // error
    logger.warn({
      message: `Error booking a slot at ${location.name} for ${slot.localStartTime} on ${locationSlot.date}: ${reserveReq.errorType}`,
      location,
      slot,
      locationSlot,
      reserveReq,
    });
    return;
  } else {
    alert(location.name, reserveReq);
    logger.info({
      message: `Slot available: ${location.name} for ${slot.localStartTime} on ${locationSlot.date}`,
      location,
      slot,
      locationSlot,
      reserveReq,
    });
    return;
  }
}

async function check() {
  try {
    await runCheck();
  } catch (e) {
    logger.error({
      message: "Unknown error while searching, will retry",
      error: e,
    });
    isChecking = false;
  }
}

function alert(locationName: string, slot: ReserveSlotSuccessResponse) {
  // axios({
  //   method: "GET",
  //   url:
  //     "https://maker.ifttt.com/trigger/vaccine_available/with/key/TIObZpkJpD2HBg0_Hk83e",
  //   data: {
  //     value1: locationName,
  //     value2: dayjs().format(),
  //     value3: JSON.stringify(slot),
  //   },
  // });
}

check();

// setInterval(check, 5000);

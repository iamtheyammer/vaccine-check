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
import sendChatAlert from "../telegram";

const axios = require("axios");
const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/utc"));

const logger = createLogger("myturn");

let isChecking = false;
let globalAvailability: { [locationExtId: string]: boolean } = {};

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
  } else if (Object.values(globalAvailability).some((a) => a)) {
    globalAvailability = {};
    sendChatAlert(
      "No more appointments are available right now. You will be notified when they become available again."
    );
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
    globalAvailability[extId] = false;
    return;
  }

  // only use one day.
  checkForSlotAvailability(location, availableDays[0]);
  // availableDays.forEach((slot) => checkForSlotAvailability(location, slot));

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

  if (!slotsWithAvailability.length && globalAvailability[location.extId]) {
    globalAvailability[location.extId] = false;
    sendChatAlert(
      `No more appointments are available at ${location.name}. You'll be notified when they open up again.`
    );
    logger.info({
      message: `No slots available at ${location.name}`,
      location,
    });
    return;
  }

  attemptToReserveSlot(location, slot, slotsWithAvailability[0]);
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
    alert(location, reserveReq, locationSlot);
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

function alert(
  location: Location,
  slot: ReserveSlotSuccessResponse,
  locationSlot: LocationAvailabilityResponseSlot
) {
  if (globalAvailability[location.extId]) {
    return;
  }

  globalAvailability[location.extId] = true;

  sendChatAlert(`Appointments are available at ${location.name}.
  
The next available date is ${dayjs(locationSlot.date).format(
    "dddd MMMM DD, YYYY"
  )}.`);

  axios({
    method: "GET",
    url:
      "https://maker.ifttt.com/trigger/vaccine_available/with/key/TIObZpkJpD2HBg0_Hk83e",
    data: {
      value1: location.name,
      value2: dayjs().format(),
      value3: JSON.stringify(slot),
    },
  });
}

runCheck();

setInterval(runCheck, 60000);

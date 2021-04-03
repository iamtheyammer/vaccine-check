"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const locationSearch_1 = __importDefault(require("./api/locationSearch"));
const locationAvailability_1 = __importDefault(require("./api/locationAvailability"));
const getSlots_1 = __importDefault(require("./api/getSlots"));
const reserveSlot_1 = __importDefault(require("./api/reserveSlot"));
const axios = require("axios");
const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/utc"));
let isChecking = false;
async function runCheck() {
    if (isChecking) {
        console.log("Still checking, will retry later");
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
    const vaccineData = "WyJhM3F0MDAwMDAwMEN5SkJBQTAiLCJhM3F0MDAwMDAwMDFBZExBQVUiLCJhM3F0MDAwMDAwMDFBZE1BQVUiLCJhM3F0MDAwMDAwMDFBZ1VBQVUiLCJhM3F0MDAwMDAwMDFBZ1ZBQVUiLCJhM3F0MDAwMDAwMDFBc2FBQUUiXQ==";
    let searchResponse;
    try {
        // searchResponse = await searchLocations(eligibilityResponse.vaccineData);
        searchResponse = await locationSearch_1.default(vaccineData);
    }
    catch (e) {
        console.log("Error searching, will retry", e);
        return;
    }
    const availableLocations = searchResponse.locations.filter((l) => l.type !== "ThirdPartyBooking");
    console.log(`Found ${availableLocations.length} locations. (${dayjs().format("YYYY-MM-DDTHH:mm:ss")})`);
    if (availableLocations.length) {
        availableLocations.forEach((l) => runAvailabilityCheck(l));
    }
    isChecking = false;
}
async function runAvailabilityCheck(location) {
    const { extId, name } = location;
    let availability;
    try {
        availability = await locationAvailability_1.default(extId, location.vaccineData);
    }
    catch (e) {
        console.log(`Error searching for availability at ${name}, will retry`, e);
        return;
    }
    const availableDays = availability.availability.filter((a) => a.available);
    if (!availableDays.length) {
        console.log(`No availability at ${name}.`);
        return;
    }
    availableDays.forEach((slot) => checkForSlotAvailability(location, slot));
    console.log(`Availability at ${name} on ${availableDays
        .map((d) => d.date)
        .join(", ")}!`, JSON.stringify(availableDays[0], null, 0));
}
async function checkForSlotAvailability(location, slot) {
    let availabilityReq;
    try {
        availabilityReq = await getSlots_1.default(location.extId, slot);
    }
    catch (e) {
        console.log(`Error checking for slot availability at ${location.name}`, e);
        return;
    }
    const { slotsWithAvailability } = availabilityReq;
    if (!slotsWithAvailability.length) {
        console.log(`No slots available at ${location.name}`);
        return;
    }
    slotsWithAvailability
        .slice(0, 3)
        .forEach((s) => attemptToReserveSlot(location, slot, s));
}
async function attemptToReserveSlot(location, locationSlot, slot) {
    const reserveReq = await reserveSlot_1.default(locationSlot.date, slot.localStartTime, location.extId, locationSlot.vaccineData);
    if ("errorType" in reserveReq) {
        // error
        console.log(`Error booking a slot at ${location.name} for ${slot.localStartTime} on ${locationSlot.date}: ${reserveReq.errorType}`);
        return;
    }
    else {
        alert(location.name, reserveReq);
        console.log(`Slot available: ${location.name} for ${slot.localStartTime} on ${locationSlot.date}`);
        console.log(JSON.stringify(reserveReq, null, 2));
        return;
    }
}
async function check() {
    try {
        await runCheck();
    }
    catch (e) {
        console.log("Unknown error while searching, will retry", e);
        isChecking = false;
    }
}
function alert(locationName, slot) {
    axios({
        method: "GET",
        url: "https://maker.ifttt.com/trigger/vaccine_available/with/key/TIObZpkJpD2HBg0_Hk83e",
        data: {
            value1: locationName,
            value2: dayjs().format(),
            value3: JSON.stringify(slot),
        },
    });
}
check();
setInterval(check, 5000);

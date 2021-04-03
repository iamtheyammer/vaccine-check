import { Location } from "./api/locationSearch";
import { LocationAvailabilityDate } from "./api/getLocationAvailableDates";
import {
  sendAvailableAtLocation,
  sendNoLongerAvailableAtLocation,
} from "../telegram";
import { LocationAvailableSlotsResponseSlot } from "./api/getLocationAvailableSlots";

class State {
  private readonly globalAvailability: {
    [locationExtId: string]: boolean;
  } = {};

  locationIsAvailable(locationExtId: string): boolean {
    return this.globalAvailability[locationExtId];
  }

  anyLocationIsAvailable(): boolean {
    return Object.values(this.globalAvailability).some((v) => v);
  }

  markAllAsUnavailable() {
    Object.keys(this.globalAvailability).forEach(
      (k) => (this.globalAvailability[k] = false)
    );
  }

  markLocationAsAvailable(
    location: Location,
    availabilityDate: LocationAvailabilityDate,
    slotsWithAvailability: LocationAvailableSlotsResponseSlot[]
  ) {
    // notify if this changed
    if (!this.locationIsAvailable(location.extId)) {
      sendAvailableAtLocation(location, availabilityDate, slotsWithAvailability);
    }

    this.globalAvailability[location.extId] = true;
  }

  markLocationAsUnavailable(location: Location) {
    if (this.locationIsAvailable(location.extId)) {
      sendNoLongerAvailableAtLocation(location);
    }

    this.globalAvailability[location.extId] = false;
  }
}

const state = new State();

export default state;

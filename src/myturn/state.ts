import { VaccinationLocation } from "./api/locationSearch";
import { LocationAvailabilityDate } from "./api/getLocationAvailableDates";
import {
  sendAvailableAtLocation,
  sendNoLongerAvailableAtLocation,
} from "../twitter";
import { LocationAvailableSlotsResponseSlot } from "./api/getLocationAvailableSlots";
import dynamoClient from "../dynamo/client";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { createLogger } from "../logger";
import { AvailableLocationsTableRow } from "../dynamo/types";

const logger = createLogger("state-dynamodb");

class State {
  async locationIsAvailable(locationExtId: string): Promise<boolean> {
    // get single row with primary key
    const queryResult = await dynamoClient.executeStatement({
      Statement: `SELECT * FROM "covaxsf-availablelocations" WHERE locationExtId = ? AND available = true`,
      Parameters: [{ S: locationExtId }],
    });

    return queryResult.Items ? queryResult.Items.length > 0 : false;
  }

  async getAvailableLocations(): Promise<AvailableLocationsTableRow[]> {
    // scan with filter expression
    const queryResult = await dynamoClient.executeStatement({
      Statement: `SELECT * FROM "covaxsf-availablelocations" WHERE available = true`,
    });
    return queryResult.Items
      ? (queryResult.Items.map((i) =>
          unmarshall(i)
        ) as AvailableLocationsTableRow[])
      : [];
  }

  async markAllAsUnavailable(availableLocationExtIds?: string[]) {
    // if no optional param, scan for all rows with true
    // then update all to mark as false

    logger.info({
      message: `Marking all locations as unavailable`,
      availableLocationExtIds,
    });

    if (!availableLocationExtIds) {
      const queryResult = await dynamoClient.executeStatement({
        Statement: `SELECT * FROM "covaxsf-availablelocations" WHERE available = true`,
      });

      if (queryResult.Items) {
        availableLocationExtIds = queryResult.Items.map(
          (i) => unmarshall(i) as AvailableLocationsTableRow
        )
          .filter((i) => i.availability)
          .map((i) => i.locationExtId);
      } else {
        availableLocationExtIds = [];
      }
    }

    await dynamoClient.batchExecuteStatement({
      Statements: availableLocationExtIds.map((l) => ({
        Statement: `UPDATE "covaxsf-availablelocations" SET available = false WHERE locationExtId = ?`,
        Parameters: [{ S: l }],
      })),
    });

    // // mark availableLocationExtIds as false
    // Object.keys(this.globalAvailability).forEach(
    //   (k) => (this.globalAvailability[k] = false)
    // );
  }

  async markLocationAsAvailable(
    location: VaccinationLocation,
    availabilityDate: LocationAvailabilityDate,
    slotsWithAvailability: LocationAvailableSlotsResponseSlot[]
  ) {
    // notify if this changed
    if (!(await this.locationIsAvailable(location.extId))) {
      logger.info(`Marking ${location.name} (${location.extId}) as available`);

      await Promise.all([
        sendAvailableAtLocation(
          location,
          availabilityDate,
          slotsWithAvailability
        ),
        dynamoClient.updateItem({
          Key: {
            locationExtId: {
              S: location.extId,
            },
          },
          TableName: "covaxsf-availablelocations",
          UpdateExpression: "SET #A = :a",
          ExpressionAttributeNames: {
            "#A": "available",
          },
          ExpressionAttributeValues: {
            ":a": { BOOL: true },
          },
        }),
      ]);
    }
  }

  async markLocationAsUnavailable(location: VaccinationLocation) {
    if (await this.locationIsAvailable(location.extId)) {
      logger.info(`Marking ${location.extId} as unavailable`);

      await Promise.all([
        sendNoLongerAvailableAtLocation(location),
        dynamoClient.executeStatement({
          Statement: `UPDATE "covaxsf-availablelocations" SET available = false WHERE locationExtId = ?`,
          Parameters: [{ S: location.extId }],
        }),
      ]);
    }
  }
}

const state = new State();

export default state;

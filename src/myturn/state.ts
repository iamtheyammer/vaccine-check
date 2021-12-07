import dynamoClient from "../dynamo/client";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { createLogger } from "../logger";
import { AvailableLocationsTableRow } from "../dynamo/types";
import { VaccinationLocationType } from "./index";

const logger = createLogger("state-dynamodb");

class State {
  async getLocationAvailability(
    locationExtId: string
  ): Promise<AvailableLocationsTableRow> {
    // get single row with primary key
    const queryResult = await dynamoClient.executeStatement({
      Statement: `SELECT * FROM "covaxsf-availablelocations" WHERE locationExtId = ?`,
      Parameters: [{ S: locationExtId }],
    });

    return queryResult.Items && queryResult.Items.length > 0
      ? (unmarshall(queryResult.Items[0]) as AvailableLocationsTableRow)
      : { locationExtId, booster: false, firstVax: false };
  }

  /**
   * Returns locations with any type of availability.
   * Downstream functions need to parse the response to determine if the location is considered
   * "available" for their purposes.
   */
  async getAvailableLocations(): Promise<AvailableLocationsTableRow[]> {
    // scan with filter expression
    const queryResult = await dynamoClient.executeStatement({
      Statement: `SELECT * FROM "covaxsf-availablelocations" WHERE booster = true OR firstVax = true`,
    });
    return queryResult.Items
      ? (queryResult.Items.map((i) =>
          unmarshall(i)
        ) as AvailableLocationsTableRow[])
      : [];
  }

  async batchMarkAsFirstVaxUnavailable(locationExtIds: string[]) {
    logger.info({
      message: `firstVax: Marking all locations as unavailable`,
      locationExtIds,
    });

    await dynamoClient.batchExecuteStatement({
      Statements: locationExtIds.map((l) => ({
        Statement: `UPDATE "covaxsf-availablelocations" SET firstVax = false WHERE locationExtId = ?`,
        Parameters: [{ S: l }],
      })),
    });
  }

  async batchMarkAsBoosterUnavailable(locationExtIds: string[]) {
    logger.info({
      message: `booster: Marking all locations as unavailable`,
      locationExtIds,
    });

    await dynamoClient.batchExecuteStatement({
      Statements: locationExtIds.map((l) => ({
        Statement: `UPDATE "covaxsf-availablelocations" SET booster = false WHERE locationExtId = ?`,
        Parameters: [{ S: l }],
      })),
    });
  }

  async markLocationAsUnavailable(
    locationExtId: string,
    type: VaccinationLocationType
  ) {
    switch (type) {
      case "booster":
        return this.markLocationAsBoosterUnavailable(locationExtId);
      case "firstVax":
        return this.markLocationAsFirstVaxUnavailable(locationExtId);
    }
  }

  async markLocationAsFirstVaxUnavailable(locationExtId: string) {
    await dynamoClient.updateItem({
      Key: {
        locationExtId: {
          S: locationExtId,
        },
      },
      TableName: "covaxsf-availablelocations",
      UpdateExpression: "SET #A = :a",
      ExpressionAttributeNames: {
        "#A": "firstVax",
      },
      ExpressionAttributeValues: {
        ":a": { BOOL: false },
      },
    });
  }

  async markLocationAsBoosterUnavailable(locationExtId: string) {
    await dynamoClient.updateItem({
      Key: {
        locationExtId: {
          S: locationExtId,
        },
      },
      TableName: "covaxsf-availablelocations",
      UpdateExpression: "SET #A = :a",
      ExpressionAttributeNames: {
        "#A": "booster",
      },
      ExpressionAttributeValues: {
        ":a": { BOOL: false },
      },
    });
  }

  async markLocationAsAvailable(
    locationExtId: string,
    type: VaccinationLocationType
  ) {
    switch (type) {
      case "booster":
        return this.markLocationAsBoosterAvailable(locationExtId);
      case "firstVax":
        return this.markLocationAsFirstVaxAvailable(locationExtId);
    }
  }

  async markLocationAsFirstVaxAvailable(locationExtId: string) {
    await dynamoClient.updateItem({
      Key: {
        locationExtId: {
          S: locationExtId,
        },
      },
      TableName: "covaxsf-availablelocations",
      UpdateExpression: "SET #A = :a",
      ExpressionAttributeNames: {
        "#A": "firstVax",
      },
      ExpressionAttributeValues: {
        ":a": { BOOL: true },
      },
    });
  }

  async markLocationAsBoosterAvailable(locationExtId: string) {
    await dynamoClient.updateItem({
      Key: {
        locationExtId: {
          S: locationExtId,
        },
      },
      TableName: "covaxsf-availablelocations",
      UpdateExpression: "SET #A = :a",
      ExpressionAttributeNames: {
        "#A": "booster",
      },
      ExpressionAttributeValues: {
        ":a": { BOOL: true },
      },
    });
  }
}

const state = new State();

export default state;

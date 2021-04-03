"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./client"));
const dayjs_1 = __importDefault(require("dayjs"));
async function searchLocations(vaccineData) {
    const resp = await client_1.default({
        method: "POST",
        url: "locations/search",
        data: {
            location: { lat: 37.5549479, lng: -122.2710602 },
            fromDate: dayjs_1.default().format("YYYY-MM-DD"),
            vaccineData,
            locationQuery: { includePools: ["default"] },
            doseNumber: 1,
            url: "https://myturn.ca.gov/location-select",
        },
    });
    return resp.data;
}
exports.default = searchLocations;

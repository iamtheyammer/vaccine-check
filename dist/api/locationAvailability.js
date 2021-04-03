"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const client_1 = __importDefault(require("./client"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.extend(utc_1.default);
async function checkLocationAvailability(extId, vaccineData) {
    const resp = await client_1.default({
        method: "POST",
        url: `locations/${extId}/availability`,
        data: {
            startDate: dayjs_1.default().local().format("YYYY-MM-DD"),
            endDate: "2021-12-31",
            vaccineData,
            doseNumber: 1,
            url: "https://myturn.ca.gov/appointment-select",
        },
    });
    return resp.data;
}
exports.default = checkLocationAvailability;

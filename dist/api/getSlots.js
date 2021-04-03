"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./client"));
async function getSlots(locationExtId, slot) {
    const req = await client_1.default({
        method: "POST",
        url: `locations/${locationExtId}/date/${slot.date}/slots`,
        data: {
            url: "https://myturn.ca.gov/appointment-select",
            vaccineData: slot.vaccineData,
        },
    });
    return req.data;
}
exports.default = getSlots;

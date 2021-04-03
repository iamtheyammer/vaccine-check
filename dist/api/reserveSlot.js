"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./client"));
async function reserveSlot(date, localStartTime, locationExtId, vaccineData) {
    try {
        const resp = await client_1.default({
            method: "POST",
            url: `locations/${locationExtId}/date/${date}/slots/reserve`,
            data: {
                date,
                localStartTime,
                locationExtId,
                vaccineData,
                dose: 1,
                url: "https://myturn.ca.gov/appointment-select",
            },
        });
        return resp.data;
    }
    catch (e) {
        if (!e.response) {
            throw e;
        }
        return e.response.data;
    }
}
exports.default = reserveSlot;

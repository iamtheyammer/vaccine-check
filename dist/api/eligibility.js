"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./client"));
async function checkEligibility() {
    const resp = await client_1.default({
        method: "POST",
        url: "eligibility",
        data: {
            eligibilityQuestionResponse: [
                {
                    id: "q.screening.18.yr.of.age",
                    value: ["q.screening.18.yr.of.age"],
                    type: "multi-select",
                },
                {
                    id: "q.screening.health.data",
                    value: ["q.screening.health.data"],
                    type: "multi-select",
                },
                {
                    id: "q.screening.accuracy.attestation",
                    value: ["q.screening.accuracy.attestation"],
                    type: "multi-select",
                },
                {
                    id: "q.screening.privacy.statement",
                    value: ["q.screening.privacy.statement"],
                    type: "multi-select",
                },
                {
                    id: "q.screening.eligibility.age.range",
                    value: "50-64",
                    type: "single-select",
                },
                {
                    id: "q.screening.underlying.health.condition",
                    value: "No",
                    type: "single-select",
                },
                { id: "q.screening.disability", value: "No", type: "single-select" },
                {
                    id: "q.screening.eligibility.industry",
                    value: "Communications and IT",
                    type: "single-select",
                },
                {
                    id: "q.screening.eligibility.county",
                    value: "San Mateo",
                    type: "single-select",
                },
                { id: "q.screening.accessibility.code", type: "text" },
            ],
            url: "https://myturn.ca.gov/screening",
        },
    });
    return resp.data;
}
exports.default = checkEligibility;

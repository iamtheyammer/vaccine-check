import client from "./client";

export interface EligibilityResponse {
  eligible: boolean;
  vaccineData: string;
  locationQuery: {
    includePools: string[];
  };
}

export default async function checkEligibility(): Promise<EligibilityResponse> {
  const resp = await client({
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

  return resp.data as EligibilityResponse;
}

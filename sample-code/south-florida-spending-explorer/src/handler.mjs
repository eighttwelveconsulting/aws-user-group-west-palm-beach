import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const counties = {
  "palm-beach": { name: "Palm Beach", code: "099" },
  broward: { name: "Broward", code: "011" },
  "miami-dade": { name: "Miami-Dade", code: "086" },
};
const currentYear = new Date().getUTCFullYear();
const minimumYear = currentYear - 10;
const upstreamUrl = process.env.UPSTREAM_URL;
const sourceLink = "https://www.usaspending.gov/";
const appRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

export async function handler(event) {
  const requestPath = event?.rawPath || event?.path || "/";

  if (requestPath === "/api/spending") {
    return spendingResponse(event);
  }

  if (requestPath === "/" || requestPath === "/index.html") {
    return fileResponse("web/index.html", "text/html; charset=utf-8");
  }

  return jsonResponse(404, { error: "Not found" });
}

async function spendingResponse(event) {
  const params = event?.queryStringParameters || {};
  const countyKey = params.county || "palm-beach";
  const fiscalYear = Number(params.fiscalYear || currentYear - 1);

  if (!(countyKey in counties)) {
    return jsonResponse(400, {
      error: "Choose Palm Beach, Broward, or Miami-Dade County.",
    });
  }

  if (!Number.isInteger(fiscalYear) || fiscalYear < minimumYear || fiscalYear > currentYear) {
    return jsonResponse(400, {
      error: `Fiscal year must be an integer from ${minimumYear} through ${currentYear}.`,
    });
  }

  const startDate = `${fiscalYear - 1}-10-01`;
  const endDate = `${fiscalYear}-09-30`;
  const requestBody = {
    filters: {
      time_period: [{ start_date: startDate, end_date: endDate }],
      place_of_performance_locations: [{ country: "USA", state: "FL", county: counties[countyKey].code }],
      award_type_codes: ["A", "B", "C", "D"],
    },
    fields: [
      "Award ID",
      "Recipient Name",
      "Award Amount",
      "Awarding Agency",
      "Award Type",
      "Place of Performance City",
      "Start Date",
      "End Date",
    ],
    page: 1,
    limit: 10,
    subawards: false,
    sort: "Award Amount",
    order: "desc",
  };

  try {
    const response = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error("USASpending returned an error", { status: response.status });
      return jsonResponse(502, { error: "The federal spending service is temporarily unavailable." });
    }

    const payload = await response.json();
    const results = Array.isArray(payload.results) ? payload.results.map(normalizeAward) : [];
    const total = results.reduce((sum, award) => sum + (award.amount || 0), 0);

    return jsonResponse(200, {
      county: counties[countyKey].name,
      state: "Florida",
      fiscalYear,
      resultCount: results.length,
      returnedAmount: total,
      results,
      source: sourceLink,
      note: "Results are limited to the largest awards returned by USASpending.gov for this search.",
    });
  } catch (error) {
    console.error("Unable to reach USASpending", { name: error.name });
    return jsonResponse(504, { error: "The federal spending service did not respond in time." });
  }
}

function normalizeAward(award) {
  return {
    awardId: award["Award ID"] || null,
    recipient: award["Recipient Name"] || "Not listed",
    amount: Number(award["Award Amount"] || 0),
    agency: award["Awarding Agency"] || "Not listed",
    awardType: award["Award Type"] || "Not listed",
    city: award["Place of Performance City"] || "Not listed",
    startDate: award["Start Date"] || null,
    endDate: award["End Date"] || null,
  };
}

async function fileResponse(relativePath, contentType) {
  try {
    const content = await readFile(path.join(appRoot, relativePath), "utf8");
    return { statusCode: 200, headers: { "content-type": contentType }, body: content };
  } catch {
    return jsonResponse(500, { error: "The application asset could not be loaded." });
  }
}

function jsonResponse(statusCode, body) {
  return { statusCode, headers: jsonHeaders, body: JSON.stringify(body) };
}

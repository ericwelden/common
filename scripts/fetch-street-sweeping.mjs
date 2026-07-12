// Pulls street sweeping segments from Oakland Public Works' public GIS
// dataset and writes src/data/streetSweeping.js. Re-run via
// `npm run data:street-sweeping` if the city updates its routes.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Keep in sync with MAP_VIEW.maxBounds in src/data/neighborhood.js -- kept as
// a plain literal here (not imported) since that file is loaded as an ESM
// module by Next.js's bundler, not by plain `node` under this project's
// CommonJS-by-default package.json.
const BOUNDS = { west: -122.215, south: 37.79, east: -122.191, north: 37.808 };

const FEATURE_SERVER =
  "https://services.arcgis.com/9tC74aDHuml0x5Yz/arcgis/rest/services/OaklandDayRouteSweepingSegments/FeatureServer/0/query";
const OUT_FIELDS =
  "NAME,PREFIX,TYPE,SUFFIX,DAY_ODD,TIME_ODD,DAY_EVEN,TIME_EVEN,SIDEOFSTRE";
const PAGE_SIZE = 500;

const DAY_NAMES = {
  M: "Monday",
  TU: "Tuesday",
  W: "Wednesday",
  TH: "Thursday",
  F: "Friday",
  SA: "Saturday",
  SU: "Sunday",
};
const ORDINALS = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th" };

// "W2" -> "2nd Wednesday", "F13" -> "1st & 3rd Friday". Returns null for
// anything that doesn't match the expected letters-then-digits shape, so the
// caller can fall back to showing the raw code instead of a wrong guess.
function decodeDayCode(code) {
  const trimmed = (code ?? "").trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  const [, letters, digits] = match;
  const dayName = DAY_NAMES[letters];
  if (!dayName) return null;
  const weeks = digits.split("").map((d) => ORDINALS[d]);
  if (weeks.some((w) => !w)) return null;
  return `${weeks.join(" & ")} ${dayName}`;
}

function streetName(props) {
  return [props.PREFIX, props.NAME, props.TYPE, props.SUFFIX]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

async function fetchAllFeatures() {
  const features = [];
  let offset = 0;

  for (;;) {
    const url = new URL(FEATURE_SERVER);
    url.searchParams.set(
      "geometry",
      `${BOUNDS.west},${BOUNDS.south},${BOUNDS.east},${BOUNDS.north}`
    );
    url.searchParams.set("geometryType", "esriGeometryEnvelope");
    url.searchParams.set("inSR", "4326");
    url.searchParams.set("spatialRel", "esriSpatialRelIntersects");
    url.searchParams.set("outFields", OUT_FIELDS);
    url.searchParams.set("outSR", "4326");
    url.searchParams.set("f", "geojson");
    url.searchParams.set("resultOffset", String(offset));
    url.searchParams.set("resultRecordCount", String(PAGE_SIZE));

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`FeatureServer query failed: ${res.status} ${res.statusText}`);
    }
    const page = await res.json();
    if (page.error) {
      throw new Error(`FeatureServer returned an error: ${JSON.stringify(page.error)}`);
    }
    features.push(...page.features);

    // Format-agnostic pagination end condition: a short page means there's
    // nothing left, regardless of whether this response shape also exposes
    // an exceededTransferLimit flag.
    if (page.features.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return features;
}

function transform(rawFeatures) {
  let unrecognized = 0;

  const features = rawFeatures.map((f) => {
    const props = f.properties;
    const rawDayOdd = props.DAY_ODD?.trim() || null;
    const rawDayEven = props.DAY_EVEN?.trim() || null;
    const scheduleOdd = decodeDayCode(rawDayOdd);
    const scheduleEven = decodeDayCode(rawDayEven);
    if (rawDayOdd && !scheduleOdd) unrecognized++;
    if (rawDayEven && !scheduleEven) unrecognized++;

    return {
      type: "Feature",
      geometry: f.geometry,
      properties: { street: streetName(props), scheduleOdd, scheduleEven, rawDayOdd, rawDayEven },
    };
  });

  if (unrecognized > 0) {
    console.warn(
      `${unrecognized} day code(s) didn't match the expected pattern -- check rawDayOdd/rawDayEven in the output.`
    );
  }

  return { type: "FeatureCollection", features };
}

async function main() {
  console.log("Fetching street sweeping segments from Oakland Public Works...");
  const raw = await fetchAllFeatures();
  console.log(`Fetched ${raw.length} segments.`);
  const collection = transform(raw);

  const outPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "src",
    "data",
    "streetSweeping.js"
  );

  const header = `// Generated ${new Date().toISOString().slice(0, 10)} by \`npm run data:street-sweeping\`
// from Oakland Public Works' OaklandDayRouteSweepingSegments dataset (ArcGIS
// FeatureServer, public, no key required). Re-run that command to refresh if
// the city updates routes -- see scripts/fetch-street-sweeping.mjs.
//
// scheduleOdd/scheduleEven are decoded day-of-week + week-of-month for the
// odd-/even-numbered-address side of the street. Exact clock times aren't
// public (Oakland's internal TIME_ODD/TIME_EVEN route-timeslot codes have no
// published legend) -- link out to the city's own lookup for the exact time
// instead of guessing at one.
export const STREET_SWEEPING = `;

  writeFileSync(outPath, header + JSON.stringify(collection, null, 2) + ";\n");
  console.log(`Wrote ${collection.features.length} features to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

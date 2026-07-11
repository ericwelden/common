// Fixed to the neighborhood's own timezone, not UTC (server) or the
// visitor's local clock (browser) -- "today" should mean today where the
// shared items physically are (Oakland), not wherever a device's clock or
// server region happens to be set. Using two different notions of "today"
// between client and server was the root cause of same-day reservations
// getting wrongly rejected in the evening Pacific hours.
const NEIGHBORHOOD_TIME_ZONE = "America/Los_Angeles";

export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: NEIGHBORHOOD_TIME_ZONE,
  }).format(new Date());
}

export function parseISODate(iso) {
  return new Date(`${iso}T00:00:00`);
}

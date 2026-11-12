import { calculatePrayerDay } from "./prayerDay";
import { CAIRO_LOCATION } from "../types/location";

const date = "2026-09-21";

const result = calculatePrayerDay(date, CAIRO_LOCATION);

console.log("");
console.log("======================================");
console.log("       FALAK PRAYER VALIDATION");
console.log("======================================");

console.log("Location:", result.location.name);

console.log(
  "Coordinates:",
  result.location.latitude,
  result.location.longitude,
);

console.log("Elevation:", result.location.elevation, "m");

console.log("Timezone:", result.location.timeZone);

console.log("Date:", result.date);

console.log("--------------------------------------");

console.log("Fajr     :", result.formatted.fajr);

console.log("Sunrise  :", result.formatted.sunrise);

console.log("Dhuhr    :", result.formatted.dhuhr);

console.log("Asr      :", result.formatted.asr);

console.log("Maghrib  :", result.formatted.maghrib);

console.log("Isha     :", result.formatted.isha);

console.log("--------------------------------------");

console.log(
  "All events belong to requested local date:",
  Object.values(result.prayers).every((value) => value !== null),
);

console.log("======================================");
console.log("");

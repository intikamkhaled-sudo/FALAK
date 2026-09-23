import { calculatePrayerDay } from "./prayerDay";
import { CAIRO_LOCATION } from "../types/location";

const testDates = [
  "2026-01-21",
  "2026-03-21",
  "2026-06-21",
  "2026-09-21",
  "2026-12-21",
];

console.log("");
console.log("==========================================");
console.log("       FALAK MULTI-DAY VALIDATION");
console.log("==========================================");

for (const date of testDates) {
  const result = calculatePrayerDay(date, CAIRO_LOCATION);

  console.log("");
  console.log(`Date: ${date}`);
  console.log("------------------------------------------");

  console.log("Fajr    :", result.formatted.fajr);

  console.log("Sunrise :", result.formatted.sunrise);

  console.log("Dhuhr   :", result.formatted.dhuhr);

  console.log("Asr     :", result.formatted.asr);

  console.log("Maghrib :", result.formatted.maghrib);

  console.log("Isha    :", result.formatted.isha);

  const allValid = Object.values(result.prayers).every(
    (value) => value !== null,
  );

  console.log("Valid day:", allValid);
}

console.log("");
console.log("==========================================");

import { calculatePrayerTimes } from "./prayerTimes";

const result = calculatePrayerTimes({
  latitude: 30.0444,

  longitude: 31.2357,

  elevation: 23,

  date: new Date("2026-09-21"),

  methodKey: "EGYPTIAN",
});

console.log("Imsak:", result.imsak);

console.log("Fajr:", result.fajr);

console.log("Sunrise:", result.sunrise);

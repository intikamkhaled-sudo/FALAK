import { calculatePrayerTimes } from "./prayerTimes";

import { OSLO_LOCATION } from "../types/location";

const date = new Date("2026-06-21T00:00:00Z");

const result = calculatePrayerTimes({
  latitude: OSLO_LOCATION.latitude,

  longitude: OSLO_LOCATION.longitude,

  elevation: OSLO_LOCATION.elevation,

  date,

  method: {
    name: "High Latitude Test",

    fajr: {
      type: "ANGLE",
      value: 19.5,
    },

    isha: {
      type: "ANGLE",
      value: 17.5,
    },

    asrMadhab: "SHAFI",

    highLatitude: {
      rule: "NONE",
      trigger: "ANGLE_FAILURE",
      minimumNightMinutes: 90,
    },
    imsak: {
      enabled: true,
      minutesBeforeFajr: 10,
    },
  },
});

console.log("================================");

console.log("OSLO HIGH LATITUDE TEST");

console.log("================================");

console.log("Fajr:", result.fajr);

console.log("Sunrise:", result.sunrise);

console.log("Dhuhr:", result.dhuhr);

console.log("Asr:", result.asr);

console.log("Maghrib:", result.maghrib);

console.log("Isha:", result.isha);

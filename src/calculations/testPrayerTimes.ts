import { calculatePrayerTimes } from "./prayerTimes";

const date = new Date("2026-09-21T00:00:00Z");

const cairo = {
  latitude: 30.0444,
  longitude: 31.2357,
  elevation: 23,
};

function format(date: Date | null): string {
  if (!date) {
    return "N/A";
  }

  return date.toISOString();
}

const methods = ["EGYPTIAN", "MUSLIM_WORLD_LEAGUE", "ISNA"] as const;

for (const methodKey of methods) {
  const result = calculatePrayerTimes({
    ...cairo,
    date,
    methodKey,
  });

  console.log("\n================================");

  console.log(`METHOD: ${methodKey}`);

  console.log("================================");

  console.log("Fajr    :", format(result.fajr));

  console.log("Sunrise :", format(result.sunrise));

  console.log("Dhuhr   :", format(result.dhuhr));

  console.log("Asr     :", format(result.asr));

  console.log("Maghrib :", format(result.maghrib));

  console.log("Isha    :", format(result.isha));
  console.log("\n");
  console.log("================================");
  console.log("ASR MADHAB TEST");
  console.log("================================");

  const shafi = calculatePrayerTimes({
    ...cairo,
    date,
    method: {
      name: "Shafi Test",

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

  const hanafi = calculatePrayerTimes({
    ...cairo,
    date,
    method: {
      name: "Hanafi Test",

      fajr: {
        type: "ANGLE",
        value: 19.5,
      },

      isha: {
        type: "ANGLE",
        value: 17.5,
      },

      asrMadhab: "HANAFI",
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

  console.log("Shafi Asr :", shafi.asr?.toISOString());

  console.log("Hanafi Asr:", hanafi.asr?.toISOString());
}

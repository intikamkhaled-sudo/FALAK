import { calculateMoonData, findPreviousNewMoon } from "./moon";
import { calculateCrescentVisibility } from "./crescent";
import { calculatePrayerTimes } from "../calculations/prayerTimes";
import { getMoonPosition } from "./moonPosition";
import { calculateElongation } from "./elongation";
import { calculateCrescentGeometry } from "./crescentGeometry";
import { calculateYallop } from "./yallop";

import type { CrescentData } from "../types/crescent";

export interface CrescentInput {
  latitude: number;
  longitude: number;
  elevation: number;
  date: Date;
}

function calculateBestObservationTime(sunset: Date, moonset: Date): Date {
  const sunsetTime = sunset.getTime();

  let moonsetTime = moonset.getTime();

  if (moonsetTime < sunsetTime) {
    moonsetTime += 24 * 60 * 60 * 1000;
  }

  const lagMilliseconds = moonsetTime - sunsetTime;

  return new Date(sunsetTime + (4 / 9) * lagMilliseconds);
}

export function calculateRealCrescent(input: CrescentInput): CrescentData {
  /*
   * 1. Calculate local sunset.
   */
  const prayers = calculatePrayerTimes({
    latitude: input.latitude,
    longitude: input.longitude,
    elevation: input.elevation,
    date: input.date,
    methodKey: "EGYPTIAN",
  });

  if (!prayers.maghrib) {
    throw new Error("Sunset calculation failed");
  }

  const sunset = prayers.maghrib;

  /*
   * 2. Moon position at sunset.
   */
  const moonAtSunset = getMoonPosition(
    sunset,
    input.latitude,
    input.longitude,
    input.elevation,
  );

  if (!moonAtSunset.moonset) {
    throw new Error("Moonset calculation failed");
  }

  let moonset = moonAtSunset.moonset;

  /*
   * Make sure moonset is after sunset.
   */
  if (moonset.getTime() < sunset.getTime()) {
    moonset = new Date(moonset.getTime() + 24 * 60 * 60 * 1000);
  }

  /*
   * 3. Moon lag after sunset.
   */
  let lagMinutes = (moonset.getTime() - sunset.getTime()) / (1000 * 60);

  if (moonAtSunset.altitude <= 0 || lagMinutes <= 0) {
    lagMinutes = 0;
  }

  /*
   * 4. Yallop best observation time.
   */
  const bestTime =
    lagMinutes > 0 ? calculateBestObservationTime(sunset, moonset) : sunset;

  /*
   * 5. Moon data at best observation time.
   */
  const moon = calculateMoonData(bestTime);

  const moonAgeHours = moon.age;

  /*
   * 6. Sun-Moon elongation.
   */
  const elongation = calculateElongation(bestTime);

  /*
   * 7. Topocentric crescent geometry.
   */
  const geometry = calculateCrescentGeometry(
    bestTime,
    input.latitude,
    input.longitude,
    input.elevation,
  );

  /*
   * 8. Yallop visibility criterion.
   */
  const yallop = calculateYallop(geometry.arcv, geometry.crescentWidthArcMin);

  /*
   * Temporary debugging.
   */
  console.group("🌙 FALAK CRESCENT / YALLOP");

  console.log("Location", {
    latitude: input.latitude,
    longitude: input.longitude,
    elevation: input.elevation,
  });

  console.log("Times", {
    sunset,
    moonset,
    lagMinutes,
    bestTime,
  });

  console.log("Moon", {
    ageHours: moonAgeHours,
    illumination: moon.illumination,
    elongation,
  });

  console.log("Geometry", {
    moonAltitude: geometry.moonAltitude,

    sunAltitude: geometry.sunAltitude,

    moonAzimuth: geometry.moonAzimuth,

    sunAzimuth: geometry.sunAzimuth,

    ARCV: geometry.arcv,

    ARCL: geometry.arcl,

    DAZ: geometry.daz,

    moonSemiDiameterArcMin: geometry.moonSemiDiameterArcMin,

    crescentWidthArcMin: geometry.crescentWidthArcMin,
  });

  console.log("Yallop", {
    qValue: yallop.qValue,

    classification: yallop.classification,

    visible: yallop.visible,

    nakedEyeVisible: yallop.nakedEyeVisible,

    opticalAidRequired: yallop.opticalAidRequired,

    description: yallop.description,
  });

  console.groupEnd();
  const conjunction = findPreviousNewMoon(bestTime);
  /*
   * Keep compatibility with CrescentCard
   * for now.
   */
  return calculateCrescentVisibility({
    moonAgeHours,
    illumination: moon.illumination,

    altitude: geometry.moonAltitude,
    elongation,
    lagMinutes,

    yallopClass: yallop.classification,
    yallopQ: yallop.qValue,

    conjunction,

    sunset,
    moonset,
    bestTime,

    arcv: geometry.arcv,
    arcl: geometry.arcl,
    daz: geometry.daz,

    crescentWidthArcMin: geometry.crescentWidthArcMin,
  });
}

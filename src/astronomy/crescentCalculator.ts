import { calculateMoonData } from "./moon";

import { calculateCrescentVisibility } from "./crescent";

import { calculatePrayerTimes } from "../calculations/prayerTimes";

import { getMoonPosition } from "./moonPosition";
import { calculateElongation } from "./elongation";
import { calculateYallop } from "./yallop";
import type { CrescentData } from "../types/crescent";

export interface CrescentInput {
  latitude: number;

  longitude: number;

  elevation: number;

  date: Date;
}

export function calculateRealCrescent(input: CrescentInput): CrescentData {
  const moon = calculateMoonData(input.date);

  const prayers = calculatePrayerTimes({
    latitude: input.latitude,

    longitude: input.longitude,

    elevation: input.elevation,

    date: input.date,

    methodKey: "EGYPTIAN",
  });

  if (!prayers.maghrib) {
    throw new Error("Maghrib calculation failed");
  }

  const moonAgeHours = moon.age;

  /*
   * Temporary elongation.
   * Will be replaced by
   * true Sun-Moon angular separation.
   */
  const elongation = calculateElongation(input.date);
  const moonPosition = getMoonPosition(
    prayers.maghrib,

    input.latitude,

    input.longitude,

    input.elevation,
  );

  const altitude = moonPosition.altitude;

  /*
   * Moon lag after sunset
   */

  let lagMinutes = 0;

  if (moonPosition.moonset) {
    let moonsetTime = moonPosition.moonset.getTime();

    const sunsetTime = prayers.maghrib.getTime();

    /*
     * Handle next-day moonset
     */

    if (moonsetTime < sunsetTime) {
      moonsetTime += 24 * 60 * 60 * 1000;
    }

    lagMinutes = (moonsetTime - sunsetTime) / (1000 * 60);
    if (altitude <= 0) {
      lagMinutes = 0;
    }
  }

  console.log("CRESCENT DEBUG", {
    sunset: prayers.maghrib,

    moonset: moonPosition.moonset,

    lagMinutes,

    altitude,

    moonAgeHours,

    illumination: moon.illumination,
  });
  const yallop = calculateYallop(
    elongation,

    altitude,

    moon.illumination,
  );

  console.log("YALLOP RESULT", yallop);
  return calculateCrescentVisibility(
    moonAgeHours,
    moon.illumination,
    altitude,
    elongation,
    lagMinutes,
    yallop.classification,
  );
}

import { calculatePrayerTimes } from "../calculations/prayerTimes";

import { calculateMoonData } from "../astronomy/moon";

import { calculateRealCrescent } from "../astronomy/crescentCalculator";

import { gregorianToHijri } from "../astronomy/hijri";

export interface FalakInput {
  latitude: number;

  longitude: number;

  elevation: number;

  date: Date;
}

export interface FalakReport {
  date: Date;

  location: {
    latitude: number;

    longitude: number;

    elevation: number;
  };

  prayers: ReturnType<typeof calculatePrayerTimes>;

  moon: ReturnType<typeof calculateMoonData>;

  hijri: ReturnType<typeof gregorianToHijri>;

  crescent: ReturnType<typeof calculateRealCrescent>;
}

export function getFalakReport(input: FalakInput): FalakReport {
  const prayers = calculatePrayerTimes({
    latitude: input.latitude,

    longitude: input.longitude,

    elevation: input.elevation,

    date: input.date,

    methodKey: "EGYPTIAN",
  });

  const moon = calculateMoonData(input.date);

  const hijri = gregorianToHijri(
    input.date,
    input.latitude,
    input.longitude,
    input.elevation,
  );

  const crescent = calculateRealCrescent({
    latitude: input.latitude,

    longitude: input.longitude,

    elevation: input.elevation,

    date: input.date,
  });

  return {
    date: input.date,

    location: {
      latitude: input.latitude,

      longitude: input.longitude,

      elevation: input.elevation,
    },

    prayers,

    moon,

    hijri,

    crescent,
  };
}

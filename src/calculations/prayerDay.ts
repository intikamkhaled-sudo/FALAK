import { calculatePrayerTimes } from "./prayerTimes";
import {
  formatLocalDate,
  formatLocalTime,
  localDateTimeToUTC,
} from "../services/timezone";
import type { LocationConfig } from "../types/location";

export interface PrayerDay {
  date: string;
  location: LocationConfig;

  prayers: {
    fajr: Date | null;
    sunrise: Date | null;
    dhuhr: Date | null;
    asr: Date | null;
    maghrib: Date | null;
    isha: Date | null;
  };

  formatted: {
    fajr: string | null;
    sunrise: string | null;
    dhuhr: string | null;
    asr: string | null;
    maghrib: string | null;
    isha: string | null;
  };
}

function formatPrayer(date: Date | null, timeZone: string): string | null {
  return date ? formatLocalTime(date, timeZone) : null;
}

function belongsToDate(
  date: Date | null,
  expectedDate: string,
  timeZone: string,
): boolean {
  if (!date) {
    return false;
  }

  return formatLocalDate(date, timeZone) === expectedDate;
}

export function calculatePrayerDay(
  date: string,
  location: LocationConfig,
): PrayerDay {
  /*
   * Start calculation from the beginning
   * of the requested local calendar day.
   */
  const calculationDate = localDateTimeToUTC(date, 0, 0, 0, location.timeZone);

  const prayers = calculatePrayerTimes({
    latitude: location.latitude,
    longitude: location.longitude,
    elevation: location.elevation,
    date: calculationDate,
  });

  /*
   * Protect against an astronomical event
   * belonging to another local calendar day.
   */
  const validatedPrayers = {
    fajr: belongsToDate(prayers.fajr, date, location.timeZone)
      ? prayers.fajr
      : null,

    sunrise: belongsToDate(prayers.sunrise, date, location.timeZone)
      ? prayers.sunrise
      : null,

    dhuhr: belongsToDate(prayers.dhuhr, date, location.timeZone)
      ? prayers.dhuhr
      : null,

    asr: belongsToDate(prayers.asr, date, location.timeZone)
      ? prayers.asr
      : null,

    maghrib: belongsToDate(prayers.maghrib, date, location.timeZone)
      ? prayers.maghrib
      : null,

    isha: belongsToDate(prayers.isha, date, location.timeZone)
      ? prayers.isha
      : null,
  };

  return {
    date,
    location,

    prayers: validatedPrayers,

    formatted: {
      fajr: formatPrayer(validatedPrayers.fajr, location.timeZone),

      sunrise: formatPrayer(validatedPrayers.sunrise, location.timeZone),

      dhuhr: formatPrayer(validatedPrayers.dhuhr, location.timeZone),

      asr: formatPrayer(validatedPrayers.asr, location.timeZone),

      maghrib: formatPrayer(validatedPrayers.maghrib, location.timeZone),

      isha: formatPrayer(validatedPrayers.isha, location.timeZone),
    },
  };
}

import { calculatePrayerTimes } from "./prayerTimes";

import {
  formatLocalDate,
  formatLocalTime,
  localDateTimeToUTC,
} from "../services/timezone";

import type { LocationConfig } from "../types/location";
import type { PrayerMethodKey } from "../types/prayer";

interface ValidationResult {
  prayer: string;
  valid: boolean;
  reason: string;
}

interface DayValidationReport {
  date: string;
  method: PrayerMethodKey;
  results: ValidationResult[];
  allValid: boolean;
}

const PRAYER_ORDER = [
  "fajr",
  "sunrise",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
] as const;

type PrayerName = (typeof PRAYER_ORDER)[number];

function validateSameLocalDate(
  date: Date | null,
  expectedDate: string,
  timeZone: string,
): boolean {
  if (!date) {
    return false;
  }

  return formatLocalDate(date, timeZone) === expectedDate;
}

function validateChronologicalOrder(
  prayers: Record<PrayerName, Date | null>,
): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (let i = 0; i < PRAYER_ORDER.length - 1; i++) {
    const currentName = PRAYER_ORDER[i];

    const nextName = PRAYER_ORDER[i + 1];

    const current = prayers[currentName];

    const next = prayers[nextName];

    if (!current || !next) {
      results.push({
        prayer: `${currentName} → ${nextName}`,
        valid: false,
        reason: "One or both prayer times are missing.",
      });

      continue;
    }

    const valid = current.getTime() < next.getTime();

    results.push({
      prayer: `${currentName} → ${nextName}`,
      valid,
      reason: valid
        ? "Correct chronological order."
        : "Invalid chronological order.",
    });
  }

  return results;
}

export function validatePrayerDay(
  dateString: string,
  location: LocationConfig,
  method: PrayerMethodKey,
): DayValidationReport {
  const calculationDate = localDateTimeToUTC(
    dateString,
    0,
    0,
    0,
    location.timeZone,
  );

  const prayers = calculatePrayerTimes({
    latitude: location.latitude,
    longitude: location.longitude,
    elevation: location.elevation,
    date: calculationDate,
    methodKey: method,
  });

  const results: ValidationResult[] = [];

  /*
   * 1. Check that every event
   * belongs to the requested
   * local calendar date.
   */
  for (const prayer of PRAYER_ORDER) {
    const value = prayers[prayer];

    const valid = validateSameLocalDate(value, dateString, location.timeZone);

    results.push({
      prayer,
      valid,
      reason: value
        ? valid
          ? `Local time: ${formatLocalTime(value, location.timeZone)}`
          : `Event belongs to ${formatLocalDate(value, location.timeZone)}`
        : "No event found.",
    });
  }

  /*
   * 2. Check chronological order.
   */
  results.push(...validateChronologicalOrder(prayers));

  return {
    date: dateString,
    method,
    results,
    allValid: results.every((result) => result.valid),
  };
}

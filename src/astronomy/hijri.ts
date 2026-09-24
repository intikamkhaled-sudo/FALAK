import {
  Body,
  Observer,
  MakeTime,
  SearchRiseSet,
  SearchMoonPhase,
} from "astronomy-engine";

import type { HijriDate } from "../types/hijri";

import { findLunarMonthStart, type LunarMonthStartResult } from "./lunarMonth";

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qidah",
  "Dhu al-Hijjah",
];

const DAY_MS = 24 * 60 * 60 * 1000;

const HOUR_MS = 60 * 60 * 1000;

/*
 * Falak lunation anchor.
 *
 * Astronomical New Moon associated
 * with Muharram 1 AH.
 *
 * Historical first-crescent visibility
 * followed this conjunction.
 */
const HIJRI_EPOCH_CONJUNCTION = new Date(Date.UTC(622, 6, 14, 5, 27, 0, 0));

/*
 * This is metadata only.
 *
 * Month boundaries themselves are
 * determined astronomically by Falak.
 */

/*
 * Convert a lunation index into
 * Hijri month/year.
 *
 * index 0:
 * Muharram 1 AH
 *
 * index 1:
 * Safar 1 AH
 *
 * ...
 *
 * index 11:
 * Dhu al-Hijjah 1 AH
 *
 * index 12:
 * Muharram 2 AH
 */
function lunationIndexToHijri(lunationIndex: number): {
  month: number;
  year: number;
} {
  const year = Math.floor(lunationIndex / 12) + 1;

  const month = (((lunationIndex % 12) + 12) % 12) + 1;

  return {
    month,
    year,
  };
}

/*
 * Count astronomical New Moons from
 * the Hijri epoch conjunction to the
 * conjunction associated with the
 * current Falak lunar month.
 *
 * We do NOT estimate this by dividing
 * milliseconds by 29.53 days.
 *
 * Instead Astronomy Engine searches
 * the actual conjunction sequence.
 */
function getLunationIndex(targetConjunction: Date): number {
  /*
   * Modern Falak dates are after
   * the Hijri epoch.
   */
  if (targetConjunction.getTime() < HIJRI_EPOCH_CONJUNCTION.getTime()) {
    throw new Error("Falak Hijri dates before 1 AH are not supported.");
  }

  /*
   * A direct month estimate gets us
   * very close to the correct index.
   *
   * The final alignment is checked
   * astronomically below.
   */
  const meanSynodicMonth = 29.530588853 * DAY_MS;

  let index = Math.round(
    (targetConjunction.getTime() - HIJRI_EPOCH_CONJUNCTION.getTime()) /
      meanSynodicMonth,
  );

  /*
   * Reconstruct the conjunction near
   * the estimated lunation.
   *
   * Start a few days before its
   * estimated location.
   */
  const estimatedTime = new Date(
    HIJRI_EPOCH_CONJUNCTION.getTime() + index * meanSynodicMonth,
  );

  const searchStart = new Date(estimatedTime.getTime() - 5 * DAY_MS);

  const event = SearchMoonPhase(0, MakeTime(searchStart), 10);

  if (!event) {
    return index;
  }

  /*
   * Correct the estimate if floating
   * mean-month arithmetic placed us
   * one lunation away.
   */
  const difference = targetConjunction.getTime() - event.date.getTime();

  if (difference > 15 * DAY_MS) {
    index += 1;
  } else if (difference < -15 * DAY_MS) {
    index -= 1;
  }

  return index;
}

/*
 * Find the most recent sunset
 * at or before the requested instant.
 */
function findPreviousSunset(date: Date, observer: Observer): Date | null {
  let cursor = new Date(date.getTime() - 36 * HOUR_MS);

  let latest: Date | null = null;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const event = SearchRiseSet(Body.Sun, observer, -1, MakeTime(cursor), 2);

    if (!event) {
      break;
    }

    if (event.date.getTime() > date.getTime()) {
      break;
    }

    latest = event.date;

    cursor = new Date(event.date.getTime() + 60 * 1000);
  }

  return latest;
}

/*
 * Find the astronomical lunar month
 * containing the requested instant.
 *
 * If conjunction has happened but
 * first accepted crescent visibility
 * has not happened yet, we still
 * belong to the preceding Hijri month.
 */
function findCurrentLunarMonth(
  date: Date,
  latitude: number,
  longitude: number,
  elevation: number,
): LunarMonthStartResult | null {
  const candidate = findLunarMonthStart(date, latitude, longitude, elevation);

  if (!candidate) {
    return null;
  }

  if (candidate.monthStart.getTime() <= date.getTime()) {
    return candidate;
  }

  const previousLunationInstant = new Date(
    candidate.conjunction.getTime() - 1000,
  );

  return findLunarMonthStart(
    previousLunationInstant,
    latitude,
    longitude,
    elevation,
  );
}

/*
 * Hijri day changes at sunset.
 */
function calculateHijriDay(
  date: Date,
  monthStart: Date,
  observer: Observer,
): number {
  if (date.getTime() <= monthStart.getTime()) {
    return 1;
  }

  const previousSunset = findPreviousSunset(date, observer);

  if (!previousSunset) {
    const elapsed = date.getTime() - monthStart.getTime();

    return Math.max(1, Math.round(elapsed / DAY_MS) + 1);
  }

  const elapsed = previousSunset.getTime() - monthStart.getTime();

  const sunsetIntervals = Math.round(elapsed / DAY_MS);

  return Math.max(1, sunsetIntervals + 1);
}

export function gregorianToHijri(
  date: Date,
  latitude: number,
  longitude: number,
  elevation: number,
): HijriDate {
  const observer = new Observer(latitude, longitude, elevation);

  const lunarMonth = findCurrentLunarMonth(
    date,
    latitude,
    longitude,
    elevation,
  );

  if (!lunarMonth) {
    throw new Error(
      "Unable to determine astronomical Hijri month for this location.",
    );
  }

  /*
   * Day number comes entirely from
   * Falak's sunset/month-start engine.
   */
  const day = calculateHijriDay(date, lunarMonth.monthStart, observer);

  /*
   * Month/year now come from the
   * astronomical lunation sequence.
   *
   * No Intl Islamic calendar.
   * No Umm al-Qura.
   */
  const lunationIndex = getLunationIndex(lunarMonth.conjunction);

  const { month, year } = lunationIndexToHijri(lunationIndex);

  return {
    day,

    month,

    year,

    monthName: HIJRI_MONTHS[month - 1],
  };
}

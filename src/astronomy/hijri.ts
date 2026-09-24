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
const MINUTE_MS = 60 * 1000;

/*
 * Falak lunation anchor.
 *
 * Used only to map the astronomical
 * lunation sequence to Hijri month/year.
 *
 * The actual beginning of each month
 * is determined locally by Falak's
 * crescent-visibility engine.
 */
const HIJRI_EPOCH_CONJUNCTION = new Date(Date.UTC(622, 6, 14, 5, 27, 0, 0));

/*
 * Convert astronomical lunation index
 * into Hijri month/year.
 *
 * index 0  -> Muharram 1 AH
 * index 1  -> Safar 1 AH
 * ...
 * index 11 -> Dhu al-Hijjah 1 AH
 * index 12 -> Muharram 2 AH
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
 * Determine the lunation number associated
 * with the conjunction that produced the
 * current Falak lunar month.
 *
 * Mean synodic month is used only to obtain
 * an initial index estimate.
 *
 * Astronomy Engine is then used to align
 * that estimate with the real conjunction.
 */
function getLunationIndex(targetConjunction: Date): number {
  if (targetConjunction.getTime() < HIJRI_EPOCH_CONJUNCTION.getTime()) {
    throw new Error("Falak Hijri dates before 1 AH are not supported.");
  }

  const meanSynodicMonth = 29.530588853 * DAY_MS;

  let index = Math.round(
    (targetConjunction.getTime() - HIJRI_EPOCH_CONJUNCTION.getTime()) /
      meanSynodicMonth,
  );

  const estimatedTime = new Date(
    HIJRI_EPOCH_CONJUNCTION.getTime() + index * meanSynodicMonth,
  );

  const searchStart = new Date(estimatedTime.getTime() - 5 * DAY_MS);

  const event = SearchMoonPhase(0, MakeTime(searchStart), 10);

  if (!event) {
    return index;
  }

  const difference = targetConjunction.getTime() - event.date.getTime();

  if (difference > 15 * DAY_MS) {
    index += 1;
  } else if (difference < -15 * DAY_MS) {
    index -= 1;
  }

  return index;
}

/*
 * Find the Falak lunar month containing
 * the requested instant.
 *
 * Important:
 *
 * A conjunction by itself does NOT start
 * the new Hijri month.
 *
 * The month starts only after the first
 * crescent evening accepted by Falak's
 * visibility policy.
 *
 * Therefore, if the next conjunction has
 * already happened but its crescent has
 * not yet produced a month start, the
 * requested instant still belongs to the
 * previous lunar month.
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
 * Count actual local sunsets.
 *
 * This is intentionally NOT calculated
 * using elapsedMilliseconds / 24 hours.
 *
 * The interval between two local sunsets
 * is not guaranteed to be exactly 24h.
 *
 * Hijri day 1 begins at monthStart.
 *
 * Each following local sunset advances
 * the Hijri day by exactly one.
 */
function countSunsetsSinceMonthStart(
  monthStart: Date,
  date: Date,
  observer: Observer,
): number {
  if (date.getTime() <= monthStart.getTime()) {
    return 0;
  }

  /*
   * Move slightly after monthStart so
   * the sunset that STARTED day 1 is
   * not counted again.
   */
  let cursor = new Date(monthStart.getTime() + MINUTE_MS);

  let sunsetCount = 0;

  /*
   * A Hijri month cannot realistically
   * require anywhere near this many
   * iterations.
   *
   * The guard prevents accidental
   * infinite searches in pathological
   * astronomical conditions.
   */
  for (let attempt = 0; attempt < 35; attempt += 1) {
    const sunset = SearchRiseSet(Body.Sun, observer, -1, MakeTime(cursor), 2);

    if (!sunset) {
      break;
    }

    if (sunset.date.getTime() > date.getTime()) {
      break;
    }

    sunsetCount += 1;

    /*
     * Continue after the sunset that
     * was just counted.
     */
    cursor = new Date(sunset.date.getTime() + MINUTE_MS);
  }

  return sunsetCount;
}

/*
 * Hijri days change at LOCAL SUNSET.
 *
 * monthStart itself = beginning of day 1
 *
 * next local sunset = day 2
 *
 * next local sunset = day 3
 *
 * etc.
 */
function calculateHijriDay(
  date: Date,
  monthStart: Date,
  observer: Observer,
): number {
  const sunsetsPassed = countSunsetsSinceMonthStart(monthStart, date, observer);

  return sunsetsPassed + 1;
}

/*
 * Public Falak Hijri conversion.
 *
 * The result depends on:
 *
 * - requested instant
 * - latitude
 * - longitude
 * - elevation
 * - local crescent visibility
 * - local sunset sequence
 *
 * It does NOT use:
 *
 * - Intl Islamic calendar
 * - Umm al-Qura
 * - fixed country offsets
 * - midnight as Hijri day boundary
 */
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
   * Hijri DAY:
   *
   * Determined from actual local
   * sunsets after month start.
   */
  const day = calculateHijriDay(date, lunarMonth.monthStart, observer);

  /*
   * Hijri MONTH/YEAR:
   *
   * Determined from the astronomical
   * lunation sequence.
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

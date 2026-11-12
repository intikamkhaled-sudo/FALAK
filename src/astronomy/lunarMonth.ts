import { Body, Observer, MakeTime, SearchRiseSet } from "astronomy-engine";

import { calculateMoonData, findPreviousNewMoon } from "./moon";

import { calculateElongation } from "./elongation";
import { calculateCrescentGeometry } from "./crescentGeometry";
import { calculateYallop } from "./yallop";

import type { YallopClass } from "../types/crescent";

/*
 * Month-start policy.
 *
 * NAKED_EYE:
 *   A / B start the month.
 *
 * OPTICAL_AID:
 *   A / B / C / D start the month.
 */
export type CrescentVisibilityPolicy = "NAKED_EYE" | "OPTICAL_AID";

export const DEFAULT_CRESCENT_POLICY: CrescentVisibilityPolicy = "NAKED_EYE";

export interface CrescentNightResult {
  conjunction: Date;

  sunset: Date;
  moonset: Date | null;
  bestTime: Date;

  lagMinutes: number;

  moonAgeHours: number;
  illumination: number;

  altitude: number;
  elongation: number;

  arcv: number;
  arcl: number;
  daz: number;

  crescentWidthArcMin: number;

  yallopQ: number;
  yallopClass: YallopClass;

  /*
   * Whether this observation satisfies
   * the selected month-start policy.
   */
  visible: boolean;
}

export interface LunarMonthStartResult {
  conjunction: Date;

  firstVisibleEvening: Date;

  /*
   * Exact sunset instant at which
   * Hijri day 1 begins.
   */
  monthStart: Date;

  policy: CrescentVisibilityPolicy;

  observation: CrescentNightResult;
}

/*
 * Decide whether a Yallop class satisfies
 * Falak's selected calendar policy.
 *
 * This is deliberately separate from
 * the astronomical Yallop calculation.
 */
export function isAcceptedForMonthStart(
  yallopClass: YallopClass,
  policy: CrescentVisibilityPolicy,
): boolean {
  if (policy === "OPTICAL_AID") {
    return (
      yallopClass === "A" ||
      yallopClass === "B" ||
      yallopClass === "C" ||
      yallopClass === "D"
    );
  }

  /*
   * Default:
   * naked-eye month-start policy.
   */
  return yallopClass === "A" || yallopClass === "B";
}

/*
 * Find the first sunset after
 * the supplied instant.
 */
function findNextSunset(date: Date, observer: Observer): Date | null {
  const event = SearchRiseSet(Body.Sun, observer, -1, MakeTime(date), 2);

  return event ? event.date : null;
}

/*
 * Find the first Moon setting
 * event after sunset.
 */
function findMoonsetAfterSunset(sunset: Date, observer: Observer): Date | null {
  const event = SearchRiseSet(Body.Moon, observer, -1, MakeTime(sunset), 1, 0);

  return event ? event.date : null;
}

/*
 * Yallop best observation time:
 *
 * Tb = Ts + 4/9 × lag
 *
 * where lag is the interval between
 * sunset and moonset.
 */
function calculateBestTime(sunset: Date, moonset: Date): Date {
  const lagMilliseconds = moonset.getTime() - sunset.getTime();

  return new Date(sunset.getTime() + (4 / 9) * lagMilliseconds);
}

/*
 * Evaluate a single evening.
 */
export function evaluateCrescentEvening(
  conjunction: Date,
  sunset: Date,
  latitude: number,
  longitude: number,
  elevation: number,
  policy: CrescentVisibilityPolicy = DEFAULT_CRESCENT_POLICY,
): CrescentNightResult {
  const observer = new Observer(latitude, longitude, elevation);

  const moonset = findMoonsetAfterSunset(sunset, observer);

  /*
   * A moonset extremely far after sunset
   * is not the young post-sunset crescent
   * geometry this calculation is intended
   * to evaluate.
   *
   * This is a search guard, not a Yallop
   * visibility criterion.
   */
  let validMoonset = moonset;

  if (
    validMoonset &&
    validMoonset.getTime() - sunset.getTime() > 12 * 60 * 60 * 1000
  ) {
    validMoonset = null;
  }

  let lagMinutes = 0;

  if (validMoonset) {
    lagMinutes = (validMoonset.getTime() - sunset.getTime()) / (1000 * 60);
  }

  /*
   * If the Moon does not remain above
   * the horizon after sunset, this
   * evening cannot start the month.
   */
  if (!validMoonset || lagMinutes <= 0) {
    const moon = calculateMoonData(sunset);

    const geometry = calculateCrescentGeometry(
      sunset,
      latitude,
      longitude,
      elevation,
    );

    const elongation = calculateElongation(sunset);

    return {
      conjunction,

      sunset,
      moonset: validMoonset,
      bestTime: sunset,

      lagMinutes: 0,

      moonAgeHours: moon.age,

      illumination: moon.illumination,

      altitude: geometry.moonAltitude,

      elongation,

      arcv: geometry.arcv,

      arcl: geometry.arcl,

      daz: geometry.daz,

      crescentWidthArcMin: geometry.crescentWidthArcMin,

      yallopQ: Number.NEGATIVE_INFINITY,

      yallopClass: "F",

      visible: false,
    };
  }

  const bestTime = calculateBestTime(sunset, validMoonset);

  const moon = calculateMoonData(bestTime);

  const geometry = calculateCrescentGeometry(
    bestTime,
    latitude,
    longitude,
    elevation,
  );

  const elongation = calculateElongation(bestTime);

  const yallop = calculateYallop(geometry.arcv, geometry.crescentWidthArcMin);

  const visible = isAcceptedForMonthStart(yallop.classification, policy);

  return {
    conjunction,

    sunset,
    moonset: validMoonset,
    bestTime,

    lagMinutes,

    moonAgeHours: moon.age,

    illumination: moon.illumination,

    altitude: geometry.moonAltitude,

    elongation,

    arcv: geometry.arcv,

    arcl: geometry.arcl,

    daz: geometry.daz,

    crescentWidthArcMin: geometry.crescentWidthArcMin,

    yallopQ: yallop.qValue,

    yallopClass: yallop.classification,

    visible,
  };
}

/*
 * Find the first evening after conjunction
 * that satisfies the selected Falak
 * month-start policy.
 */
export function findLunarMonthStart(
  date: Date,
  latitude: number,
  longitude: number,
  elevation: number,
  policy: CrescentVisibilityPolicy = DEFAULT_CRESCENT_POLICY,
): LunarMonthStartResult | null {
  const conjunction = findPreviousNewMoon(date);

  if (!conjunction) {
    return null;
  }

  const observer = new Observer(latitude, longitude, elevation);

  /*
   * Search for the first sunset
   * immediately after conjunction.
   */
  let sunset = findNextSunset(new Date(conjunction.getTime() + 1000), observer);

  if (!sunset) {
    return null;
  }

  /*
   * Search consecutive evenings.
   *
   * Four evenings is intentionally
   * generous for a normal young-crescent
   * visibility search.
   */
  for (let night = 0; night < 4; night += 1) {
    const observation = evaluateCrescentEvening(
      conjunction,
      sunset,
      latitude,
      longitude,
      elevation,
      policy,
    );

    if (observation.visible) {
      return {
        conjunction,

        firstVisibleEvening: observation.sunset,

        monthStart: observation.sunset,

        policy,

        observation,
      };
    }

    /*
     * Move far enough forward that
     * SearchRiseSet cannot rediscover
     * the same sunset.
     */
    const nextSearch = new Date(sunset.getTime() + 18 * 60 * 60 * 1000);

    sunset = findNextSunset(nextSearch, observer);

    if (!sunset) {
      return null;
    }
  }

  return null;
}

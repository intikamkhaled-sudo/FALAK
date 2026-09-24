import {
  Body,
  Observer,
  Equator,
  MakeTime,
  SearchAltitude,
  SearchRiseSet,
  SearchHourAngle,
} from "astronomy-engine";

import { getPrayerMethod } from "./prayerMethods";

import type { PrayerMethod, PrayerMethodKey } from "../types/prayer";

import { isShortNight } from "./highLatitudeValidation";
import { applyHighLatitudeRule } from "./highLatitude";

export interface PrayerTimes {
  imsak: Date | null;
  fajr: Date | null;
  sunrise: Date | null;
  dhuhr: Date | null;
  asr: Date | null;
  maghrib: Date | null;
  isha: Date | null;
  midnight: Date | null;
}

export interface PrayerCalculationInput {
  latitude: number;
  longitude: number;
  elevation: number;
  date: Date;

  /**
   * Use a predefined calculation method.
   * Default: EGYPTIAN
   */
  methodKey?: PrayerMethodKey;

  /**
   * Use a custom prayer method.
   * If provided, it takes priority over methodKey.
   */
  method?: PrayerMethod;
}

/**
 * Create a stable search starting point for
 * the requested calendar day.
 *
 * We start from 00:00 UTC so the result does
 * not depend on the current hour/minute/second.
 */
function getDayStart(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
  );
}

/**
 * Calculate solar declination at solar noon.
 */
function getSolarDeclinationAtNoon(
  observer: Observer,
  time: ReturnType<typeof MakeTime>,
): number {
  const noonEvent = SearchHourAngle(Body.Sun, observer, 0, time, 1);

  if (!noonEvent) {
    throw new Error("Unable to calculate solar noon.");
  }

  const noonTime = MakeTime(noonEvent.time.date);

  const equator = Equator(Body.Sun, noonTime, observer, true, true);

  return equator.dec;
}

/**
 * Calculate Asr solar hour angle.
 *
 * shadowFactor:
 * 1 = Shafi'i / Standard
 * 2 = Hanafi
 */
function calculateAsrHourAngle(
  latitude: number,
  declination: number,
  shadowFactor: number,
): number {
  const latitudeRad = (latitude * Math.PI) / 180;

  const declinationRad = (declination * Math.PI) / 180;

  const angleDifference = Math.abs(latitudeRad - declinationRad);

  const altitudeRad = Math.atan(1 / (shadowFactor + Math.tan(angleDifference)));

  const altitudeDeg = (altitudeRad * 180) / Math.PI;

  const numerator =
    Math.sin((altitudeDeg * Math.PI) / 180) -
    Math.sin(latitudeRad) * Math.sin(declinationRad);

  const denominator = Math.cos(latitudeRad) * Math.cos(declinationRad);

  const cosHourAngle = numerator / denominator;

  const clampedCosHourAngle = Math.max(-1, Math.min(1, cosHourAngle));

  const hourAngleRad = Math.acos(clampedCosHourAngle);

  const hourAngleDeg = (hourAngleRad * 180) / Math.PI;

  /**
   * SearchHourAngle expects sidereal hours.
   */
  return hourAngleDeg / 15;
}

/**
 * Calculate Fajr.
 */
function calculateFajr(
  observer: Observer,
  time: ReturnType<typeof MakeTime>,
  method: PrayerMethod,
  sunrise: Date | null,
  sunset: Date | null,
  shortNight: boolean,
): Date | null {
  if (method.fajr.type !== "ANGLE") {
    return null;
  }

  const event = SearchAltitude(
    Body.Sun,
    observer,
    1,
    time,
    1,
    -method.fajr.value,
  );

  if (event) {
    return event.date;
  }

  /*
   * High latitude fallback.
   */
  if (shortNight && sunrise && sunset && method.highLatitude.rule !== "NONE") {
    return applyHighLatitudeRule(
      method.highLatitude.rule,
      sunrise,
      sunset,
      false,
    );
  }

  return null;
}

/**
 * Calculate sunrise.
 */
function calculateSunrise(
  observer: Observer,
  time: ReturnType<typeof MakeTime>,
): Date | null {
  const event = SearchRiseSet(Body.Sun, observer, 1, time, 1, 0);

  return event ? event.date : null;
}

/**
 * Calculate Imsak.
 */
function calculateImsak(fajr: Date | null, method: PrayerMethod): Date | null {
  if (!fajr || !method.imsak.enabled) {
    return null;
  }

  return new Date(fajr.getTime() - method.imsak.minutesBeforeFajr * 60 * 1000);
}

/**
 * Calculate solar noon / Dhuhr.
 */
function calculateDhuhr(
  observer: Observer,
  time: ReturnType<typeof MakeTime>,
): Date | null {
  const event = SearchHourAngle(Body.Sun, observer, 0, time, 1);

  return event ? event.time.date : null;
}

/**
 * Calculate Asr.
 */
function calculateAsr(
  latitude: number,
  observer: Observer,
  time: ReturnType<typeof MakeTime>,
  method: PrayerMethod,
): Date | null {
  const shadowFactor = method.asrMadhab === "HANAFI" ? 2 : 1;

  const declination = getSolarDeclinationAtNoon(observer, time);

  const hourAngle = calculateAsrHourAngle(latitude, declination, shadowFactor);

  const event = SearchHourAngle(Body.Sun, observer, hourAngle, time, 1);

  return event ? event.time.date : null;
}

/**
 * Calculate sunset / Maghrib.
 */
function calculateMaghrib(
  observer: Observer,
  time: ReturnType<typeof MakeTime>,
): Date | null {
  const event = SearchRiseSet(Body.Sun, observer, -1, time, 1, 0);

  return event ? event.date : null;
}

/**
 * Calculate Isha.
 */
function calculateIsha(
  observer: Observer,
  time: ReturnType<typeof MakeTime>,
  method: PrayerMethod,
  sunrise: Date | null,
  sunset: Date | null,
  maghrib: Date | null,
): Date | null {
  if (method.isha.type === "ANGLE") {
    const event = SearchAltitude(
      Body.Sun,
      observer,
      -1,
      time,
      1,
      -method.isha.value,
    );

    if (event) {
      return event.date;
    }
  }

  /*
   * Fixed minutes after Maghrib.
   */
  if (method.isha.type === "MINUTES" && maghrib) {
    return new Date(maghrib.getTime() + method.isha.value * 60 * 1000);
  }

  /*
   * High latitude fallback.
   */
  if (sunrise && sunset && method.highLatitude.rule !== "NONE") {
    return applyHighLatitudeRule(
      method.highLatitude.rule,
      sunrise,
      sunset,
      true,
    );
  }

  return null;
}

/**
 * Calculate Islamic midnight.
 */
function calculateIslamicMidnight(
  maghrib: Date | null,
  fajr: Date | null,
): Date | null {
  if (!maghrib || !fajr) {
    return null;
  }

  const day = 24 * 60 * 60 * 1000;

  const maghribTime = maghrib.getTime();

  let fajrTime = fajr.getTime();

  if (fajrTime <= maghribTime) {
    fajrTime += day;
  }

  return new Date(maghribTime + (fajrTime - maghribTime) / 2);
}

/**
 * Main prayer time calculation engine.
 */
export function calculatePrayerTimes(
  input: PrayerCalculationInput,
): PrayerTimes {
  const { latitude, longitude, elevation, date } = input;

  const method = input.method ?? getPrayerMethod(input.methodKey ?? "EGYPTIAN");

  const observer = new Observer(latitude, longitude, elevation);

  /*
   * IMPORTANT:
   *
   * All searches now start from the same
   * stable point for the requested day.
   *
   * The result therefore does not depend
   * on whether Falak was opened at
   * 01:00, 12:00, or 23:00.
   */
  const dayStart = getDayStart(date);

  const time = MakeTime(dayStart);

  const sunrise = calculateSunrise(observer, time);

  const maghrib = calculateMaghrib(observer, time);

  const shortNight =
    sunrise && maghrib ? isShortNight(maghrib, sunrise, 90) : false;

  const fajr = calculateFajr(
    observer,
    time,
    method,
    sunrise,
    maghrib,
    shortNight,
  );

  const imsak = calculateImsak(fajr, method);

  const dhuhr = calculateDhuhr(observer, time);

  const asr = calculateAsr(latitude, observer, time, method);

  const isha = calculateIsha(observer, time, method, sunrise, maghrib, maghrib);

  return {
    imsak,
    fajr,
    sunrise,
    dhuhr,
    asr,
    maghrib,
    isha,

    midnight: calculateIslamicMidnight(maghrib, fajr),
  };
}

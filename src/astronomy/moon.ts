import { MakeTime, MoonPhase, SearchMoonPhase } from "astronomy-engine";

import type { MoonData, MoonAgeState, MoonPhaseName } from "../types/moon";

const DAY_MS = 24 * 60 * 60 * 1000;

const SEARCH_WINDOW_DAYS = 40;

/*
 * Small offset used after finding an event
 * so the next search cannot rediscover
 * the same conjunction.
 */
const EVENT_OFFSET_MS = 60 * 1000;

function getPhaseName(angle: number): MoonPhaseName {
  if (angle < 22.5) {
    return "NEW_MOON";
  }

  if (angle < 67.5) {
    return "WAXING_CRESCENT";
  }

  if (angle < 112.5) {
    return "FIRST_QUARTER";
  }

  if (angle < 157.5) {
    return "WAXING_GIBBOUS";
  }

  if (angle < 202.5) {
    return "FULL_MOON";
  }

  if (angle < 247.5) {
    return "WANING_GIBBOUS";
  }

  if (angle < 292.5) {
    return "LAST_QUARTER";
  }

  if (angle < 337.5) {
    return "WANING_CRESCENT";
  }

  return "NEW_MOON";
}

/*
 * Find the most recent astronomical
 * conjunction at or before `date`.
 *
 * We deliberately start far enough
 * in the past to guarantee that at
 * least one conjunction is available.
 *
 * SearchMoonPhase returns the first
 * matching event after the search
 * starting instant.
 *
 * Therefore we keep searching forward
 * and retain the latest event that
 * does not pass `date`.
 */
export function findPreviousNewMoon(date: Date): Date | null {
  const searchStart = new Date(date.getTime() - 35 * DAY_MS);

  let cursor = searchStart;

  let latest: Date | null = null;

  /*
   * 35 days can contain at most a very
   * small number of New Moon events.
   *
   * Three iterations gives plenty of
   * room while protecting against an
   * accidental endless search.
   */
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const event = SearchMoonPhase(0, MakeTime(cursor), SEARCH_WINDOW_DAYS);

    if (!event) {
      break;
    }

    const eventDate = event.date;

    /*
     * We have reached the first
     * conjunction after the requested
     * instant.
     *
     * `latest` is therefore the previous
     * conjunction we want.
     */
    if (eventDate.getTime() > date.getTime()) {
      break;
    }

    latest = eventDate;

    /*
     * Move just beyond this event
     * before searching again.
     */
    cursor = new Date(eventDate.getTime() + EVENT_OFFSET_MS);
  }

  return latest;
}

/*
 * Find the first astronomical
 * conjunction strictly after `date`.
 */
export function findNextNewMoon(date: Date): Date | null {
  /*
   * Move slightly beyond the supplied
   * instant so that if `date` happens
   * to equal a conjunction exactly,
   * we find the following lunation.
   */
  const searchStart = new Date(date.getTime() + 1000);

  const event = SearchMoonPhase(0, MakeTime(searchStart), SEARCH_WINDOW_DAYS);

  if (!event) {
    return null;
  }

  return event.date;
}

export function calculateMoonData(date: Date): MoonData {
  const time = MakeTime(date);

  /*
   * Geocentric lunar phase angle:
   *
   *   0° = New Moon
   *  90° = First Quarter
   * 180° = Full Moon
   * 270° = Last Quarter
   */
  const phaseAngle = MoonPhase(time);

  const phase = getPhaseName(phaseAngle);

  /*
   * Illuminated fraction of the lunar
   * disk, expressed as a percentage.
   */
  const phaseRadians = (phaseAngle * Math.PI) / 180;

  const illumination = ((1 - Math.cos(phaseRadians)) / 2) * 100;

  /*
   * Lunar age is measured from the
   * most recent astronomical
   * conjunction.
   */
  const previousNewMoon = findPreviousNewMoon(date);

  let age = 0;

  if (previousNewMoon) {
    age = (time.date.getTime() - previousNewMoon.getTime()) / (1000 * 60 * 60);
  }

  const ageState: MoonAgeState = age < 0 ? "BEFORE_NEW_MOON" : "AFTER_NEW_MOON";

  const nextNewMoon = findNextNewMoon(date);

  return {
    phaseAngle,

    illumination,

    phase,

    age,

    ageState,

    /*
     * Physical distance can be populated
     * separately if MoonData requires it.
     */
    distance: null,

    nextNewMoon,
  };
}

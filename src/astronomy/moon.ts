// src/astronomy/moon.ts

import { MakeTime, MoonPhase, SearchMoonPhase } from "astronomy-engine";

import type { MoonData, MoonAgeState, MoonPhaseName } from "../types/moon";

function getPhaseName(angle: number): MoonPhaseName {
  if (angle < 22.5) return "NEW_MOON";

  if (angle < 67.5) return "WAXING_CRESCENT";

  if (angle < 112.5) return "FIRST_QUARTER";

  if (angle < 157.5) return "WAXING_GIBBOUS";

  if (angle < 202.5) return "FULL_MOON";

  if (angle < 247.5) return "WANING_GIBBOUS";

  if (angle < 292.5) return "LAST_QUARTER";

  if (angle < 337.5) return "WANING_CRESCENT";

  return "NEW_MOON";
}

function findPreviousNewMoon(date: Date) {
  const searchDate = new Date(date.getTime() - 40 * 24 * 60 * 60 * 1000);

  const newMoon = SearchMoonPhase(0, MakeTime(searchDate), 40);

  if (!newMoon) {
    return null;
  }

  // التأكد أن المحاق السابق وليس القادم

  if (newMoon.date > date) {
    const previousSearch = new Date(
      searchDate.getTime() - 40 * 24 * 60 * 60 * 1000,
    );

    return SearchMoonPhase(0, MakeTime(previousSearch), 40);
  }

  return newMoon;
}

export function calculateMoonData(date: Date): MoonData {
  const time = MakeTime(date);

  const phaseAngle = MoonPhase(time);

  const phase = getPhaseName(phaseAngle);

  const illumination = ((1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2) * 100;

  const lastNewMoon = findPreviousNewMoon(date);

  let age = 0;

  if (lastNewMoon) {
    age = (time.date.getTime() - lastNewMoon.date.getTime()) / (1000 * 60 * 60);
  }

  const ageState: MoonAgeState = age < 0 ? "BEFORE_NEW_MOON" : "AFTER_NEW_MOON";

  console.log("MOON AGE DEBUG", {
    lastNewMoon: lastNewMoon?.date,

    current: time.date,

    age,
  });

  const nextNewMoon = SearchMoonPhase(0, time, 40);

  console.log("MOON DATA DEBUG", {
    age,

    ageDays: age / 24,

    phase,

    illumination,

    phaseAngle,
  });

  return {
    phaseAngle,

    illumination,

    phase,

    age,

    ageState,

    distance: null,

    nextNewMoon: nextNewMoon ? nextNewMoon.date : null,
  };
}

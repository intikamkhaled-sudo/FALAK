import type { CrescentData } from "../types/crescent";

function calculateVisibility(
  ageHours: number,
  illumination: number,
  altitude: number,
  elongation: number,
  lagMinutes: number,
): CrescentData["visibility"] {
  /*
   * Basic physical rejection
   */

  if (
    ageHours < 12 ||
    illumination < 0.5 ||
    elongation < 8 ||
    altitude < 3 ||
    lagMinutes < 20
  ) {
    return "NOT_VISIBLE";
  }

  /*
   * Possible visibility
   */

  if (
    ageHours >= 18 &&
    illumination >= 1 &&
    altitude >= 5 &&
    elongation >= 10 &&
    lagMinutes >= 30
  ) {
    return "VISIBLE";
  }

  return "POSSIBLE";
}

function calculateConfidence(
  visibility: CrescentData["visibility"],
  yallopClass?: string,
): CrescentData["confidence"] {
  /*
   * Yallop gives stronger confidence
   */
  if (yallopClass === "D" && visibility === "NOT_VISIBLE") {
    return "CERTAIN";
  }
  if (yallopClass === "E") {
    return "CERTAIN";
  }

  if (yallopClass === "A") {
    return "CERTAIN";
  }

  if (yallopClass === "B" || yallopClass === "D") {
    return "LIKELY";
  }

  if (visibility === "VISIBLE") {
    return "LIKELY";
  }

  return "UNCERTAIN";
}

export function calculateCrescentVisibility(
  moonAgeHours: number,

  illumination: number,

  altitude: number,

  elongation: number,

  lagMinutes: number,

  yallopClass?: string,
): CrescentData {
  const visibility = calculateVisibility(
    moonAgeHours,

    illumination,

    altitude,

    elongation,

    lagMinutes,
  );

  return {
    moonAgeHours,

    illumination,

    altitude,

    elongation,

    lagMinutes,

    visibility,

    confidence: calculateConfidence(visibility, yallopClass),

    yallopClass,
  };
}

import type {
  CrescentData,
  VisibilityLevel,
  VisibilityConfidence,
  YallopClass,
} from "../types/crescent";

/*
 * Convert Yallop classification
 * into Falak's simple visibility status.
 *
 * A:
 * Easily visible with naked eye.
 *
 * B:
 * Visible with naked eye under
 * very good conditions.
 *
 * C:
 * Optical aid may be required
 * to locate the crescent.
 *
 * D:
 * Optical aid required.
 *
 * E / F:
 * Not visible according to
 * the Yallop criterion.
 */
function getVisibilityFromYallop(yallopClass: YallopClass): VisibilityLevel {
  if (yallopClass === "A" || yallopClass === "B") {
    return "VISIBLE";
  }

  if (yallopClass === "C" || yallopClass === "D") {
    return "POSSIBLE";
  }

  return "NOT_VISIBLE";
}

/*
 * Confidence describes how strongly
 * Falak can present the simplified
 * visibility result.
 *
 * It is NOT another astronomical
 * visibility criterion.
 */
function getConfidenceFromYallop(
  yallopClass: YallopClass,
): VisibilityConfidence {
  if (yallopClass === "A" || yallopClass === "E" || yallopClass === "F") {
    return "CERTAIN";
  }

  if (yallopClass === "B" || yallopClass === "D") {
    return "LIKELY";
  }

  return "UNCERTAIN";
}

export interface CrescentVisibilityInput {
  moonAgeHours: number;
  illumination: number;

  altitude: number;
  elongation: number;
  lagMinutes: number;

  yallopClass: YallopClass;
  yallopQ: number;

  conjunction?: Date | null;

  sunset?: Date | null;
  moonset?: Date | null;
  bestTime?: Date | null;

  arcv?: number;
  arcl?: number;
  daz?: number;

  crescentWidthArcMin?: number;
}

/*
 * Build the final CrescentData object.
 *
 * All astronomical calculations are
 * performed elsewhere.
 *
 * This function only converts the
 * Yallop result into the simplified
 * Falak UI representation.
 */
export function calculateCrescentVisibility(
  input: CrescentVisibilityInput,
): CrescentData {
  const visibility = getVisibilityFromYallop(input.yallopClass);

  const confidence = getConfidenceFromYallop(input.yallopClass);

  return {
    moonAgeHours: input.moonAgeHours,

    illumination: input.illumination,

    altitude: input.altitude,

    elongation: input.elongation,

    lagMinutes: input.lagMinutes,

    visibility,
    confidence,

    yallopClass: input.yallopClass,

    yallopQ: input.yallopQ,

    conjunction: input.conjunction ?? null,

    sunset: input.sunset ?? null,

    moonset: input.moonset ?? null,

    bestTime: input.bestTime ?? null,

    arcv: input.arcv,

    arcl: input.arcl,

    daz: input.daz,

    crescentWidthArcMin: input.crescentWidthArcMin,
  };
}

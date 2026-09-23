export type YallopClass = "A" | "B" | "C" | "D" | "E";

export interface YallopResult {
  qValue: number;

  classification: YallopClass;

  visible: boolean;
}

/*
 * Simplified Yallop-style
 * crescent visibility model
 *
 * Inputs:
 *
 * elongation:
 * angular separation Sun-Moon
 *
 * altitude:
 * Moon altitude at sunset
 *
 * illumination:
 * illuminated percentage
 */

export function calculateYallop(
  elongation: number,

  altitude: number,

  illumination: number,
): YallopResult {
  /*
   * Approximation of
   * best visibility parameter
   */

  const qValue = elongation - 10 + (altitude - 5) + illumination * 2;

  let classification: YallopClass;

  if (qValue >= 20) {
    classification = "A";
  } else if (qValue >= 10) {
    classification = "B";
  } else if (qValue >= 5) {
    classification = "C";
  } else if (qValue >= 0) {
    classification = "D";
  } else {
    classification = "E";
  }

  return {
    qValue,

    classification,

    visible: classification === "A" || classification === "B",
  };
}

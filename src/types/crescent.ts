export type VisibilityLevel = "NOT_VISIBLE" | "POSSIBLE" | "VISIBLE";

export type VisibilityConfidence = "CERTAIN" | "LIKELY" | "UNCERTAIN";

export type YallopClass = "A" | "B" | "C" | "D" | "E" | "F";

export interface CrescentData {
  /*
   * Basic lunar data
   */
  moonAgeHours: number;
  illumination: number;

  /*
   * Moon geometry
   */
  altitude: number;
  elongation: number;
  lagMinutes: number;

  /*
   * Existing Falak visibility result
   */
  visibility: VisibilityLevel;
  confidence: VisibilityConfidence;

  /*
   * Yallop result
   */
  yallopClass?: YallopClass;
  yallopQ?: number;

  /*
   * Observation times
   */
  conjunction?: Date | null;
  sunset?: Date | null;
  moonset?: Date | null;
  bestTime?: Date | null;

  /*
   * Yallop geometry
   */
  arcv?: number;
  arcl?: number;
  daz?: number;

  crescentWidthArcMin?: number;
}

export type VisibilityLevel = "NOT_VISIBLE" | "POSSIBLE" | "VISIBLE";

export type VisibilityConfidence = "CERTAIN" | "LIKELY" | "UNCERTAIN";
export interface CrescentData {
  moonAgeHours: number;

  illumination: number;

  altitude: number;

  elongation: number;

  lagMinutes: number;

  visibility: VisibilityLevel;

  confidence: VisibilityConfidence;

  yallopClass?: string;

  yallopQ?: number;
}

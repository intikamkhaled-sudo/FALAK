export type MoonPhaseName =
  | "NEW_MOON"
  | "WAXING_CRESCENT"
  | "FIRST_QUARTER"
  | "WAXING_GIBBOUS"
  | "FULL_MOON"
  | "WANING_GIBBOUS"
  | "LAST_QUARTER"
  | "WANING_CRESCENT";

export type MoonAgeState = "BEFORE_NEW_MOON" | "AFTER_NEW_MOON";

export interface MoonData {
  phaseAngle: number;

  illumination: number;

  phase: MoonPhaseName;

  /**
   * Moon age in hours
   * since last astronomical New Moon.
   */
  age: number;

  /**
   * Indicates whether date
   * is before or after New Moon.
   */
  ageState: MoonAgeState;

  /**
   * Optional distance placeholder.
   */
  distance?: number | null;

  /**
   * Next astronomical New Moon.
   */
  nextNewMoon: Date | null;
}

export type HighLatitudeRule =
  | "NONE"
  | "MIDDLE_OF_NIGHT"
  | "ONE_SEVENTH"
  | "ANGLE_BASED";

export type HighLatitudeTrigger = "ANGLE_FAILURE" | "SHORT_NIGHT";

export interface HighLatitudeConfig {
  rule: HighLatitudeRule;

  trigger: HighLatitudeTrigger;

  minimumNightMinutes: number;
}

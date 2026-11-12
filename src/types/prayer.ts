import type { HighLatitudeConfig } from "./highLatitude";

export type AsrMadhab = "SHAFI" | "HANAFI";

export type PrayerTimeRule =
  | {
      type: "ANGLE";
      value: number;
    }
  | {
      type: "MINUTES";
      value: number;
    };

export interface PrayerMethod {
  /**
   * Display name
   */
  name: string;

  /**
   * Fajr calculation rule
   *
   * Example:
   * 19.5 degrees
   */
  fajr: PrayerTimeRule;

  /**
   * Isha calculation rule
   *
   * Can be:
   * - angle
   * - fixed minutes after Maghrib
   */
  isha: PrayerTimeRule;

  /**
   * Asr calculation:
   *
   * SHAFI  = shadow factor 1
   * HANAFI = shadow factor 2
   */
  asrMadhab: AsrMadhab;

  /**
   * High latitude handling
   */
  highLatitude: HighLatitudeConfig;

  /**
   * Imsak configuration
   */
  imsak: ImsakConfig;
}

export type PrayerMethodKey =
  | "EGYPTIAN"
  | "MUSLIM_WORLD_LEAGUE"
  | "ISNA"
  | "UMM_AL_QURA"
  | "CUSTOM";

export interface PrayerTimes {
  fajr: Date | null;

  sunrise: Date | null;

  dhuhr: Date | null;

  asr: Date | null;

  maghrib: Date | null;

  isha: Date | null;
}
export interface ImsakConfig {
  enabled: boolean;
  minutesBeforeFajr: number;
}

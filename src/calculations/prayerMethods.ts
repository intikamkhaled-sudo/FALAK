import type { PrayerMethod, PrayerMethodKey } from "../types/prayer";

export const PRAYER_METHODS: Record<PrayerMethodKey, PrayerMethod> = {
  EGYPTIAN: {
    name: "Egyptian General Authority of Survey",

    fajr: {
      type: "ANGLE",
      value: 19.5,
    },

    isha: {
      type: "ANGLE",
      value: 17.5,
    },

    asrMadhab: "SHAFI",

    highLatitude: {
      rule: "NONE",

      trigger: "ANGLE_FAILURE",

      minimumNightMinutes: 90,
    },
    imsak: {
      enabled: true,
      minutesBeforeFajr: 10,
    },
  },

  MUSLIM_WORLD_LEAGUE: {
    name: "Muslim World League",

    fajr: {
      type: "ANGLE",
      value: 18,
    },

    isha: {
      type: "ANGLE",
      value: 18,
    },

    asrMadhab: "SHAFI",

    highLatitude: {
      rule: "NONE",

      trigger: "ANGLE_FAILURE",

      minimumNightMinutes: 90,
    },
    imsak: {
      enabled: true,
      minutesBeforeFajr: 10,
    },
  },

  ISNA: {
    name: "Islamic Society of North America",

    fajr: {
      type: "ANGLE",
      value: 15,
    },

    isha: {
      type: "ANGLE",
      value: 15,
    },

    asrMadhab: "SHAFI",

    highLatitude: {
      rule: "NONE",
      trigger: "ANGLE_FAILURE",
      minimumNightMinutes: 90,
    },
    imsak: {
      enabled: true,
      minutesBeforeFajr: 10,
    },
  },

  UMM_AL_QURA: {
    name: "Umm al-Qura",

    fajr: {
      type: "ANGLE",
      value: 18.5,
    },

    isha: {
      type: "MINUTES",
      value: 90,
    },

    asrMadhab: "SHAFI",
    highLatitude: {
      rule: "NONE",
      trigger: "ANGLE_FAILURE",
      minimumNightMinutes: 90,
    },
    imsak: {
      enabled: true,
      minutesBeforeFajr: 10,
    },
  },

  CUSTOM: {
    name: "Custom",

    fajr: {
      type: "ANGLE",
      value: 18,
    },

    isha: {
      type: "ANGLE",
      value: 18,
    },

    asrMadhab: "SHAFI",
    highLatitude: {
      rule: "NONE",
      trigger: "ANGLE_FAILURE",
      minimumNightMinutes: 90,
    },
    imsak: {
      enabled: true,
      minutesBeforeFajr: 10,
    },
  },
};

export function getPrayerMethod(key: PrayerMethodKey): PrayerMethod {
  return PRAYER_METHODS[key];
}

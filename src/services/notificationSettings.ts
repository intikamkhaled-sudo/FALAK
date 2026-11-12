import type { PrayerNotificationKey } from "./prayerNotifications";

export interface NotificationSettings {
  enabled: boolean;

  prayers: Record<PrayerNotificationKey, boolean>;

  beforeMinutes: 0 | 5 | 10 | 15 | 30;

  hijriDayNotification: boolean;
}

const STORAGE_KEY = "falak-notification-settings";

export const defaultNotificationSettings: NotificationSettings = {
  enabled: true,

  prayers: {
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },

  beforeMinutes: 0,

  hijriDayNotification: true,
};

export function loadNotificationSettings(): NotificationSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return defaultNotificationSettings;
    }

    const parsed = JSON.parse(stored) as Partial<NotificationSettings>;

    return {
      ...defaultNotificationSettings,
      ...parsed,

      prayers: {
        ...defaultNotificationSettings.prayers,
        ...(parsed.prayers ?? {}),
      },
    };
  } catch {
    return defaultNotificationSettings;
  }
}

export function saveNotificationSettings(settings: NotificationSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

  window.dispatchEvent(new Event("falak-notification-settings-change"));
}

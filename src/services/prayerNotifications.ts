export type PrayerNotificationKey =
  | "fajr"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha";

export interface PrayerNotificationTimes {
  fajr: Date | null;
  dhuhr: Date | null;
  asr: Date | null;
  maghrib: Date | null;
  isha: Date | null;
}

const prayerNamesAr: Record<PrayerNotificationKey, string> = {
  fajr: "الفجر",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

const prayerNamesEn: Record<PrayerNotificationKey, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

const scheduledTimers = new Map<PrayerNotificationKey, number>();

export function clearPrayerNotifications() {
  for (const timer of scheduledTimers.values()) {
    window.clearTimeout(timer);
  }

  scheduledTimers.clear();
}

function showPrayerNotification(
  prayer: PrayerNotificationKey,
  language: string,
) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const prayerName =
    language === "ar" ? prayerNamesAr[prayer] : prayerNamesEn[prayer];

  const title =
    language === "ar"
      ? `حان الآن وقت صلاة ${prayerName} 🕌`
      : `It's time for ${prayerName} prayer 🕌`;

  const body =
    language === "ar"
      ? "تقبل الله طاعتكم 🌙"
      : "May your prayer be accepted 🌙";

  try {
    new Notification(title, {
      body,
      tag: `falak-prayer-${prayer}`,
    });
  } catch (error) {
    console.error("Unable to show prayer notification:", error);
  }
}

export function schedulePrayerNotifications(
  prayers: PrayerNotificationTimes,
  language: string,
) {
  clearPrayerNotifications();

  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const now = Date.now();

  const prayerEntries: Array<[PrayerNotificationKey, Date | null]> = [
    ["fajr", prayers.fajr],
    ["dhuhr", prayers.dhuhr],
    ["asr", prayers.asr],
    ["maghrib", prayers.maghrib],
    ["isha", prayers.isha],
  ];

  for (const [prayer, time] of prayerEntries) {
    if (!(time instanceof Date) || Number.isNaN(time.getTime())) {
      continue;
    }

    const delay = time.getTime() - now;

    /*
     * Skip prayers that have already passed.
     */
    if (delay <= 0) {
      continue;
    }

    /*
     * setTimeout has a practical maximum
     * around 2^31 - 1 milliseconds.
     *
     * Today's prayer times are safely
     * inside that range.
     */
    const timer = window.setTimeout(() => {
      showPrayerNotification(prayer, language);

      scheduledTimers.delete(prayer);
    }, delay);

    scheduledTimers.set(prayer, timer);
  }
}
export function testPrayerNotification(language: string) {
  if (!("Notification" in window)) {
    console.warn("Notifications are not supported.");
    return;
  }

  if (Notification.permission !== "granted") {
    console.warn("Notification permission is not granted.");
    return;
  }

  console.log("🔔 Falak test notification scheduled in 10 seconds.");

  window.setTimeout(() => {
    const title =
      language === "ar"
        ? "اختبار إشعارات فلك 🔔"
        : "Falak Notification Test 🔔";

    const body =
      language === "ar"
        ? "الإشعارات تعمل بنجاح 🌙"
        : "Notifications are working successfully 🌙";

    new Notification(title, {
      body,
      tag: "falak-notification-test",
    });
  }, 10_000);
}

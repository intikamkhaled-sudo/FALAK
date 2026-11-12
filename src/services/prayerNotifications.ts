import { loadNotificationSettings } from "./notificationSettings";

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

/*
 * Active Falak notification timers.
 *
 * Possible timers:
 * - notification before prayer
 * - notification at prayer time
 * - new Hijri day notification
 */
const scheduledTimers = new Map<string, number>();

export function clearPrayerNotifications() {
  for (const timer of scheduledTimers.values()) {
    window.clearTimeout(timer);
  }

  scheduledTimers.clear();
}

/*
 * Display a Falak notification.
 *
 * Production:
 * Prefer Falak's registered Service Worker.
 *
 * Development:
 * Fall back to the Notification API when
 * the PWA Service Worker is not registered.
 */
async function showFalakNotification(title: string, body: string, tag: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();

      if (registration) {
        await registration.showNotification(title, {
          body,
          icon: "/falak-192.png",
          badge: "/falak-192.png",
          tag,
        });

        return;
      }
    }

    /*
     * Development fallback.
     *
     * vite-plugin-pwa is currently disabled
     * in npm run dev, so there may be no
     * Service Worker registration.
     */
    new Notification(title, {
      body,
      icon: "/falak-192.png",
      tag,
    });
  } catch (error) {
    console.error("Unable to show Falak notification:", error);
  }
}

/*
 * Notification exactly at prayer time.
 */
async function showPrayerNotification(
  prayer: PrayerNotificationKey,
  language: string,
) {
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

  await showFalakNotification(title, body, `falak-prayer-${prayer}`);
}

/*
 * Notification before prayer.
 */
async function showBeforePrayerNotification(
  prayer: PrayerNotificationKey,
  minutes: number,
  language: string,
) {
  const prayerName =
    language === "ar" ? prayerNamesAr[prayer] : prayerNamesEn[prayer];

  const title =
    language === "ar"
      ? `اقترب موعد صلاة ${prayerName} 🕌`
      : `${prayerName} prayer is approaching 🕌`;

  const body =
    language === "ar"
      ? `متبقي ${minutes} ${
          minutes === 15 || minutes === 30 ? "دقيقة" : "دقائق"
        } على الصلاة.`
      : `${minutes} minutes until prayer time.`;

  await showFalakNotification(title, body, `falak-before-${prayer}`);
}

/*
 * Falak Hijri day changes at local sunset.
 */
async function showHijriDayNotification(language: string) {
  const title =
    language === "ar" ? "بدأ يوم هجري جديد 🌙" : "A new Hijri day has begun 🌙";

  const body =
    language === "ar"
      ? "مع غروب الشمس يبدأ اليوم الهجري الجديد في فلك."
      : "With sunset, a new Hijri day begins in Falak.";

  await showFalakNotification(title, body, "falak-new-hijri-day");
}

/*
 * Schedule one future notification.
 */
function scheduleTimer(key: string, targetTime: number, callback: () => void) {
  const delay = targetTime - Date.now();

  /*
   * Never send notifications for an event
   * that has already passed.
   */
  if (delay <= 0) {
    return;
  }

  const timer = window.setTimeout(() => {
    callback();

    scheduledTimers.delete(key);
  }, delay);

  scheduledTimers.set(key, timer);
}

/*
 * Schedule Falak notifications for
 * today's remaining prayers.
 */
export function schedulePrayerNotifications(
  prayers: PrayerNotificationTimes,
  language: string,
) {
  /*
   * Remove timers created using previous
   * location/settings/prayer calculations.
   */
  clearPrayerNotifications();

  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const settings = loadNotificationSettings();

  /*
   * Falak master switch.
   */
  if (!settings.enabled) {
    return;
  }

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

    /*
     * Respect individual prayer settings.
     */
    if (!settings.prayers[prayer]) {
      continue;
    }

    const prayerTime = time.getTime();

    /*
     * Optional early reminder.
     */
    if (settings.beforeMinutes > 0) {
      const beforeTime = prayerTime - settings.beforeMinutes * 60 * 1000;

      scheduleTimer(`before-${prayer}`, beforeTime, () => {
        void showBeforePrayerNotification(
          prayer,
          settings.beforeMinutes,
          language,
        );
      });
    }

    /*
     * Prayer-time notification.
     */
    scheduleTimer(`prayer-${prayer}`, prayerTime, () => {
      void showPrayerNotification(prayer, language);
    });
  }

  /*
   * New Hijri day notification.
   *
   * Independent from the Maghrib prayer
   * notification switch.
   */
  if (
    settings.hijriDayNotification &&
    prayers.maghrib instanceof Date &&
    !Number.isNaN(prayers.maghrib.getTime())
  ) {
    scheduleTimer("hijri-day", prayers.maghrib.getTime(), () => {
      void showHijriDayNotification(language);
    });
  }
}

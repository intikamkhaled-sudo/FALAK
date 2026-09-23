import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

interface PrayerTimes {
  fajr: Date | null;
  dhuhr: Date | null;
  asr: Date | null;
  maghrib: Date | null;
  isha: Date | null;
}

interface Props {
  prayers: PrayerTimes;
}

interface PrayerItem {
  name: string;
  time: Date;
}

export default function NextPrayer({ prayers }: Props) {
  const { t } = useLanguage();

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const nextPrayer = useMemo(() => {
    const list: PrayerItem[] = [
      { name: "fajr", time: prayers.fajr },
      { name: "dhuhr", time: prayers.dhuhr },
      { name: "asr", time: prayers.asr },
      { name: "maghrib", time: prayers.maghrib },
      { name: "isha", time: prayers.isha },
    ].filter(
      (item): item is PrayerItem =>
        item.time instanceof Date && !Number.isNaN(item.time.getTime()),
    );

    const upcoming = list.find(
      (prayer) => prayer.time.getTime() > now.getTime(),
    );

    if (upcoming) {
      return upcoming;
    }

    /*
     * All today's prayers have passed.
     * Use tomorrow's Fajr instead of returning
     * today's Fajr and creating a negative countdown.
     */
    if (prayers.fajr instanceof Date && !Number.isNaN(prayers.fajr.getTime())) {
      const tomorrowFajr = new Date(prayers.fajr);

      tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);

      return {
        name: "fajr",
        time: tomorrowFajr,
      };
    }

    return null;
  }, [prayers, now]);

  function translatePrayer(name: string) {
    switch (name) {
      case "fajr":
        return t("fajr");

      case "dhuhr":
        return t("dhuhr");

      case "asr":
        return t("asr");

      case "maghrib":
        return t("maghrib");

      case "isha":
        return t("isha");

      default:
        return name;
    }
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  function getCountdown(target: Date) {
    const difference = Math.max(0, target.getTime() - now.getTime());

    const totalSeconds = Math.floor(difference / 1000);

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const seconds = totalSeconds % 60;

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":");
  }

  function getProgress(target: Date) {
    const prayerTimes = [
      prayers.fajr,
      prayers.dhuhr,
      prayers.asr,
      prayers.maghrib,
      prayers.isha,
    ].filter(
      (time): time is Date =>
        time instanceof Date && !Number.isNaN(time.getTime()),
    );

    if (prayerTimes.length === 0) {
      return 0;
    }

    const targetTime = target.getTime();

    let previousTime: number;

    const targetIndex = prayerTimes.findIndex(
      (time) => time.getTime() === targetTime,
    );

    if (targetIndex > 0) {
      previousTime = prayerTimes[targetIndex - 1].getTime();
    } else {
      /*
       * Fajr is next.
       * Use an approximate previous-day Isha point
       * for visual progress only.
       */
      previousTime = targetTime - 8 * 60 * 60 * 1000;
    }

    const duration = targetTime - previousTime;

    if (duration <= 0) {
      return 0;
    }

    const elapsed = now.getTime() - previousTime;

    return Math.min(100, Math.max(0, (elapsed / duration) * 100));
  }

  if (!nextPrayer) {
    return null;
  }

  return (
    <div className="next-prayer-card">
      <h2>⏰ {t("nextPrayer")}</h2>

      <div className="next-name">🕌 {translatePrayer(nextPrayer.name)}</div>

      <div className="next-time">{formatTime(nextPrayer.time)}</div>

      <div className="progress">
        <div
          className="progress-fill"
          style={{
            width: `${getProgress(nextPrayer.time)}%`,
          }}
        />
      </div>

      <div className="countdown">{getCountdown(nextPrayer.time)}</div>

      <div className="remaining-label">{t("remainingTime")}</div>
    </div>
  );
}

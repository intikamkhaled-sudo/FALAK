import { useEffect, useState } from "react";

import {
  loadNotificationSettings,
  saveNotificationSettings,
  type NotificationSettings as Settings,
} from "../services/notificationSettings";

import type { PrayerNotificationKey } from "../services/prayerNotifications";

import { useLanguage } from "../context/LanguageContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

const prayers: PrayerNotificationKey[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

export default function NotificationSettings({ open, onClose }: Props) {
  const { language, t } = useLanguage();

  const [settings, setSettings] = useState<Settings>(() =>
    loadNotificationSettings(),
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setSettings(loadNotificationSettings());
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    const oldOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);

      document.body.style.overflow = oldOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function update(next: Settings) {
    setSettings(next);
    saveNotificationSettings(next);
  }

  function togglePrayer(prayer: PrayerNotificationKey) {
    update({
      ...settings,

      prayers: {
        ...settings.prayers,

        [prayer]: !settings.prayers[prayer],
      },
    });
  }

  return (
    <div
      className="notification-settings-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="notification-settings-modal"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="notification-settings-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="notification-settings-icon">🔔</div>

        <h2>{language === "ar" ? "تنبيهات فلك" : "Falak Notifications"}</h2>

        <p className="notification-settings-description">
          {language === "ar"
            ? "اختر التنبيهات التي تريد استقبالها."
            : "Choose the notifications you want to receive."}
        </p>

        <div className="notification-setting-master">
          <div>
            <strong>{language === "ar" ? "الإشعارات" : "Notifications"}</strong>

            <span>
              {settings.enabled
                ? language === "ar"
                  ? "مفعلة"
                  : "Enabled"
                : language === "ar"
                  ? "متوقفة"
                  : "Disabled"}
            </span>
          </div>

          <button
            type="button"
            className={`falak-switch ${
              settings.enabled ? "falak-switch-active" : ""
            }`}
            onClick={() =>
              update({
                ...settings,
                enabled: !settings.enabled,
              })
            }
          >
            <span />
          </button>
        </div>

        <div
          className={`notification-settings-content ${
            !settings.enabled ? "notification-settings-disabled" : ""
          }`}
        >
          <h3>
            🕌 {language === "ar" ? "تنبيهات الصلاة" : "Prayer Notifications"}
          </h3>

          <div className="notification-prayer-list">
            {prayers.map((prayer) => (
              <div className="notification-prayer-row" key={prayer}>
                <span>{t(prayer)}</span>

                <button
                  type="button"
                  className={`falak-switch ${
                    settings.prayers[prayer] ? "falak-switch-active" : ""
                  }`}
                  onClick={() => togglePrayer(prayer)}
                >
                  <span />
                </button>
              </div>
            ))}
          </div>

          <div className="notification-before">
            <label htmlFor="notification-before-select">
              ⏰{" "}
              {language === "ar"
                ? "التنبيه قبل الصلاة"
                : "Notify before prayer"}
            </label>

            <select
              id="notification-before-select"
              value={settings.beforeMinutes}
              onChange={(event) =>
                update({
                  ...settings,

                  beforeMinutes: Number(
                    event.target.value,
                  ) as Settings["beforeMinutes"],
                })
              }
            >
              <option value={0}>{language === "ar" ? "إيقاف" : "Off"}</option>

              <option value={5}>
                5 {language === "ar" ? "دقائق" : "minutes"}
              </option>

              <option value={10}>
                10 {language === "ar" ? "دقائق" : "minutes"}
              </option>

              <option value={15}>
                15 {language === "ar" ? "دقيقة" : "minutes"}
              </option>

              <option value={30}>
                30 {language === "ar" ? "دقيقة" : "minutes"}
              </option>
            </select>
          </div>

          <div className="notification-hijri-row">
            <div>
              <strong>
                🌙 {language === "ar" ? "اليوم الهجري الجديد" : "New Hijri Day"}
              </strong>

              <span>
                {language === "ar"
                  ? "تنبيه عند دخول المغرب"
                  : "Notify at local sunset"}
              </span>
            </div>

            <button
              type="button"
              className={`falak-switch ${
                settings.hijriDayNotification ? "falak-switch-active" : ""
              }`}
              onClick={() =>
                update({
                  ...settings,

                  hijriDayNotification: !settings.hijriDayNotification,
                })
              }
            >
              <span />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

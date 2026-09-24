import { useEffect, useState } from "react";
import { testPrayerNotification } from "../services/prayerNotifications";
import { useLanguage } from "../context/LanguageContext";

type NotificationState = "unsupported" | "default" | "granted" | "denied";

export default function NotificationButton() {
  const { language } = useLanguage();

  const [status, setStatus] = useState<NotificationState>("default");

  useEffect(() => {
    if (!("Notification" in window)) {
      setStatus("unsupported");
      return;
    }

    setStatus(Notification.permission);
  }, []);

  async function handleClick() {
    if (!("Notification" in window)) {
      return;
    }

    if (Notification.permission === "granted") {
      testPrayerNotification(language);
      return;
    }

    if (Notification.permission === "denied") {
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      setStatus(permission);
      window.dispatchEvent(new Event("falak-notification-permission"));
      if (permission === "granted") {
        testPrayerNotification(language);
      }
    } catch (error) {
      console.error("Unable to request notification permission:", error);
    }
  }

  const enabled = status === "granted";

  function getTitle() {
    if (status === "unsupported") {
      return language === "ar"
        ? "الإشعارات غير مدعومة على هذا المتصفح"
        : "Notifications are not supported by this browser";
    }

    if (status === "denied") {
      return language === "ar"
        ? "تم رفض إذن الإشعارات من المتصفح"
        : "Notification permission was denied";
    }

    if (enabled) {
      return language === "ar"
        ? "إشعارات فلك مفعلة"
        : "Falak notifications enabled";
    }

    return language === "ar"
      ? "تفعيل إشعارات الصلاة"
      : "Enable prayer notifications";
  }

  return (
    <button
      type="button"
      className={`notification-button ${
        enabled ? "notification-button-active" : ""
      }`}
      onClick={handleClick}
      disabled={status === "unsupported" || status === "denied"}
      title={getTitle()}
      aria-label={getTitle()}
    >
      <span className="notification-bell-icon" aria-hidden="true">
        {enabled ? "🔔" : "🔕"}
      </span>

      {enabled && <span className="notification-status-dot" />}
    </button>
  );
}

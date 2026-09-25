import { useEffect, useState } from "react";

import { useLanguage } from "../context/LanguageContext";
import { syncPushSubscription } from "../services/pushSubscription";
import NotificationSettings from "./NotificationSettings";

type NotificationState = "unsupported" | "default" | "granted" | "denied";

export default function NotificationButton() {
  const { language } = useLanguage();

  const [status, setStatus] = useState<NotificationState>("default");

  const [settingsOpen, setSettingsOpen] = useState(false);

  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setStatus("unsupported");
      return;
    }

    setStatus(Notification.permission);
  }, []);

  async function registerWebPush() {
    try {
      setIsSubscribing(true);

      await syncPushSubscription(language);

      console.log("Falak Web Push subscription synced.");

      window.dispatchEvent(new Event("falak-notification-permission"));
    } catch (error) {
      console.error("Unable to register Falak Web Push:", error);
    } finally {
      setIsSubscribing(false);
    }
  }

  async function handleClick() {
    if (
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      return;
    }

    if (Notification.permission === "granted") {
      /*
       * Important:
       * Existing Falak users may already have notification
       * permission from before Web Push was added.
       *
       * Therefore we still sync/create their PushSubscription.
       */
      await registerWebPush();

      setSettingsOpen(true);
      return;
    }

    if (Notification.permission === "denied") {
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      setStatus(permission);

      if (permission !== "granted") {
        return;
      }

      await registerWebPush();

      setSettingsOpen(true);
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

    if (isSubscribing) {
      return language === "ar"
        ? "جارٍ تفعيل إشعارات فلك"
        : "Enabling Falak notifications";
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
    <>
      <button
        type="button"
        className={`notification-button ${
          enabled ? "notification-button-active" : ""
        }`}
        onClick={handleClick}
        disabled={
          status === "unsupported" || status === "denied" || isSubscribing
        }
        title={getTitle()}
        aria-label={getTitle()}
      >
        <span className="notification-bell-icon" aria-hidden="true">
          {enabled ? "🔔" : "🔕"}
        </span>

        {enabled && <span className="notification-status-dot" />}
      </button>

      <NotificationSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}

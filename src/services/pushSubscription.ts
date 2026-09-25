import { loadNotificationSettings } from "./notificationSettings";

interface PushLocation {
  latitude: number;
  longitude: number;
  elevation?: number;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);

  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function isWebPushSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function syncPushSubscription(
  language: "ar" | "en",
  location?: PushLocation,
): Promise<PushSubscription> {
  if (!isWebPushSupported()) {
    throw new Error("Web Push is not supported by this browser.");
  }

  if (Notification.permission !== "granted") {
    throw new Error("Notification permission has not been granted.");
  }

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

  if (!vapidPublicKey) {
    throw new Error("VITE_VAPID_PUBLIC_KEY is not configured.");
  }

  const registration = await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }

  const settings = loadNotificationSettings();

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const response = await fetch("/api/push/subscribe", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      subscription: subscription.toJSON(),

      language,

      location: location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            elevation: location.elevation ?? 0,
          }
        : undefined,

      timezone,

      settings,
    }),
  });

  if (!response.ok) {
    let message = `Push subscription failed (${response.status})`;

    try {
      const data = await response.json();

      if (typeof data?.error === "string") {
        message = data.error;
      }
    } catch {
      // Keep the fallback error message.
    }

    throw new Error(message);
  }

  return subscription;
}

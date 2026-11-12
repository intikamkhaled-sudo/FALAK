/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{
    url: string;
    revision?: string | null;
  }>;
};

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

interface FalakPushPayload {
  title?: string;
  body?: string;
  tag?: string;
  url?: string;
}

self.addEventListener("push", (event: PushEvent) => {
  let payload: FalakPushPayload = {
    title: "Falak",
    body: "You have a new notification.",
    tag: "falak-notification",
    url: "/",
  };

  if (event.data) {
    try {
      payload = {
        ...payload,
        ...(event.data.json() as FalakPushPayload),
      };
    } catch {
      payload.body = event.data.text();
    }
  }

  const title = payload.title ?? "Falak";

  const options: NotificationOptions = {
    body: payload.body ?? "",
    icon: "/falak-192.png",
    badge: "/falak-192.png",
    tag: payload.tag ?? "falak-notification",

    data: {
      url: payload.url ?? "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  const notificationUrl =
    typeof event.notification.data?.url === "string"
      ? event.notification.data.url
      : "/";

  const targetUrl = new URL(notificationUrl, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(async (clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            const windowClient = client as WindowClient;

            if ("navigate" in windowClient) {
              await windowClient.navigate(targetUrl);
            }

            return windowClient.focus();
          }
        }

        return self.clients.openWindow(targetUrl);
      }),
  );
});

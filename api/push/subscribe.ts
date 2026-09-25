import { neon } from "@neondatabase/serverless";
import type { VercelRequest, VercelResponse } from "@vercel/node";

interface SubscribeBody {
  subscription?: {
    endpoint?: string;
    keys?: {
      p256dh?: string;
      auth?: string;
    };
  };

  language?: string;

  location?: {
    latitude?: number;
    longitude?: number;
    elevation?: number;
  };

  timezone?: string;

  settings?: {
    enabled?: boolean;

    prayers?: {
      fajr?: boolean;
      dhuhr?: boolean;
      asr?: boolean;
      maghrib?: boolean;
      isha?: boolean;
    };

    beforeMinutes?: number;
    hijriDayNotification?: boolean;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      console.error("DATABASE_URL is not configured.");

      return res.status(500).json({
        ok: false,
        error: "Database is not configured",
      });
    }

    const body = req.body as SubscribeBody;

    const endpoint = body.subscription?.endpoint;
    const p256dh = body.subscription?.keys?.p256dh;
    const auth = body.subscription?.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return res.status(400).json({
        ok: false,
        error: "Invalid push subscription",
      });
    }

    const sql = neon(databaseUrl);

    const language = body.language === "ar" ? "ar" : "en";

    const latitude =
      typeof body.location?.latitude === "number"
        ? body.location.latitude
        : null;

    const longitude =
      typeof body.location?.longitude === "number"
        ? body.location.longitude
        : null;

    const elevation =
      typeof body.location?.elevation === "number"
        ? body.location.elevation
        : 0;

    const timezone =
      typeof body.timezone === "string" && body.timezone.length <= 100
        ? body.timezone
        : null;

    const notificationsEnabled = body.settings?.enabled ?? true;

    const fajrEnabled = body.settings?.prayers?.fajr ?? true;

    const dhuhrEnabled = body.settings?.prayers?.dhuhr ?? true;

    const asrEnabled = body.settings?.prayers?.asr ?? true;

    const maghribEnabled = body.settings?.prayers?.maghrib ?? true;

    const ishaEnabled = body.settings?.prayers?.isha ?? true;

    const requestedBeforeMinutes = body.settings?.beforeMinutes ?? 0;

    const allowedBeforeMinutes = [0, 5, 10, 15, 30];

    const beforeMinutes = allowedBeforeMinutes.includes(requestedBeforeMinutes)
      ? requestedBeforeMinutes
      : 0;

    const hijriDayEnabled = body.settings?.hijriDayNotification ?? true;

    await sql`
      INSERT INTO push_subscriptions (
        endpoint,
        p256dh,
        auth,
        language,
        latitude,
        longitude,
        elevation,
        timezone,
        notifications_enabled,
        fajr_enabled,
        dhuhr_enabled,
        asr_enabled,
        maghrib_enabled,
        isha_enabled,
        before_minutes,
        hijri_day_enabled,
        updated_at
      )
      VALUES (
        ${endpoint},
        ${p256dh},
        ${auth},
        ${language},
        ${latitude},
        ${longitude},
        ${elevation},
        ${timezone},
        ${notificationsEnabled},
        ${fajrEnabled},
        ${dhuhrEnabled},
        ${asrEnabled},
        ${maghribEnabled},
        ${ishaEnabled},
        ${beforeMinutes},
        ${hijriDayEnabled},
        NOW()
      )
      ON CONFLICT (endpoint)
      DO UPDATE SET
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        language = EXCLUDED.language,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        elevation = EXCLUDED.elevation,
        timezone = EXCLUDED.timezone,
        notifications_enabled = EXCLUDED.notifications_enabled,
        fajr_enabled = EXCLUDED.fajr_enabled,
        dhuhr_enabled = EXCLUDED.dhuhr_enabled,
        asr_enabled = EXCLUDED.asr_enabled,
        maghrib_enabled = EXCLUDED.maghrib_enabled,
        isha_enabled = EXCLUDED.isha_enabled,
        before_minutes = EXCLUDED.before_minutes,
        hijri_day_enabled = EXCLUDED.hijri_day_enabled,
        updated_at = NOW()
    `;

    return res.status(200).json({
      ok: true,
    });
  } catch (error) {
    console.error("Push subscription error:", error);

    return res.status(500).json({
      ok: false,
      error: "Unable to save push subscription",
    });
  }
}

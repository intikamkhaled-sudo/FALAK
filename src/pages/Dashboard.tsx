import { useMemo, useState, useEffect } from "react";

import {
  schedulePrayerNotifications,
  clearPrayerNotifications,
} from "../services/prayerNotifications";

import { getFalakReport } from "../services/falakEngine";
import { cities } from "../data/cities";

import FalakLayout from "../components/FalakLayout";
import LocationSelector from "../components/LocationSelector";
import GeoLocationButton from "../components/GeoLocationButton";
import FalakHero from "../components/FalakHero";
import NextPrayer from "../components/NextPrayer";
import PrayerVerseCard from "../components/PrayerVerseCard";
import PrayerCard from "../components/PrayerCard";
import HijriCard from "../components/HijriCard";
import MoonCard from "../components/MoonCard";
import CrescentCard from "../components/CrescentCard";
import QiblaCard from "../components/QiblaCard";
import CrescentWeatherCard from "../components/CrescentWeatherCard";

import {
  fetchWeather,
  assessCrescentWeather,
  type WeatherData,
  type WeatherAssessment,
} from "../services/weather";

import type { PrayerVerseKey } from "../data/prayerVerses";

import { useLanguage } from "../context/LanguageContext";

interface DashboardCity {
  name: string;
  nameAr?: string;
  country: string;
  countryAr?: string;
  latitude: number;
  longitude: number;
  elevation?: number;
}

interface PrayerCandidate {
  name: PrayerVerseKey;
  time: Date;
}

type WeatherState =
  | {
      status: "idle";
      data: null;
      error: null;
    }
  | {
      status: "loading";
      data: null;
      error: null;
    }
  | {
      status: "success";
      data: {
        weather: WeatherData;
        assessment: WeatherAssessment;
      };
      error: null;
    }
  | {
      status: "error";
      data: null;
      error: string;
    };

export default function Dashboard() {
  const { t, language } = useLanguage();

  const [city, setCity] = useState<DashboardCity>(() => {
    const savedCity = localStorage.getItem("falak-city");

    if (savedCity) {
      try {
        return JSON.parse(savedCity);
      } catch {
        localStorage.removeItem("falak-city");
      }
    }

    return cities[0];
  });

  const [weatherState, setWeatherState] = useState<WeatherState>({
    status: "idle",
    data: null,
    error: null,
  });

  function changeCity(newCity: DashboardCity) {
    setCity(newCity);
    localStorage.setItem("falak-city", JSON.stringify(newCity));
  }

  const now = new Date();

  const report = getFalakReport({
    latitude: city.latitude,
    longitude: city.longitude,
    elevation: city.elevation ?? 0,
    date: now,
  });

  /*
   * Best crescent observation time.
   * Rounded to one-minute precision.
   */
  const bestTimeMs = report.crescent.bestTime
    ? Math.round(report.crescent.bestTime.getTime() / 60000) * 60000
    : null;

  /*
   * Weather integration.
   *
   * Fetch weather at the best observation time.
   * Assess weather independently from Yallop.
   */
  useEffect(() => {
    if (bestTimeMs === null) {
      setWeatherState({
        status: "idle",
        data: null,
        error: null,
      });
      return;
    }

    const controller = new AbortController();

    // Create Date only after confirming bestTimeMs is not null.
    const observationTime = new Date(bestTimeMs);

    setWeatherState({
      status: "loading",
      data: null,
      error: null,
    });

    async function loadWeather() {
      try {
        const result = await fetchWeather(
          {
            latitude: city.latitude,
            longitude: city.longitude,
            elevation: city.elevation ?? 0,
          },
          observationTime,
          controller.signal,
        );

        if (controller.signal.aborted) return;

        // Calculate weather suitability assessment.
        const assessment = assessCrescentWeather(result);

        if (controller.signal.aborted) return;

        setWeatherState({
          status: "success",
          data: {
            weather: result,
            assessment,
          },
          error: null,
        });
      } catch (error) {
        if (controller.signal.aborted) return;

        setWeatherState({
          status: "error",
          data: null,
          error:
            error instanceof Error ? error.message : "Weather request failed.",
        });
      }
    }

    loadWeather();

    return () => {
      controller.abort();
    };
  }, [city.latitude, city.longitude, city.elevation, bestTimeMs]);

  /*
   * Schedule Falak prayer notifications.
   *
   * The scheduler reads saved notification preferences.
   */
  useEffect(() => {
    schedulePrayerNotifications(report.prayers, language);

    return () => {
      clearPrayerNotifications();
    };
  }, [
    report.prayers.fajr,
    report.prayers.dhuhr,
    report.prayers.asr,
    report.prayers.maghrib,
    report.prayers.isha,
    language,
  ]);

  /*
   * Re-schedule notifications when:
   * - Permission is granted.
   * - Notification settings change.
   */
  useEffect(() => {
    function rescheduleNotifications() {
      schedulePrayerNotifications(report.prayers, language);
    }

    window.addEventListener(
      "falak-notification-permission",
      rescheduleNotifications,
    );

    window.addEventListener(
      "falak-notification-settings-change",
      rescheduleNotifications,
    );

    return () => {
      window.removeEventListener(
        "falak-notification-permission",
        rescheduleNotifications,
      );

      window.removeEventListener(
        "falak-notification-settings-change",
        rescheduleNotifications,
      );
    };
  }, [
    report.prayers.fajr,
    report.prayers.dhuhr,
    report.prayers.asr,
    report.prayers.maghrib,
    report.prayers.isha,
    language,
  ]);

  /*
   * Determine the next prayer for
   * the Qur'anic reflection card.
   */
  const nextPrayerName = useMemo<PrayerVerseKey>(() => {
    const prayers: PrayerCandidate[] = [
      {
        name: "fajr",
        time: report.prayers.fajr,
      },
      {
        name: "dhuhr",
        time: report.prayers.dhuhr,
      },
      {
        name: "asr",
        time: report.prayers.asr,
      },
      {
        name: "maghrib",
        time: report.prayers.maghrib,
      },
      {
        name: "isha",
        time: report.prayers.isha,
      },
    ].filter(
      (prayer): prayer is PrayerCandidate =>
        prayer.time instanceof Date && !Number.isNaN(prayer.time.getTime()),
    );

    const upcoming = prayers.find(
      (prayer) => prayer.time.getTime() > now.getTime(),
    );

    return upcoming?.name ?? "fajr";
  }, [
    report.prayers.fajr,
    report.prayers.dhuhr,
    report.prayers.asr,
    report.prayers.maghrib,
    report.prayers.isha,
    now,
  ]);

  return (
    <FalakLayout>
      <main className="dashboard-layout">
        {/* Hero */}
        <section className="top-section">
          <FalakHero city={city} hijri={report.hijri} moon={report.moon} />
        </section>

        {/* Location */}
        <section className="location-section">
          <LocationSelector currentCity={city} onChange={changeCity} />

          <GeoLocationButton
            onLocation={(location) => {
              const gpsCity: DashboardCity = {
                name: "Current Location",
                nameAr: "موقعي الحالي",
                country: "GPS",
                countryAr: "تحديد الموقع",
                ...location,
                elevation: location.elevation ?? 0,
              };

              changeCity(gpsCity);
            }}
          />
        </section>

        {/* Next Prayer */}
        <section className="next-section">
          <NextPrayer prayers={report.prayers} />
        </section>

        {/* Quranic Reflection */}
        <section className="verse-section">
          <PrayerVerseCard nextPrayer={nextPrayerName} />
        </section>

        {/* Prayer Times */}
        <h2 className="section-title">🕌 {t("prayerTimes")}</h2>

        <section className="prayers-grid">
          <PrayerCard name={t("fajr")} time={report.prayers.fajr} />

          <PrayerCard name={t("dhuhr")} time={report.prayers.dhuhr} />

          <PrayerCard name={t("asr")} time={report.prayers.asr} />

          <PrayerCard name={t("maghrib")} time={report.prayers.maghrib} />

          <PrayerCard name={t("isha")} time={report.prayers.isha} />
        </section>

        {/* Astronomical Information */}
        <section className="info-grid">
          <HijriCard hijri={report.hijri} />

          <MoonCard moon={report.moon} />

          <CrescentCard crescent={report.crescent} />

          {/* Weather Loading */}
          {weatherState.status === "loading" && (
            <div className="crescent-card">
              <h2>🌤️ Crescent Weather</h2>
              <p>Loading weather data...</p>
            </div>
          )}

          {/* Weather Success */}
          {weatherState.status === "success" && (
            <CrescentWeatherCard
              weather={weatherState.data.weather}
              assessment={weatherState.data.assessment}
            />
          )}

          {/* Weather Error */}
          {weatherState.status === "error" && (
            <div className="crescent-card">
              <h2>🌤️ Crescent Weather</h2>
              <p>Weather data unavailable.</p>
            </div>
          )}

          {/* Qibla */}
          <QiblaCard latitude={city.latitude} longitude={city.longitude} />
        </section>
      </main>
    </FalakLayout>
  );
}

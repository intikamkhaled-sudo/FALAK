import { useState } from "react";

import { getFalakReport } from "../services/falakEngine";
import { cities } from "../data/cities";

import FalakLayout from "../components/FalakLayout";
import LocationSelector from "../components/LocationSelector";
import GeoLocationButton from "../components/GeoLocationButton";
import FalakHero from "../components/FalakHero";
import NextPrayer from "../components/NextPrayer";
import PrayerCard from "../components/PrayerCard";
import HijriCard from "../components/HijriCard";
import MoonCard from "../components/MoonCard";
import CrescentCard from "../components/CrescentCard";
import QiblaCard from "../components/QiblaCard";

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

export default function Dashboard() {
  const { t } = useLanguage();

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

  return (
    <FalakLayout>
      <main className="dashboard-layout">
        <section className="top-section">
          <FalakHero city={city} hijri={report.hijri} moon={report.moon} />
        </section>

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

        <section className="next-section">
          <NextPrayer prayers={report.prayers} />
        </section>

        <h2 className="section-title">🕌 {t("prayerTimes")}</h2>

        <section className="prayers-grid">
          <PrayerCard name={t("fajr")} time={report.prayers.fajr} />

          <PrayerCard name={t("dhuhr")} time={report.prayers.dhuhr} />

          <PrayerCard name={t("asr")} time={report.prayers.asr} />

          <PrayerCard name={t("maghrib")} time={report.prayers.maghrib} />

          <PrayerCard name={t("isha")} time={report.prayers.isha} />
        </section>

        <section className="info-grid">
          <HijriCard hijri={report.hijri} />

          <MoonCard moon={report.moon} />

          <CrescentCard crescent={report.crescent} />

          <QiblaCard latitude={city.latitude} longitude={city.longitude} />
        </section>
      </main>
    </FalakLayout>
  );
}

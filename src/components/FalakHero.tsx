import type { MoonData } from "../types/moon";
import { useLanguage } from "../context/LanguageContext";

interface Props {
  city: {
    name: string;
    country: string;
    nameAr?: string;
    countryAr?: string;
  };

  hijri: {
    day: number;
    monthName: string;
    year: number;
  };

  moon: MoonData;
}

const hijriMonthsAr: Record<string, string> = {
  Muharram: "محرم",
  Safar: "صفر",
  "Rabi al-Awwal": "ربيع الأول",
  "Rabi al-Thani": "ربيع الآخر",
  "Jumada al-Awwal": "جمادى الأولى",
  "Jumada al-Thani": "جمادى الآخرة",
  Rajab: "رجب",
  Shaban: "شعبان",
  Ramadan: "رمضان",
  Shawwal: "شوال",
  "Dhu al-Qidah": "ذو القعدة",
  "Dhu al-Hijjah": "ذو الحجة",
};

export default function FalakHero({ city, hijri, moon }: Props) {
  const { language, t } = useLanguage();

  function getPhaseName(phase: string) {
    if (language === "en") {
      return phase
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    const phases: Record<string, string> = {
      NEW_MOON: "المحاق",
      WAXING_CRESCENT: "الهلال المتزايد",
      FIRST_QUARTER: "التربيع الأول",
      WAXING_GIBBOUS: "الأحدب المتزايد",
      FULL_MOON: "البدر",
      WANING_GIBBOUS: "الأحدب المتناقص",
      LAST_QUARTER: "التربيع الأخير",
      WANING_CRESCENT: "الهلال المتناقص",
    };

    return phases[phase] ?? phase;
  }

  const formattedDate = new Date().toLocaleDateString(
    language === "ar" ? "ar-EG" : "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const hijriMonth =
    language === "ar"
      ? (hijriMonthsAr[hijri.monthName] ?? hijri.monthName)
      : hijri.monthName;

  const hijriDay =
    language === "ar"
      ? hijri.day.toLocaleString("ar-EG")
      : hijri.day.toString();

  const hijriYear =
    language === "ar"
      ? hijri.year.toLocaleString("ar-EG", {
          useGrouping: false,
        })
      : hijri.year.toString();

  const cityName = language === "ar" && city.nameAr ? city.nameAr : city.name;

  const countryName =
    language === "ar" && city.countryAr ? city.countryAr : city.country;

  const illumination =
    language === "ar"
      ? moon.illumination.toLocaleString("ar-EG", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })
      : moon.illumination.toFixed(1);

  return (
    <section className="falak-hero">
      <h1>🌙 {t("appName")}</h1>

      <p className="subtitle">{t("subtitle")}</p>

      <div className="hero-location">
        📍 {cityName}, {countryName}
      </div>

      <div className="hero-date">{formattedDate}</div>

      <div className="hero-hijri">
        📅 {hijriDay} {hijriMonth} {hijriYear} {language === "ar" ? "هـ" : "AH"}
      </div>

      <div className="hero-moon">
        🌒 {getPhaseName(moon.phase)}
        <br />
        {language === "ar" ? (
          <>
            {illumination}٪ {t("illumination")}
          </>
        ) : (
          <>
            {illumination}% {t("illumination")}
          </>
        )}
      </div>
    </section>
  );
}

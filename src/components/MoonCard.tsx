import type { MoonData } from "../types/moon";
import { useLanguage } from "../context/LanguageContext";

interface Props {
  moon: MoonData;
}

export default function MoonCard({ moon }: Props) {
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

  return (
    <div className="moon-card">
      <h2>🌙 {t("moon")}</h2>

      <div className="moon-real" />

      <h3>{getPhaseName(moon.phase)}</h3>

      <div className="moon-row">
        <span>{t("illumination")}</span>

<<<<<<< HEAD
        <strong><span className="numeric-ltr">{moon.illumination.toFixed(1)}%</span></strong>
=======
        <strong>{moon.illumination.toFixed(1)}%</strong>
>>>>>>> origin/main
      </div>

      <div className="moon-row">
        <span>{t("age")}</span>

        <strong>
<<<<<<< HEAD
          <span className="numeric-ltr">{(moon.age / 24).toFixed(1)}</span> {t("days")}
=======
          {(moon.age / 24).toFixed(1)} {t("days")}
>>>>>>> origin/main
        </strong>
      </div>

      <div className="moon-row">
        <span>{t("phaseAngle")}</span>

<<<<<<< HEAD
        <strong><span className="numeric-ltr">{moon.phaseAngle.toFixed(1)}°</span></strong>
=======
        <strong>{moon.phaseAngle.toFixed(1)}°</strong>
>>>>>>> origin/main
      </div>

      {moon.nextNewMoon && (
        <div className="moon-row">
          <span>{t("nextNewMoon")}</span>

          <strong>
<<<<<<< HEAD
            <span className="numeric-inline">{moon.nextNewMoon.toLocaleDateString(
=======
            {moon.nextNewMoon.toLocaleDateString(
>>>>>>> origin/main
              language === "ar" ? "ar-EG" : "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              },
<<<<<<< HEAD
            )}</span>
=======
            )}
>>>>>>> origin/main
          </strong>
        </div>
      )}
    </div>
  );
}

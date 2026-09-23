import type { CrescentData } from "../types/crescent";
import { useLanguage } from "../context/LanguageContext";

interface Props {
  crescent: CrescentData;
}

export default function CrescentCard({ crescent }: Props) {
  const { t } = useLanguage();

  function getVisibility(value: string) {
    switch (value) {
      case "VISIBLE":
        return t("visible");

      case "POSSIBLE":
        return t("possible");

      case "NOT_VISIBLE":
        return t("notVisible");

      default:
        return value;
    }
  }

  function getConfidence(value: string) {
    switch (value) {
      case "CERTAIN":
        return t("certain");

      case "LIKELY":
        return t("likely");

      case "UNCERTAIN":
        return t("uncertain");

      default:
        return value;
    }
  }

  return (
    <div className="crescent-card">
      <h2>🌙 {t("crescent")}</h2>

      <div className="crescent-status">
        {getVisibility(crescent.visibility)}
      </div>

      <div className="crescent-grid">
        <div className="crescent-item">
          <span>{t("confidence")}</span>
          <strong>{getConfidence(crescent.confidence)}</strong>
        </div>

        <div className="crescent-item">
          <span>{t("altitude")}</span>
          <strong>{crescent.altitude.toFixed(2)}°</strong>
        </div>

        <div className="crescent-item">
          <span>{t("elongation")}</span>
          <strong>{crescent.elongation.toFixed(2)}°</strong>
        </div>

        <div className="crescent-item">
          <span>{t("moonsetLag")}</span>
          <strong>
            {crescent.lagMinutes} {t("minutes")}
          </strong>
        </div>

        <div className="crescent-item">
          <span>{t("moonAge")}</span>
          <strong>
            {(crescent.moonAgeHours / 24).toFixed(1)} {t("days")}
          </strong>
        </div>

        {crescent.yallopClass && (
          <div className="crescent-item">
            <span>{t("yallopClass")}</span>
            <strong>{crescent.yallopClass}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

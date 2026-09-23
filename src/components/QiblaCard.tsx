import {
  calculateDistanceToKaaba,
  calculateQiblaDirection,
} from "../astronomy/qibla";

import { useLanguage } from "../context/LanguageContext";

interface Props {
  latitude: number;
  longitude: number;
}

export default function QiblaCard({ latitude, longitude }: Props) {
  const { language, t } = useLanguage();

  const direction = calculateQiblaDirection(latitude, longitude);

  const distance = calculateDistanceToKaaba(latitude, longitude);

  function getDirectionName(degree: number) {
    if (degree >= 337.5 || degree < 22.5) {
      return t("north");
    }

    if (degree < 67.5) {
      return t("northEast");
    }

    if (degree < 112.5) {
      return t("east");
    }

    if (degree < 157.5) {
      return t("southEast");
    }

    if (degree < 202.5) {
      return t("south");
    }

    if (degree < 247.5) {
      return t("southWest");
    }

    if (degree < 292.5) {
      return t("west");
    }

    return t("northWest");
  }

  return (
    <div className="qibla-card">
      <h2>🕋 {t("qibla")}</h2>

      <div className="compass">
        <span className="direction north">N</span>
        <span className="direction east">E</span>
        <span className="direction south">S</span>
        <span className="direction west">W</span>

        <div
          className="qibla-arrow"
          style={{
            transform: `rotate(${direction}deg)`,
          }}
        >
          <span>↑</span>
        </div>

        <div className="kaaba-center">🕋</div>
      </div>

      <div className="qibla-degree">{direction.toFixed(1)}°</div>

      <div className="qibla-direction">{getDirectionName(direction)}</div>

      <div className="qibla-distance">
        <span>{t("distanceToKaaba")}</span>

        <strong>
          {distance.toLocaleString(language === "ar" ? "ar-EG" : "en-US")}{" "}
          {t("km")}
        </strong>
      </div>
    </div>
  );
}

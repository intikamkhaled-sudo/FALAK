import { useLanguage } from "../context/LanguageContext";
import type { WeatherData, WeatherAssessment } from "../services/weather";

interface Props {
  weather: WeatherData;
  assessment: WeatherAssessment;
}

function formatValue(
  value: number | null,
  unit: string,
  locale: string,
  unavailable: string,
) {
  if (value === null || !Number.isFinite(value)) return <span>{unavailable}</span>;

  const isVisibility = unit === "m";
  const number = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
  }).format(isVisibility ? value / 1000 : value);
  const displayedUnit = isVisibility ? "km" : unit;
  const localizedUnit = displayedUnit === "%" && locale.startsWith("ar")
    ? "٪"
    : displayedUnit;
  const isPercent = displayedUnit === "%";

  return (
    <bdi
      className={`numeric-ltr numeric-value${isPercent ? " numeric-percent" : ""}`}
      dir="ltr"
      lang={locale.startsWith("ar") ? "ar" : "en"}
      aria-label={`${number} ${localizedUnit}`}
    >
      <span className="numeric-number" dir="ltr">{number}</span>
      <span className="numeric-unit" dir="ltr">{localizedUnit}</span>
    </bdi>
  );
}

function formatDateTime(value: Date, locale: string, timeZone: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(value);
}

export default function CrescentWeatherCard({ weather, assessment }: Props) {
  const { language, t } = useLanguage();
  const locale = language === "ar" ? "ar-EG" : "en-GB";
  const timeZone = weather.timezone || "UTC";
  const snapshot = weather.snapshot;

  const weatherItems = [
    { key: "cloudCover", label: t("cloudCover"), value: snapshot.cloudCover, unit: "%" },
    { key: "lowClouds", label: t("lowClouds"), value: snapshot.lowCloudCover, unit: "%" },
    { key: "midClouds", label: t("midClouds"), value: snapshot.midCloudCover, unit: "%" },
    { key: "highClouds", label: t("highClouds"), value: snapshot.highCloudCover, unit: "%" },
    { key: "visibility", label: t("visibility"), value: snapshot.visibilityMeters, unit: "m" },
    { key: "humidity", label: t("humidity"), value: snapshot.relativeHumidity, unit: "%" },
    { key: "temperature", label: t("temperature"), value: snapshot.temperatureC, unit: "°C" },
    { key: "windSpeed", label: t("windSpeed"), value: snapshot.windSpeedKmh, unit: "km/h" },
  ];

  const conditionKey = {
    FAVORABLE: "favorable",
    MIXED: "mixed",
    UNFAVORABLE: "unfavorable",
    UNKNOWN: "unknown",
  } as const;

  const impactKey = {
    GOOD: "good",
    CAUTION: "caution",
    BAD: "bad",
    UNKNOWN: "unavailable",
  } as const;

  const explanationKey: Record<string, Record<string, string>> = {
    cloudCover: {
      GOOD: "explanationCloudGood",
      CAUTION: "explanationCloudCaution",
      BAD: "explanationCloudBad",
    },
    lowCloudCover: {
      GOOD: "explanationLowCloudGood",
      CAUTION: "explanationLowCloudCaution",
      BAD: "explanationLowCloudBad",
    },
    midCloudCover: {
      GOOD: "explanationMidCloudGood",
      CAUTION: "explanationMidCloudCaution",
      BAD: "explanationMidCloudBad",
    },
    highCloudCover: {
      GOOD: "explanationHighCloudGood",
      CAUTION: "explanationHighCloudCaution",
      BAD: "explanationHighCloudBad",
    },
    visibility: {
      GOOD: "explanationVisibilityGood",
      CAUTION: "explanationVisibilityCaution",
      BAD: "explanationVisibilityBad",
    },
    relativeHumidity: {
      GOOD: "explanationHumidityGood",
      CAUTION: "explanationHumidityCaution",
      BAD: "explanationHumidityBad",
    },
    precipitationProbability: {
      GOOD: "explanationPrecipGood",
      CAUTION: "explanationPrecipCaution",
      BAD: "explanationPrecipBad",
    },
  };

  const factorLabelKey: Record<string, string> = {
    cloudCover: "cloudCover",
    lowCloudCover: "lowClouds",
    midCloudCover: "midClouds",
    highCloudCover: "highClouds",
    visibility: "visibility",
    relativeHumidity: "humidity",
    precipitationProbability: "precipitationProbability",
  };

  const summaryKey = {
    FAVORABLE: "weatherSummaryFavorable",
    MIXED: "weatherSummaryMixed",
    UNFAVORABLE: "weatherSummaryUnfavorable",
    UNKNOWN: "limitationInsufficient",
  } as const;

  const limitations = assessment.score === null
    ? ["limitationNotProof", "limitationNotObservation", "limitationMissing"]
    : ["limitationHeuristic", "limitationForecast", "limitationCloudLayers", "limitationSeparate"];

  const requested = `${weather.coordinates.latitude.toFixed(4)}, ${weather.coordinates.longitude.toFixed(4)}`;
  const grid = `${weather.gridCoordinates.latitude.toFixed(4)}, ${weather.gridCoordinates.longitude.toFixed(4)}`;

  return (
    <div className="crescent-card crescent-weather-card" dir={language === "ar" ? "rtl" : "ltr"}>
      <h2>🌤️ {t("crescentWeather")}</h2>

      <div className="crescent-weather-assessment">
        <h3>{t("weatherAssessment")}</h3>

        <div className="weather-score">
          <span className="numeric-ltr" dir="ltr">
            {assessment.score === null ? "--" : new Intl.NumberFormat(locale).format(assessment.score)}
            {assessment.score !== null && "/100"}
          </span>
        </div>

        <div className={`weather-condition ${assessment.condition.toLowerCase()}`}>
          {t(conditionKey[assessment.condition])}
        </div>

        <p>{t(summaryKey[assessment.condition])}</p>
      </div>

      <div className="crescent-weather-time">
        {t("observationTime")}:{" "}
        <strong><bdi className="weather-datetime" dir="auto">{formatDateTime(snapshot.time, locale, timeZone)}</bdi></strong>
      </div>

      <div className="crescent-weather-time">
        {t("targetTime")}:{" "}
        <strong><bdi className="weather-datetime" dir="auto">{formatDateTime(weather.targetTime, locale, timeZone)}</bdi></strong>
      </div>

      <h3>{t("weatherData")}</h3>

      <div className="crescent-grid">
        {weatherItems.map((item) => (
          <div className="crescent-item" key={item.key}>
            <span>{item.label}</span>
            <strong>{formatValue(item.value, item.unit, locale, t("unavailable"))}</strong>
          </div>
        ))}
      </div>

      <h3>{t("assessmentFactors")}</h3>

      <div className="weather-factors">
        {assessment.factors.map((item) => {
          const explanation = explanationKey[item.key]?.[item.impact];
          const labelKey = factorLabelKey[item.key];

          return (
            <div className="weather-factor" key={item.key}>
              <div className="weather-factor-header">
                <strong className="weather-factor-label">{labelKey ? t(labelKey as never) : item.key}</strong>
                <span className={`weather-impact ${item.impact.toLowerCase()}`}>
                  {t(impactKey[item.impact])}
                </span>
              </div>

              <div className="weather-factor-value">
                {formatValue(item.value, item.unit, locale, t("unavailable"))}
              </div>

              <p>{explanation ? t(explanation as never) : t("unavailable")}</p>
            </div>
          );
        })}
      </div>

      <div className="weather-limitations">
        <h3>{t("scientificLimitations")}</h3>
        <ul>
          {limitations.map((key) => <li key={key}>{t(key as never)}</li>)}
        </ul>
      </div>

      <div className="crescent-weather-time">
        {t("fetchedAt")}:{" "}
        <strong><bdi className="weather-datetime" dir="auto">{formatDateTime(weather.fetchedAt, locale, timeZone)}</bdi></strong>
      </div>
      <div className="crescent-weather-time">
        {t("requestedCoordinates")}: <strong><span className="numeric-ltr">{requested}</span></strong>
      </div>
      <div className="crescent-weather-time">
        {t("forecastGridCoordinates")}: <strong><span className="numeric-ltr">{grid}</span></strong>
      </div>

      <small className="weather-source">{t("weatherSource")} <bdi dir="ltr">Open-Meteo.com</bdi></small>
    </div>
  );
}

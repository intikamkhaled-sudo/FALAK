export interface WeatherCoordinates {
  latitude: number;
  longitude: number;
  elevation?: number;
}

export interface HourlyWeatherSnapshot {
  time: Date;
  temperatureC: number | null;
  relativeHumidity: number | null;
  dewPointC: number | null;
  cloudCover: number | null;
  lowCloudCover: number | null;
  midCloudCover: number | null;
  highCloudCover: number | null;
  visibilityMeters: number | null;
  precipitationProbability: number | null;
  precipitationMm: number | null;
  rainMm: number | null;
  windSpeedKmh: number | null;
}

export interface WeatherForecast {
  provider: "OPEN_METEO";
  fetchedAt: Date;
  timezone: string;
  coordinates: WeatherCoordinates;
  targetTime: Date;
  snapshot: HourlyWeatherSnapshot;
  sourceModel: string | null;
  attribution: "Weather data by Open-Meteo.com";
}

export type SkyCondition = "FAVORABLE" | "MIXED" | "UNFAVORABLE" | "UNKNOWN";

export interface CrescentWeatherAssessment {
  condition: SkyCondition;
  score: number | null;
  summary: string;
  factors: Array<{
    key: string;
    value: number | null;
    unit: string;
    impact: "GOOD" | "CAUTION" | "BAD" | "UNKNOWN";
    explanation: string;
  }>;
  limitations: string[];
  weather: WeatherForecast;
}

export interface WeatherCoordinates {
  latitude: number;
  longitude: number;
  elevation?: number | null;
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
  gridCoordinates: WeatherCoordinates;
  targetTime: Date;
  snapshot: HourlyWeatherSnapshot;
  sourceModel: string | null;
  attribution: string;
}

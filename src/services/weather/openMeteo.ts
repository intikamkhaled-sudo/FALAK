import type {
  HourlyWeatherSnapshot,
  WeatherCoordinates,
  WeatherForecast,
} from "../../types/weather";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
const REQUEST_TIMEOUT_MS = 12_000;

type OpenMeteoResponse = {
  timezone?: string;
  latitude?: number;
  longitude?: number;
  elevation?: number;
  hourly?: Record<string, Array<string | number | null> | undefined>;
  hourly_units?: Record<string, string>;
  generationtime_ms?: number;
};

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function nearestIndex(times: Array<string | number>, target: Date): number {
  const targetMs = target.getTime();
  let bestIndex = -1;
  let bestDelta = Number.POSITIVE_INFINITY;

  for (let i = 0; i < times.length; i += 1) {
    const rawTime = times[i];
    const candidateMs = typeof rawTime === "number" ? rawTime * 1000 : Date.parse(rawTime);
    if (!Number.isFinite(candidateMs)) continue;
    const delta = Math.abs(candidateMs - targetMs);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = i;
    }
  }

  // Hourly samples should be no more than 30 minutes from the target instant.
  // This avoids presenting a distant sample as if it matched the requested time.
  return bestDelta <= 30 * 60 * 1000 ? bestIndex : -1;
}

function valueAt(
  hourly: Record<string, Array<string | number | null> | undefined>,
  key: string,
  index: number,
): number | null {
  const values = hourly[key];
  return values && index >= 0 ? finiteNumber(values[index]) : null;
}

export async function fetchWeatherForTime(
  coordinates: WeatherCoordinates,
  targetTime: Date,
  signal?: AbortSignal,
): Promise<WeatherForecast> {
  if (
    !Number.isFinite(coordinates.latitude) ||
    coordinates.latitude < -90 ||
    coordinates.latitude > 90 ||
    !Number.isFinite(coordinates.longitude) ||
    coordinates.longitude < -180 ||
    coordinates.longitude > 180
  ) {
    throw new Error("Invalid latitude/longitude for weather lookup.");
  }

  if (!Number.isFinite(targetTime.getTime())) {
    throw new Error("Invalid target time for weather lookup.");
  }

  const params = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "dew_point_2m",
      "cloud_cover",
      "cloud_cover_low",
      "cloud_cover_mid",
      "cloud_cover_high",
      "visibility",
      "precipitation_probability",
      "precipitation",
      "rain",
      "wind_speed_10m",
    ].join(","),
    forecast_days: "2",
    // Resolve the timezone from the selected coordinates. Unix timestamps remain UTC instants.
    timezone: "auto",
    timeformat: "unixtime",
    cell_selection: "land",
  });

  if (Number.isFinite(coordinates.elevation)) {
    params.set("elevation", String(coordinates.elevation));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener("abort", abortFromCaller, { once: true });

  try {
    const response = await fetch(`${OPEN_METEO_URL}?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo request failed (${response.status}).`);
    }

    const data = (await response.json()) as OpenMeteoResponse;
    const hourly = data.hourly;
    const times = hourly?.time;

    if (!hourly || !Array.isArray(times) || times.length === 0) {
      throw new Error("Open-Meteo returned no hourly forecast data.");
    }

    const index = nearestIndex(times as Array<string | number>, targetTime);
    if (index < 0) {
      throw new Error("No hourly weather sample within 30 minutes of the requested observation time.");
    }

    const snapshot: HourlyWeatherSnapshot = {
      time: new Date(
        typeof times[index] === "number"
          ? (times[index] as number) * 1000
          : Date.parse(times[index] as string),
      ),
      temperatureC: valueAt(hourly, "temperature_2m", index),
      relativeHumidity: valueAt(hourly, "relative_humidity_2m", index),
      dewPointC: valueAt(hourly, "dew_point_2m", index),
      cloudCover: valueAt(hourly, "cloud_cover", index),
      lowCloudCover: valueAt(hourly, "cloud_cover_low", index),
      midCloudCover: valueAt(hourly, "cloud_cover_mid", index),
      highCloudCover: valueAt(hourly, "cloud_cover_high", index),
      visibilityMeters: valueAt(hourly, "visibility", index),
      precipitationProbability: valueAt(hourly, "precipitation_probability", index),
      precipitationMm: valueAt(hourly, "precipitation", index),
      rainMm: valueAt(hourly, "rain", index),
      windSpeedKmh: valueAt(hourly, "wind_speed_10m", index),
    };

    return {
      provider: "OPEN_METEO",
      fetchedAt: new Date(),
      timezone: data.timezone ?? "UTC",
      coordinates,
      gridCoordinates: {
        latitude: finiteNumber(data.latitude) ?? coordinates.latitude,
        longitude: finiteNumber(data.longitude) ?? coordinates.longitude,
        elevation: finiteNumber(data.elevation) ?? coordinates.elevation ?? null,
      },
      targetTime,
      snapshot,
      sourceModel: null,
      attribution: "Weather data by Open-Meteo.com",
    };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}

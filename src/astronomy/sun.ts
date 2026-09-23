import {
  Body,
  Observer,
  Equator,
  Horizon,
  MakeTime,
  SearchRiseSet,
  SearchHourAngle,
  SiderealTime,
} from "astronomy-engine";

export interface SolarData {
  altitude: number;
  azimuth: number;
  declination: number;
  rightAscension: number;
  distance: number;
  sunrise: Date | null;
  sunset: Date | null;
  solarNoon: Date | null;
  siderealTime: number;
}

export function getSolarData(
  latitude: number,
  longitude: number,
  elevation: number,
  date: Date,
): SolarData {
  const observer = new Observer(latitude, longitude, elevation);

  const time = MakeTime(date);

  // =========================
  // Sun Equatorial Coordinates
  // =========================

  const equator = Equator(Body.Sun, time, observer, true, true);

  // =========================
  // Sun Horizontal Coordinates
  // =========================

  const horizon = Horizon(time, observer, equator.ra, equator.dec, "normal");

  // =========================
  // Sunrise
  // =========================

  const sunriseEvent = SearchRiseSet(Body.Sun, observer, 1, time, 1);

  // =========================
  // Sunset
  // =========================

  const sunsetEvent = SearchRiseSet(Body.Sun, observer, -1, time, 1);

  // =========================
  // Solar Noon
  // =========================

  const noonEvent = SearchHourAngle(Body.Sun, observer, 0, time, 1);

  return {
    altitude: horizon.altitude,
    azimuth: horizon.azimuth,

    declination: equator.dec,
    rightAscension: equator.ra,
    distance: equator.dist,

    sunrise: sunriseEvent ? sunriseEvent.date : null,

    sunset: sunsetEvent ? sunsetEvent.date : null,

    solarNoon: noonEvent ? noonEvent.time.date : null,

    siderealTime: SiderealTime(time),
  };
}

// =====================================================
// Backward-compatible function
// =====================================================

export function getSunPosition(
  latitude: number,
  longitude: number,
  elevation: number,
  date: Date,
) {
  const solarData = getSolarData(latitude, longitude, elevation, date);

  return {
    altitude: solarData.altitude,
    azimuth: solarData.azimuth,
  };
}

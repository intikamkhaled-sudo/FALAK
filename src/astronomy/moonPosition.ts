import {
  Body,
  Observer,
  MakeTime,
  SearchRiseSet,
  Equator,
  Horizon,
  GeoVector,
} from "astronomy-engine";

export interface MoonPosition {
  altitude: number;

  moonset: Date | null;

  azimuth: number;

  distance: number;
}

export function getMoonPosition(
  date: Date,
  latitude: number,
  longitude: number,
  elevation: number,
): MoonPosition {
  const observer = new Observer(latitude, longitude, elevation);

  const time = MakeTime(date);

  const equator = Equator(Body.Moon, time, observer, true, true);

  const horizon = Horizon(time, observer, equator.ra, equator.dec, "normal");

  const vector = GeoVector(Body.Moon, time, true);

  const distance = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);

  const moonset = SearchRiseSet(Body.Moon, observer, -1, time, 1, 0);

  return {
    altitude: horizon.altitude,

    azimuth: horizon.azimuth,

    distance,

    moonset: moonset ? moonset.date : null,
  };
}

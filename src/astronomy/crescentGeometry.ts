import {
  Body,
  Observer,
  MakeTime,
  Equator,
  Horizon,
  GeoVector,
  EquatorFromVector,
} from "astronomy-engine";

export interface CrescentGeometry {
  moonAltitude: number;
  sunAltitude: number;

  moonAzimuth: number;
  sunAzimuth: number;

  arcv: number;
  arcl: number;
  daz: number;

  moonDistanceAu: number;

  moonSemiDiameterArcMin: number;
  crescentWidthArcMin: number;
}

const MOON_RADIUS_KM = 1737.4;
const AU_KM = 149_597_870.7;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

function normalizeAngle180(angle: number): number {
  let value = angle % 360;

  if (value > 180) {
    value -= 360;
  }

  if (value < -180) {
    value += 360;
  }

  return value;
}

function angularSeparation(
  ra1Hours: number,
  dec1Deg: number,
  ra2Hours: number,
  dec2Deg: number,
): number {
  const ra1 = toRadians(ra1Hours * 15);

  const ra2 = toRadians(ra2Hours * 15);

  const dec1 = toRadians(dec1Deg);

  const dec2 = toRadians(dec2Deg);

  const cosAngle =
    Math.sin(dec1) * Math.sin(dec2) +
    Math.cos(dec1) * Math.cos(dec2) * Math.cos(ra1 - ra2);

  const safeCos = Math.max(-1, Math.min(1, cosAngle));

  return toDegrees(Math.acos(safeCos));
}

export function calculateCrescentGeometry(
  date: Date,
  latitude: number,
  longitude: number,
  elevation: number,
): CrescentGeometry {
  const observer = new Observer(latitude, longitude, elevation);

  const time = MakeTime(date);

  /*
   * ==========================================
   * TOPOCENTRIC POSITIONS
   * ==========================================
   *
   * Used for:
   * - apparent Moon altitude
   * - apparent Sun altitude
   * - displayed azimuth
   * - topocentric ARCL
   * - topocentric crescent width W'
   */
  const moonTopo = Equator(Body.Moon, time, observer, true, true);

  const sunTopo = Equator(Body.Sun, time, observer, true, true);

  /*
   * Apparent horizon positions.
   *
   * "normal" applies atmospheric
   * refraction.
   *
   * These values are for display,
   * NOT for Yallop ARCV.
   */
  const moonApparent = Horizon(
    time,
    observer,
    moonTopo.ra,
    moonTopo.dec,
    "normal",
  );

  const sunApparent = Horizon(
    time,
    observer,
    sunTopo.ra,
    sunTopo.dec,
    "normal",
  );

  /*
   * ==========================================
   * GEOCENTRIC POSITIONS
   * ==========================================
   *
   * GeoVector returns vectors measured
   * from the center of the Earth.
   */
  const moonGeoVector = GeoVector(Body.Moon, time, true);

  const sunGeoVector = GeoVector(Body.Sun, time, true);

  /*
   * Convert the geocentric vectors
   * to equatorial RA/Dec.
   */
  const moonGeo = EquatorFromVector(moonGeoVector);

  const sunGeo = EquatorFromVector(sunGeoVector);

  /*
   * Horizon without a refraction
   * argument means NO atmospheric
   * refraction.
   *
   * The RA/Dec values are geocentric,
   * so lunar topocentric parallax has
   * not been applied here.
   */
  const moonGeoHorizon = Horizon(time, observer, moonGeo.ra, moonGeo.dec);

  const sunGeoHorizon = Horizon(time, observer, sunGeo.ra, sunGeo.dec);

  /*
   * ==========================================
   * ARCV
   * ==========================================
   *
   * Arc of Vision:
   *
   * Moon altitude - Sun altitude
   *
   * calculated from the geocentric,
   * unrefracted geometry.
   */
  const arcv = moonGeoHorizon.altitude - sunGeoHorizon.altitude;

  /*
   * ==========================================
   * DAZ
   * ==========================================
   *
   * Difference in azimuth.
   */
  const daz = Math.abs(
    normalizeAngle180(sunGeoHorizon.azimuth - moonGeoHorizon.azimuth),
  );

  /*
   * ==========================================
   * ARCL
   * ==========================================
   *
   * Topocentric angular separation
   * between Moon and Sun.
   */
  const arcl = angularSeparation(
    moonTopo.ra,
    moonTopo.dec,
    sunTopo.ra,
    sunTopo.dec,
  );

  /*
   * Topocentric lunar distance.
   *
   * Astronomy Engine returns AU.
   */
  const moonDistanceAu = moonTopo.dist;

  const moonDistanceKm = moonDistanceAu * AU_KM;

  /*
   * Apparent topocentric lunar
   * semi-diameter.
   */
  const semiDiameterRad = Math.asin(MOON_RADIUS_KM / moonDistanceKm);

  const moonSemiDiameterArcMin = toDegrees(semiDiameterRad) * 60;

  /*
   * ==========================================
   * YALLOP W'
   * ==========================================
   *
   * Topocentric crescent width:
   *
   * W' = SD' × (1 - cos ARCL)
   *
   * Unit: arcminutes.
   */
  const crescentWidthArcMin =
    moonSemiDiameterArcMin * (1 - Math.cos(toRadians(arcl)));

  return {
    /*
     * Apparent values for Falak UI.
     */
    moonAltitude: moonApparent.altitude,

    sunAltitude: sunApparent.altitude,

    moonAzimuth: moonApparent.azimuth,

    sunAzimuth: sunApparent.azimuth,

    /*
     * Crescent geometry.
     */
    arcv,
    arcl,
    daz,

    moonDistanceAu,

    moonSemiDiameterArcMin,

    crescentWidthArcMin,
  };
}

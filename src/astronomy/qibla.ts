const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

export function calculateQiblaDirection(
  latitude: number,
  longitude: number,
): number {
  const lat1 = (latitude * Math.PI) / 180;

  const lat2 = (KAABA_LAT * Math.PI) / 180;

  const deltaLon = ((KAABA_LON - longitude) * Math.PI) / 180;

  const y = Math.sin(deltaLon);

  const x =
    Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(deltaLon);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;

  bearing = (bearing + 360) % 360;

  return bearing;
}

export function calculateDistanceToKaaba(
  latitude: number,
  longitude: number,
): number {
  const R = 6371;

  const dLat = ((KAABA_LAT - latitude) * Math.PI) / 180;

  const dLon = ((KAABA_LON - longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((latitude * Math.PI) / 180) *
      Math.cos((KAABA_LAT * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

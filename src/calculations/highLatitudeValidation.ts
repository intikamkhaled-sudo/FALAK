export function isShortNight(
  sunset: Date,
  sunrise: Date,
  minimumNightMinutes: number,
): boolean {
  let sunriseTime = sunrise.getTime();

  const sunsetTime = sunset.getTime();

  if (sunriseTime <= sunsetTime) {
    sunriseTime += 24 * 60 * 60 * 1000;
  }

  const nightMinutes = (sunriseTime - sunsetTime) / (1000 * 60);

  return nightMinutes < minimumNightMinutes;
}

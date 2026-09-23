export function calculateIslamicMidnight(maghrib: Date, fajr: Date): Date {
  const nightDuration = fajr.getTime() - maghrib.getTime();

  return new Date(maghrib.getTime() + nightDuration / 2);
}

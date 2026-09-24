import { Body, Observer, MakeTime, SearchAltitude } from "astronomy-engine";

function searchSunAngle(
  observer: Observer,
  time: ReturnType<typeof MakeTime>,
  direction: 1 | -1,
  angle: number,
): Date | null {
  const event = SearchAltitude(Body.Sun, observer, direction, time, 1, -angle);

  return event?.date ?? null;
}

function format(date: Date | null): string {
  if (!date) return "--:--:--";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Cairo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function testPrayerAngles() {
  // Cairo
  const observer = new Observer(30.0444, 31.2357, 23);

  // 24 September 2026
  // Start before Fajr in UTC.
  const time = MakeTime(new Date("2026-09-24T00:00:00Z"));

  const fajrAngles = [
    19.0, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8, 19.9, 20.0,
  ];

  const ishaAngles = [
    17.0, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9, 18.0,
  ];

  console.group("🌅 FAJR ANGLE TEST");

  for (const angle of fajrAngles) {
    const result = searchSunAngle(observer, time, 1, angle);

    console.log(`${angle.toFixed(1)}° → ${format(result)}`);
  }

  console.groupEnd();

  console.group("🌙 ISHA ANGLE TEST");

  for (const angle of ishaAngles) {
    const result = searchSunAngle(observer, time, -1, angle);

    console.log(`${angle.toFixed(1)}° → ${format(result)}`);
  }

  console.groupEnd();
}

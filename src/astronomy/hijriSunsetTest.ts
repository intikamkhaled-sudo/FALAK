import { Body, Observer, MakeTime, SearchRiseSet } from "astronomy-engine";

import { gregorianToHijri } from "./hijri";

interface TestLocation {
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
}

const locations: TestLocation[] = [
  {
    name: "Cairo",
    latitude: 30.0444,
    longitude: 31.2357,
    elevation: 23,
  },
  {
    name: "Riyadh",
    latitude: 24.7136,
    longitude: 46.6753,
    elevation: 612,
  },
];

function formatHijri(date: Date, location: TestLocation): string {
  const hijri = gregorianToHijri(
    date,
    location.latitude,
    location.longitude,
    location.elevation,
  );

  return `${hijri.day} ${hijri.monthName} ${hijri.year} AH`;
}

function testLocation(location: TestLocation, date: Date) {
  const observer = new Observer(
    location.latitude,
    location.longitude,
    location.elevation,
  );

  /*
   * Search for the first sunset
   * after the beginning of the UTC day.
   */
  const sunsetEvent = SearchRiseSet(Body.Sun, observer, -1, MakeTime(date), 2);

  if (!sunsetEvent) {
    console.error(`❌ No sunset found for ${location.name}`);

    return;
  }

  const sunset = sunsetEvent.date;

  const before = new Date(sunset.getTime() - 1000);

  const exact = new Date(sunset.getTime());

  const after = new Date(sunset.getTime() + 1000);

  console.group(`🌙 HIJRI SUNSET TEST — ${location.name}`);

  console.log("Sunset UTC:", sunset.toISOString());

  console.log(
    "1 second BEFORE:",
    before.toISOString(),
    "→",
    formatHijri(before, location),
  );

  console.log(
    "EXACT sunset:",
    exact.toISOString(),
    "→",
    formatHijri(exact, location),
  );

  console.log(
    "1 second AFTER:",
    after.toISOString(),
    "→",
    formatHijri(after, location),
  );

  console.groupEnd();
}

export function testHijriSunset() {
  /*
   * 25 September 2026.
   *
   * UTC is intentional here.
   * Each location's sunset is calculated
   * astronomically from its coordinates.
   */
  const date = new Date("2026-09-25T00:00:00Z");

  for (const location of locations) {
    testLocation(location, date);
  }
}

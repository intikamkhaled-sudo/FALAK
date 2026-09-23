import type { HijriDate } from "../types/hijri";

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qidah",
  "Dhu al-Hijjah",
];

function isHijriLeapYear(year: number): boolean {
  return (11 * year + 14) % 30 < 11;
}

export function gregorianToHijri(date: Date): HijriDate {
  const formatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "Africa/Cairo",
  });

  const parts = formatter.formatToParts(date);

  const day = Number(parts.find((part) => part.type === "day")?.value);

  const month = Number(parts.find((part) => part.type === "month")?.value);

  const year = Number(parts.find((part) => part.type === "year")?.value);

  return {
    day,
    month,
    year,
    monthName: HIJRI_MONTHS[month - 1],
    isLeapYear: isHijriLeapYear(year),
  };
}

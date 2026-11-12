import {
  localDateTimeToUTC,
  formatLocalDate,
  formatLocalTime,
} from "./timezone";

const timeZone = "Africa/Cairo";

const utcDate = localDateTimeToUTC("2026-09-21", 0, 0, 0, timeZone);

console.log("UTC:", utcDate.toISOString());

console.log("Local Date:", formatLocalDate(utcDate, timeZone));

console.log("Local Time:", formatLocalTime(utcDate, timeZone));

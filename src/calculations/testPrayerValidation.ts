import { validatePrayerDay } from "./prayerValidation";

import { CAIRO_LOCATION } from "../types/location";

const dates = [
  "2026-01-21",
  "2026-03-21",
  "2026-06-21",
  "2026-09-21",
  "2026-12-21",
] as const;

const methods = ["EGYPTIAN", "MUSLIM_WORLD_LEAGUE", "ISNA"] as const;

for (const method of methods) {
  console.log("\n");
  console.log("==========================================");
  console.log(`METHOD: ${method}`);
  console.log("==========================================");

  for (const date of dates) {
    const report = validatePrayerDay(date, CAIRO_LOCATION, method);

    console.log(`\nDate: ${date}`);

    console.log(`Status: ${report.allValid ? "PASS" : "FAIL"}`);

    for (const result of report.results) {
      console.log(
        `${result.valid ? "✓" : "✗"} ${result.prayer} - ${result.reason}`,
      );
    }
  }
}

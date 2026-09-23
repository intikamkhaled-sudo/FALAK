import { calculateRealCrescent } from "./crescentCalculator";

const cases = [
  {
    name: "Before New Moon",
    date: new Date("2026-10-09"),
  },

  {
    name: "New Moon Day",
    date: new Date("2026-10-11"),
  },

  {
    name: "Three Days After",
    date: new Date("2026-10-13"),
  },
];

for (const item of cases) {
  console.log("====================");

  console.log(item.name);

  const result = calculateRealCrescent({
    latitude: 30.0444,

    longitude: 31.2357,

    elevation: 23,

    date: item.date,
  });

  console.log(result);
}

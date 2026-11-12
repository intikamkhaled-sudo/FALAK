import { getFalakReport } from "./falakEngine";

const report = getFalakReport({
  latitude: 30.0444,

  longitude: 31.2357,

  elevation: 23,

  date: new Date("2026-10-13"),
});

console.log("====================");

console.log("FALAK ENGINE TEST");

console.log("====================");

console.dir(report, {
  depth: 5,
});

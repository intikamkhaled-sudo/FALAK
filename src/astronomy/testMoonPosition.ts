import { getMoonPosition } from "./moonPosition";

const result = getMoonPosition(
  new Date("2026-09-21T18:00:00"),

  30.0444,

  31.2357,

  23,
);

console.log("====================");

console.log("MOON POSITION TEST");

console.log("====================");

console.log(result);

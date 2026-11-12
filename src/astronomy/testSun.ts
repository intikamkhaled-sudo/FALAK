import { getSunPosition } from "./sun";

const cairo = {
  latitude: 30.0444,
  longitude: 31.2357,
  elevation: 23,
};

const result = getSunPosition(
  cairo.latitude,
  cairo.longitude,
  cairo.elevation,
  new Date(),
);

console.log("☀️ FALAK Sun Position");
console.log("----------------------");
console.log("Altitude:", result.altitude);
console.log("Azimuth:", result.azimuth);

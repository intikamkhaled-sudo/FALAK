import { Body, MakeTime, GeoVector } from "astronomy-engine";

function vectorAngle(a: any, b: any): number {
  const dot = a.x * b.x + a.y * b.y + a.z * b.z;

  const magA = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);

  const magB = Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);

  const cos = dot / (magA * magB);

  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

export function calculateElongation(date: Date): number {
  const time = MakeTime(date);

  const sun = GeoVector(Body.Sun, time, true);

  const moon = GeoVector(Body.Moon, time, true);

  return vectorAngle(sun, moon);
}

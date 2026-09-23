export interface LocationConfig {
  latitude: number;
  longitude: number;
  elevation: number;
  timeZone: string;
  name: string;
}

export const CAIRO_LOCATION: LocationConfig = {
  name: "Cairo",
  latitude: 30.0444,
  longitude: 31.2357,
  elevation: 23,
  timeZone: "Africa/Cairo",
};
export const OSLO_LOCATION: LocationConfig = {
  name: "Oslo, Norway",
  latitude: 59.9139,
  longitude: 10.7522,
  elevation: 23,
  timeZone: "Europe/Oslo",
};

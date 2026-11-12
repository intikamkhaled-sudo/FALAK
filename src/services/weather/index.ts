export { fetchWeatherForTime as fetchWeather } from "./openMeteo";

export { assessCrescentWeather } from "./crescentWeatherAssessment";

export type WeatherData = Awaited<
  ReturnType<typeof import("./openMeteo").fetchWeatherForTime>
>;

export type WeatherAssessment = ReturnType<
  typeof import("./crescentWeatherAssessment").assessCrescentWeather
>;

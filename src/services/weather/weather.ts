export interface WeatherData {
  latitude: number;
  longitude: number;
  time: string;
  cloudCover: number | null;
  visibility: number | null;
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  lowClouds: number | null;
  midClouds: number | null;
  highClouds: number | null;
}

export interface WeatherAssessment {
  score: number;
  level: "excellent" | "good" | "fair" | "poor";
  summary: string;
  factors: string[];
}

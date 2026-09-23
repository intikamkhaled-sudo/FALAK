export interface City {
  name: string;
  nameAr: string;

  country: string;
  countryAr: string;

  latitude: number;
  longitude: number;
  elevation?: number;
}

export const cities: City[] = [
  {
    name: "Cairo",
    nameAr: "القاهرة",

    country: "Egypt",
    countryAr: "مصر",

    latitude: 30.0444,
    longitude: 31.2357,
    elevation: 23,
  },

  // باقي المدن عندك بنفس الشكل
];

import type { ChangeEvent } from "react";

import { cities } from "../data/cities";
import { useLanguage } from "../context/LanguageContext";

interface City {
  name: string;
  nameAr?: string;

  country: string;
  countryAr?: string;

  latitude: number;
  longitude: number;
  elevation?: number;
}

interface Props {
  onChange: (city: City) => void;
}

export default function LocationSelector({ onChange }: Props) {
  const { language } = useLanguage();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const index = Number(event.target.value);

    const selectedCity = cities[index];

    if (selectedCity) {
      onChange(selectedCity);
    }
  }

  return (
    <div className="location-select">
      <span className="location-select-icon">🌍</span>

      <select
        defaultValue="0"
        onChange={handleChange}
        aria-label={language === "ar" ? "اختر المدينة" : "Select city"}
      >
        {cities.map((city, index) => {
          const cityName =
            language === "ar" ? city.nameAr || city.name : city.name;

          const countryName =
            language === "ar" ? city.countryAr || city.country : city.country;

          return (
            <option key={`${city.name}-${city.country}`} value={index}>
              {cityName} - {countryName}
            </option>
          );
        })}
      </select>
    </div>
  );
}

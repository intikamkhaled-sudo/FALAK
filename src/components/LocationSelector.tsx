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
  currentCity: City;
  onChange: (city: City) => void;
}

export default function LocationSelector({ currentCity, onChange }: Props) {
  const { language } = useLanguage();

  const selectedIndex = cities.findIndex(
    (city) =>
      city.latitude === currentCity.latitude &&
      city.longitude === currentCity.longitude,
  );

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
        value={selectedIndex >= 0 ? selectedIndex.toString() : "gps"}
        onChange={handleChange}
        aria-label={language === "ar" ? "اختر المدينة" : "Select city"}
      >
        {selectedIndex === -1 && (
          <option value="gps" disabled>
            {language === "ar" ? "موقعي الحالي" : "Current Location"}
          </option>
        )}

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

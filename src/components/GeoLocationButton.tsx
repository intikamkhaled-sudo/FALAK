import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

interface LocationData {
  latitude: number;
  longitude: number;
  elevation?: number;
}

interface Props {
  onLocation: (location: LocationData) => void;
}

export default function GeoLocationButton({ onLocation }: Props) {
  const { language, t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleLocation() {
    if (!navigator.geolocation) {
      setError(
        language === "ar"
          ? "الموقع الجغرافي غير مدعوم في هذا المتصفح"
          : "Geolocation is not supported by this browser",
      );

      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,

          elevation: position.coords.altitude ?? 0,
        };

        onLocation(location);

        setLoading(false);
      },

      (geoError) => {
        setLoading(false);

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setError(
              language === "ar"
                ? "تم رفض إذن الوصول إلى الموقع"
                : "Location permission was denied",
            );
            break;

          case geoError.POSITION_UNAVAILABLE:
            setError(
              language === "ar"
                ? "تعذر تحديد موقعك"
                : "Your location is unavailable",
            );
            break;

          case geoError.TIMEOUT:
            setError(
              language === "ar"
                ? "استغرق تحديد الموقع وقتًا طويلًا"
                : "Location request timed out",
            );
            break;

          default:
            setError(
              language === "ar"
                ? "حدث خطأ أثناء تحديد الموقع"
                : "Unable to get your location",
            );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }

  return (
    <div className="geo-location-wrapper">
      <button
        type="button"
        className="geo-location-button"
        onClick={handleLocation}
        disabled={loading}
      >
        <span>📍</span>

        <span>
          {loading
            ? language === "ar"
              ? "جاري تحديد الموقع..."
              : "Getting Location..."
            : t("useMyLocation")}
        </span>
      </button>

      {error && <div className="geo-location-error">{error}</div>}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function AboutFalak() {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="about-falak-button"
        onClick={() => setOpen(true)}
      >
        ✦ {language === "ar" ? "عن فلك" : "About Falak"}
      </button>

      {open && (
        <div
          className="about-falak-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div
            className="about-falak-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-falak-title"
          >
            <button
              type="button"
              className="about-falak-close"
              onClick={() => setOpen(false)}
              aria-label={language === "ar" ? "إغلاق" : "Close"}
            >
              ×
            </button>

            <div className="about-falak-icon">☾</div>

            <h2 id="about-falak-title">FALAK</h2>

            <div className="about-falak-version">
              v{import.meta.env.VITE_APP_VERSION ?? "unknown"}
            </div>

            <p className="about-falak-description">
              {language === "ar"
                ? "رفيق فلكي إسلامي يجمع مواقيت الصلاة، والتقويم الهجري الفلكي، وبيانات القمر ورؤية الهلال، واتجاه القبلة في تجربة واحدة."
                : "An astronomy-based Islamic companion combining prayer times, an astronomical Hijri calendar, lunar and crescent data, and Qibla direction in one experience."}
            </p>

            <div className="about-falak-divider" />

            <div className="about-falak-developer">
              <span>
                {language === "ar" ? "تصميم وتطوير" : "Designed & Developed by"}
              </span>

              <strong>ENG/Khaled Ismail</strong>
            </div>

            <div className="about-falak-rights">
              © 2026 ENG/Khaled Ismail
              <br />
              {language === "ar" ? "جميع الحقوق محفوظة" : "All Rights Reserved"}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

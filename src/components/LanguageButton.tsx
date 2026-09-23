import { useLanguage } from "../context/LanguageContext";

export default function LanguageButton() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      className="language-button"
      onClick={toggleLanguage}
      aria-label={
        language === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"
      }
    >
      <span>🌐</span>

      <span>{language === "en" ? "العربية" : "English"}</span>
    </button>
  );
}

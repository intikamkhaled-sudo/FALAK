import { prayerVerses, type PrayerVerseKey } from "../data/prayerVerses";

import { useLanguage } from "../context/LanguageContext";

interface Props {
  nextPrayer: PrayerVerseKey;
}

export default function PrayerVerseCard({ nextPrayer }: Props) {
  const { language, t } = useLanguage();

  const verse = prayerVerses[nextPrayer];

  function getPrayerName() {
    return t(nextPrayer);
  }

  return (
    <div className="prayer-verse-card">
      <div className="verse-ornament">
        <span />
        <strong>۞</strong>
        <span />
      </div>

      <div className="prayer-verse-context">
        {language === "ar"
          ? `وقفة قرآنية قبل صلاة ${getPrayerName()}`
          : `Qur'anic reflection before ${getPrayerName()}`}
      </div>

      <div className="prayer-verse-text">﴿ {verse.text} ﴾</div>

      <div className="prayer-verse-reference">
        {language === "ar"
          ? `سورة ${verse.surah} • الآية ${verse.ayah}`
          : `Surah ${verse.surahEn} • Ayah ${verse.ayah}`}
      </div>
    </div>
  );
}

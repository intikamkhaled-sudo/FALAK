import { useLanguage } from "../context/LanguageContext";

interface HijriDate {
  day: number;
  month: number;
  monthName: string;
  year: number;
}

interface Props {
  hijri: HijriDate;
}

export default function HijriCard({ hijri }: Props) {
  const { language, t } = useLanguage();

  const arabicMonths: Record<number, string> = {
    1: "محرم",
    2: "صفر",
    3: "ربيع الأول",
    4: "ربيع الآخر",
    5: "جمادى الأولى",
    6: "جمادى الآخرة",
    7: "رجب",
    8: "شعبان",
    9: "رمضان",
    10: "شوال",
    11: "ذو القعدة",
    12: "ذو الحجة",
  };

  const monthName =
    language === "ar"
      ? (arabicMonths[hijri.month] ?? hijri.monthName)
      : hijri.monthName;

  const day = language === "ar" ? hijri.day.toLocaleString("ar-EG") : hijri.day;

  const year =
    language === "ar"
      ? hijri.year.toLocaleString("ar-EG", {
          useGrouping: false,
        })
      : hijri.year;

  return (
    <div className="hijri-card">
      <h2>📅 {t("hijriDate")}</h2>

      <div className="hijri-date-main">
        <div className="hijri-day">{day}</div>

        <div className="hijri-month">{monthName}</div>

        <div className="hijri-year">
          {year} {language === "ar" ? "هـ" : "AH"}
        </div>
      </div>
    </div>
  );
}

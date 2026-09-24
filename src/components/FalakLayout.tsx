import type { ReactNode } from "react";
import LanguageButton from "./LanguageButton";
import { useLanguage } from "../context/LanguageContext";
import AboutFalak from "./AboutFalak";
interface Props {
  children: ReactNode;
}

export default function FalakLayout({ children }: Props) {
  const { language } = useLanguage();

  return (
    <div className="falak-app">
      <img src="/aqsa.png" className="falak-bg-image" alt="" />

      <div className="stars" />

      <div className="falak-toolbar">
        <LanguageButton />
      </div>

      <main className="falak-content">{children}</main>

      <footer className="falak-footer">
        <div className="falak-footer-brand">FALAK</div>

        <div className="falak-footer-copyright">© 2026 ENG/Khaled Ismail</div>

        <div className="falak-footer-rights">
          {language === "ar" ? "جميع الحقوق محفوظة" : "All Rights Reserved"}
        </div>

        <div className="falak-footer-credit">
          {language === "ar"
            ? "تصميم وتطوير ENG/Khaled Ismail"
            : "Designed & Developed by ENG/Khaled Ismail"}
        </div>
        <AboutFalak />
      </footer>
    </div>
  );
}

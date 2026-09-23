import type { ReactNode } from "react";
import LanguageButton from "./LanguageButton";

interface Props {
  children: ReactNode;
}

export default function FalakLayout({ children }: Props) {
  return (
    <div className="falak-app">
      <img src="/aqsa.png" className="falak-bg-image" alt="" />

      <div className="stars" />

      <div className="falak-toolbar">
        <LanguageButton />
      </div>

      <main className="falak-content">{children}</main>
    </div>
  );
}

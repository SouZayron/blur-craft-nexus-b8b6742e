import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "pt" | "en" | "es" | "ar";

interface Translations {
  [key: string]: {
    pt: string;
    en: string;
    es: string;
    ar: string;
  };
}

const translations: Translations = {
  // Header
  nicks: { pt: "Nicks", en: "Nicks", es: "Nicks", ar: "الألقاب" },
  cores: { pt: "Cores", en: "Colors", es: "Colores", ar: "الألوان" },
  bingo: { pt: "Bingo", en: "Bingo", es: "Bingo", ar: "بينغو" },
  
  // Power Card
  ultimoPower: { pt: "Ultimo Power", en: "Latest Power", es: "Último Power", ar: "آخر باور" },
  status: { pt: "Status", en: "Status", es: "Estado", ar: "الحالة" },
  group: { pt: "Group", en: "Group", es: "Grupo", ar: "مجموعة" },
  epic: { pt: "Epic", en: "Epic", es: "Épico", ar: "ملحمي" },
  storePrice: { pt: "Store Price", en: "Store Price", es: "Precio Tienda", ar: "سعر المتجر" },
  tradePrice: { pt: "Trade Price", en: "Trade Price", es: "Precio Trade", ar: "سعر التداول" },
  tradeDays: { pt: "Trade Days", en: "Trade Days", es: "Días Trade", ar: "أيام التداول" },
  smiliesOfPower: { pt: "Smilies of the power:", en: "Smilies of the power:", es: "Smilies del power:", ar: "سمايلات الباور:" },
  unlimited: { pt: "Unlimited", en: "Unlimited", es: "Ilimitado", ar: "غير محدود" },
  unknown: { pt: "Desconhecido", en: "Unknown", es: "Desconocido", ar: "غير معروف" },
  
  // Tools
  nickGenerator: { pt: "Gerador de Nicks", en: "Nick Generator", es: "Generador de Nicks", ar: "مولد الألقاب" },
  colorGenerator: { pt: "Gerador de Cores", en: "Color Generator", es: "Generador de Colores", ar: "مولد الألوان" },
  bingoGame: { pt: "Bingo", en: "Bingo", es: "Bingo", ar: "بينغو" },
  
  // Footer
  copyright: { pt: "Todos os direitos reservados.", en: "All rights reserved.", es: "Todos los derechos reservados.", ar: "جميع الحقوق محفوظة." },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("pt");

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div dir={isRTL ? "rtl" : "ltr"}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

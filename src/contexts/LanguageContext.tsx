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
  
  // Color Generator Page
  colorTitle: { pt: "Gerador de Cores", en: "Color Generator", es: "Generador de Colores", ar: "مولد الألوان" },
  colorSubtitle: { pt: "Digite um tema e deixe que a gente cria as paletas de cores incríveis para você!", en: "Enter a theme and let us create amazing color palettes for you!", es: "¡Escribe un tema y deja que creemos paletas de colores increíbles para ti!", ar: "أدخل موضوعًا ودعنا ننشئ لوحات ألوان مذهلة لك!" },
  colorPlaceholder: { pt: "Digite um tema (ex: praia, fogo, floresta...)", en: "Enter a theme (e.g., beach, fire, forest...)", es: "Escribe un tema (ej: playa, fuego, bosque...)", ar: "أدخل موضوعًا (مثال: شاطئ، نار، غابة...)" },
  generate: { pt: "Gerar", en: "Generate", es: "Generar", ar: "إنشاء" },
  copied: { pt: "Copiado!", en: "Copied!", es: "¡Copiado!", ar: "تم النسخ!" },
  copyCode: { pt: "Copiar código", en: "Copy code", es: "Copiar código", ar: "نسخ الكود" },
  enterTheme: { pt: "Digite um tema", en: "Enter a theme", es: "Escribe un tema", ar: "أدخل موضوعًا" },
  enterThemeDesc: { pt: "Por favor, insira um tema para gerar as paletas.", en: "Please enter a theme to generate palettes.", es: "Por favor, ingresa un tema para generar las paletas.", ar: "يرجى إدخال موضوع لإنشاء اللوحات." },
  processingError: { pt: "Erro ao processar", en: "Processing error", es: "Error al procesar", ar: "خطأ في المعالجة" },
  processingErrorDesc: { pt: "Não foi possível processar as paletas. Tente novamente.", en: "Could not process palettes. Try again.", es: "No se pudieron procesar las paletas. Inténtalo de nuevo.", ar: "تعذرت معالجة اللوحات. حاول مرة أخرى." },
  error: { pt: "Erro", en: "Error", es: "Error", ar: "خطأ" },
  errorGenerating: { pt: "Erro ao gerar paletas. Tente novamente.", en: "Error generating palettes. Try again.", es: "Error al generar paletas. Inténtalo de nuevo.", ar: "خطأ في إنشاء اللوحات. حاول مرة أخرى." },
  emptyStateColors: { pt: "Necessários os powers Namecolor + Namegrad/Namewave para funcionar.", en: "Requires Namecolor + Namegrad/Namewave powers to work.", es: "Requiere los powers Namecolor + Namegrad/Namewave para funcionar.", ar: "مطلوب باورات Namecolor + Namegrad/Namewave للعمل." },
  
  // Nick Generator Page
  nickTitle: { pt: "Gerador de Nicks", en: "Nick Generator", es: "Generador de Nicks", ar: "مولد الألقاب" },
  nickSubtitle: { pt: "Transforme seu nome em 139 estilos únicos", en: "Transform your name into 139 unique styles", es: "Transforma tu nombre en 139 estilos únicos", ar: "حوّل اسمك إلى 139 نمطًا فريدًا" },
  nickPlaceholder: { pt: "Digite seu nome ou apelido...", en: "Enter your name or nickname...", es: "Escribe tu nombre o apodo...", ar: "أدخل اسمك أو لقبك..." },
  filterStyles: { pt: "Filtrar estilos...", en: "Filter styles...", es: "Filtrar estilos...", ar: "تصفية الأنماط..." },
  showingOf: { pt: "Mostrando", en: "Showing", es: "Mostrando", ar: "عرض" },
  of: { pt: "de", en: "of", es: "de", ar: "من" },
  styles: { pt: "estilos", en: "styles", es: "estilos", ar: "أنماط" },
  nickCopied: { pt: "Nick copiado!", en: "Nick copied!", es: "¡Nick copiado!", ar: "تم نسخ اللقب!" },
  copyError: { pt: "Erro ao copiar", en: "Copy error", es: "Error al copiar", ar: "خطأ في النسخ" },
  enterName: { pt: "Digite um nome para gerar os nicks!", en: "Enter a name to generate nicks!", es: "¡Escribe un nombre para generar los nicks!", ar: "أدخل اسمًا لإنشاء الألقاب!" },
  nicksGenerated: { pt: "nicks gerados com sucesso!", en: "nicks generated successfully!", es: "¡nicks generados con éxito!", ar: "تم إنشاء الألقاب بنجاح!" },
  emptyStateNicks: { pt: "Digite um nome e clique em Gerar para ver a mágica acontecer!", en: "Enter a name and click Generate to see the magic happen!", es: "¡Escribe un nombre y haz clic en Generar para ver la magia!", ar: "أدخل اسمًا وانقر على إنشاء لترى السحر!" },
  
  // Bingo Page
  bingoTitle: { pt: "Bingo 1-90", en: "Bingo 1-90", es: "Bingo 1-90", ar: "بينغو 1-90" },
  back: { pt: "Voltar", en: "Back", es: "Volver", ar: "رجوع" },
  verificationPanel: { pt: "Painel de Conferência", en: "Verification Panel", es: "Panel de Verificación", ar: "لوحة التحقق" },
  takeScreenshot: { pt: "Tirar Print", en: "Take Screenshot", es: "Tomar Captura", ar: "أخذ لقطة" },
  sending: { pt: "Enviando...", en: "Sending...", es: "Enviando...", ar: "جاري الإرسال..." },
  imageLink: { pt: "Link da imagem:", en: "Image link:", es: "Enlace de la imagen:", ar: "رابط الصورة:" },
  linkCopied: { pt: "Link copiado!", en: "Link copied!", es: "¡Enlace copiado!", ar: "تم نسخ الرابط!" },
  printGenerated: { pt: "Print gerado!", en: "Screenshot generated!", es: "¡Captura generada!", ar: "تم إنشاء اللقطة!" },
  printGeneratedDesc: { pt: "Link da imagem disponível abaixo.", en: "Image link available below.", es: "Enlace de imagen disponible abajo.", ar: "رابط الصورة متاح أدناه." },
  printError: { pt: "Falha ao gerar o print", en: "Failed to generate screenshot", es: "Error al generar la captura", ar: "فشل في إنشاء اللقطة" },
  last10Balls: { pt: "Últimas 10 Bolas", en: "Last 10 Balls", es: "Últimas 10 Bolas", ar: "آخر 10 كرات" },
  play: { pt: "PLAY", en: "PLAY", es: "PLAY", ar: "تشغيل" },
  pause: { pt: "PAUSA", en: "PAUSE", es: "PAUSA", ar: "إيقاف" },
  remaining: { pt: "Restam", en: "Remaining", es: "Quedan", ar: "متبقي" },
  balls: { pt: "bolas", en: "balls", es: "bolas", ar: "كرات" },
  drawn: { pt: "Sorteadas", en: "Drawn", es: "Sorteadas", ar: "مسحوبة" },
  
  // Graphics FREE
  graphicsFree: { pt: "Graphics FREE", en: "Graphics FREE", es: "Graphics FREE", ar: "جرافيكس مجاني" },
  graphicsFreeDesc: { pt: "Packs gratuitos para baixar", en: "Free packs to download", es: "Packs gratuitos para descargar", ar: "حزم مجانية للتحميل" },
  images: { pt: "imagens", en: "images", es: "imágenes", ar: "صور" },
  copyLink: { pt: "Copiar", en: "Copy", es: "Copiar", ar: "نسخ" },
  comingSoon: { pt: "Em breve", en: "Coming soon", es: "Próximamente", ar: "قريبًا" },
  copyLinkError: { pt: "Erro ao copiar link", en: "Error copying link", es: "Error al copiar enlace", ar: "خطأ في نسخ الرابط" },
  newYearBackgrounds: { pt: "10 fundos de Ano Novo para o seu xat", en: "10 New Year backgrounds for your xat", es: "10 fondos de Año Nuevo para tu xat", ar: "10 خلفيات رأس السنة لـ xat الخاص بك" },
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

import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";

const languages = [
  { code: "pt" as const, name: "Português", flag: "🇧🇷" },
  { code: "pt-pt" as const, name: "Português-PT", flag: "🇵🇹" },
  { code: "en" as const, name: "English", flag: "🇺🇸" },
  { code: "es" as const, name: "Español", flag: "🇪🇸" },
  { code: "fr" as const, name: "Français", flag: "🇫🇷" },
  { code: "de" as const, name: "Deutsch", flag: "🇩🇪" },
  { code: "it" as const, name: "Italiano", flag: "🇮🇹" },
  { code: "nl" as const, name: "Nederlands", flag: "🇳🇱" },
  { code: "pl" as const, name: "Polski", flag: "🇵🇱" },
  { code: "ro" as const, name: "Română", flag: "🇷🇴" },
  { code: "hu" as const, name: "Magyar", flag: "🇭🇺" },
  { code: "tr" as const, name: "Türkçe", flag: "🇹🇷" },
  { code: "bs" as const, name: "Bosanski", flag: "🇧🇦" },
  { code: "sr" as const, name: "Srpski", flag: "🇷🇸" },
  { code: "tl" as const, name: "Tagalog", flag: "🇵🇭" },
  { code: "ar" as const, name: "العربية", flag: "🇸🇦" },
  { code: "th" as const, name: "ไทย", flag: "🇹🇭" },
];

/**
 * Floating language selector mounted globally so every page — including those
 * without the main Header — exposes the language switcher. Bottom-left to
 * avoid colliding with the FloatingRadio at bottom-right.
 */
export const FloatingLanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();
  const currentLang = languages.find((l) => l.code === language);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`${t("changeLanguage")} — ${currentLang?.name ?? "Português"}`}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-neon hover:scale-110 bg-card/70 backdrop-blur-xl border border-border text-muted-foreground hover:border-cyan/60 hover:text-cyan"
          title={t("changeLanguage")}
        >
          <Globe className="w-5 h-5" aria-hidden="true" />
          <span className="sr-only">{currentLang?.name}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="top"
          className="zgames-card border-border max-h-[60vh] overflow-y-auto"
        >
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-2 cursor-pointer ${
                language === lang.code ? "bg-primary/20 text-primary" : ""
              }`}
            >
              <span aria-hidden="true">{lang.flag}</span>
              <span>{lang.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

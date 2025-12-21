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

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const currentLang = languages.find((l) => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/20 text-foreground/70 hover:text-foreground outline-none">
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLang?.flag}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card border-white/20">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-2 cursor-pointer ${
              language === lang.code ? "bg-primary/20 text-primary" : ""
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

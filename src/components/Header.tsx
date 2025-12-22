import { Link, useLocation } from "react-router-dom";
import { Palette, Sparkles, Dices, Home, Info, Shield } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

export const Header = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navLinks = [
    { name: t("home"), icon: Home, path: "/" },
    { name: t("about"), icon: Info, path: "/sobre" },
    { name: t("nicks"), icon: Sparkles, path: "/nicks" },
    { name: t("cores"), icon: Palette, path: "/cores" },
    { name: t("bingo"), icon: Dices, path: "/bingo" },
    { name: t("privacyPolicy"), icon: Shield, path: "/privacidade" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-6xl mx-auto">
        <div className="glass-card px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/labxat-icon.gif" alt="Labxat" className="w-8 h-8" />
            <span className="text-2xl font-black text-gradient">Labxat</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1 md:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1 px-2 md:px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? "bg-primary/20 text-primary"
                    : "hover:bg-white/20 text-foreground/70 hover:text-foreground"
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span className="hidden lg:inline">{link.name}</span>
              </Link>
            ))}
            
            {/* Language Selector */}
            <LanguageSelector />
          </nav>
        </div>
      </div>
    </header>
  );
};
import { Link, useLocation } from "react-router-dom";
import { Palette, Sparkles, Dices, Home, Info, Newspaper, Gamepad2 } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

export const Header = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navLinks = [
    { name: t("home"), icon: Home, path: "/" },
    { name: t("nicks"), icon: Sparkles, path: "/nicks" },
    { name: t("cores"), icon: Palette, path: "/cores" },
    { name: t("bingo"), icon: Dices, path: "/bingo" },
    { name: "Blog", icon: Newspaper, path: "/blog" },
    { name: t("about"), icon: Info, path: "/sobre" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/65 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" aria-label="ZGames - Página inicial" className="flex items-center gap-2 group">
            <span className="grid size-9 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary shadow-neon">
              <Gamepad2 className="size-5" aria-hidden="true" />
            </span>
            <span className="zgames-heading text-2xl font-extrabold zgames-text-gradient">ZGames</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1 md:gap-2" aria-label="Navegação principal">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? "bg-primary/20 text-primary"
                    : "hover:bg-card/70 text-muted-foreground hover:text-cyan"
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
    </header>
  );
};
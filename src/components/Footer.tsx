import { Link } from "react-router-dom";
import { Shield, Gamepad2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto w-full border-t border-border/60 bg-background/55 py-6 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 zgames-heading font-extrabold zgames-text-gradient">
          <Gamepad2 className="size-4 text-primary" /> ZGames
        </Link>
          <Link
            to="/privacidade"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-cyan"
          >
            <Shield className="w-4 h-4" />
            <span>{t("privacyPolicy")}</span>
          </Link>
      </div>
    </footer>
  );
};

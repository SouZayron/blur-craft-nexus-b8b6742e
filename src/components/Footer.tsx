import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="glass-card px-6 py-4 flex items-center justify-center gap-6">
          <Link
            to="/privacidade"
            className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span>{t("privacyPolicy")}</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

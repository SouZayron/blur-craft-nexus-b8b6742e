import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="zgames-page zgames-grid-line flex min-h-screen items-center justify-center px-4">
      <div className="zgames-card max-w-md p-10 text-center">
        <p className="zgames-heading mb-2 text-sm font-bold uppercase text-cyan">ZGames</p>
        <h1 className="zgames-heading mb-4 text-5xl font-extrabold zgames-text-gradient">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t("notFoundDesc")}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {t("returnHome")}
        </a>
      </div>
    </div>
  );
};

export default NotFound;

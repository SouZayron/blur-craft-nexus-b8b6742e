import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";

export const CookieConsent = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (consent) return;

    // Defer rendering until after LCP to avoid the banner becoming the LCP element
    // and to remove its render delay from the critical path.
    const show = () => setIsVisible(true);
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const id = w.requestIdleCallback
      ? w.requestIdleCallback(show, { timeout: 2500 })
      : window.setTimeout(show, 1500);

    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-4 md:p-6 flex flex-col md:flex-row items-center gap-4">
          <Cookie className="w-8 h-8 text-primary flex-shrink-0" />
          <div className="flex-1 text-center md:text-left">
            <p className="text-foreground/80 text-sm md:text-base">
              {t("cookieMessage")}{" "}
              <Link to="/privacidade" className="text-primary hover:underline">
                {t("privacyPolicy")}
              </Link>
              .
            </p>
          </div>
          <Button 
            onClick={handleAccept}
            className="bg-primary hover:bg-primary/80 text-primary-foreground font-bold whitespace-nowrap"
          >
            {t("acceptCookies")}
          </Button>
        </div>
      </div>
    </div>
  );
};

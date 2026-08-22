import { useState, useRef, useEffect } from "react";
import { Music, Pause } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const FloatingRadio = () => {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://hts07.brascast.com:7130/live");
    audioRef.current.volume = 0.3;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <button
      onClick={togglePlay}
      type="button"
      aria-label={isPlaying ? `${t("pauseRadio")} ZGames` : `${t("playRadio")} ZGames`}
      aria-pressed={isPlaying}
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 ${
        isPlaying
          ? "bg-primary text-primary-foreground shadow-neon"
          : "bg-card/70 backdrop-blur-xl border border-border text-muted-foreground hover:border-cyan/60 hover:text-cyan"
      }`}
      title={isPlaying ? t("pauseRadio") : t("playRadio")}
    >
      {isPlaying ? (
        <Pause className="w-5 h-5" aria-hidden="true" />
      ) : (
        <Music className="w-5 h-5" aria-hidden="true" />
      )}

      {isPlaying && (
        <span aria-hidden="true" className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
      )}
    </button>
  );
};

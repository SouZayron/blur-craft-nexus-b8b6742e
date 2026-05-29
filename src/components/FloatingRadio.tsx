import { useState, useRef, useEffect } from "react";
import { Music, Pause } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const FloatingRadio = () => {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://hts02.brascast.com:11000/live");
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
      aria-label={isPlaying ? `${t("pauseRadio")} Labxat` : `${t("playRadio")} Labxat`}
      aria-pressed={isPlaying}
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 ${
        isPlaying
          ? "bg-gradient-to-r from-labxat-purple to-labxat-pink text-white"
          : "bg-background/80 backdrop-blur-md border border-white/20 text-foreground/70 hover:text-foreground"
      }`}
      title={isPlaying ? t("pauseRadio") : t("playRadio")}
    >
      {isPlaying ? (
        <Pause className="w-5 h-5" aria-hidden="true" />
      ) : (
        <Music className="w-5 h-5" aria-hidden="true" />
      )}

      {isPlaying && (
        <span aria-hidden="true" className="absolute inset-0 rounded-full bg-labxat-purple/30 animate-ping" />
      )}
    </button>
  );
};

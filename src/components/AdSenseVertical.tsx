import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdSenseVerticalProps {
  className?: string;
}

export const AdSenseVertical = ({ className = "" }: AdSenseVerticalProps) => {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;
    const tryPush = () => {
      try {
        if (window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushedRef.current = true;
          return true;
        }
      } catch (e) {
        // ignore
      }
      return false;
    };

    if (tryPush()) return;
    // AdSense script is loaded lazily on user interaction; retry until available
    const interval = setInterval(() => {
      if (tryPush()) clearInterval(interval);
    }, 1000);
    const timeout = setTimeout(() => clearInterval(interval), 30000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <aside
      className={`hidden xl:block sticky top-28 self-start ${className}`}
      aria-label="Publicidade"
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "160px", height: "600px" }}
        data-ad-client="ca-pub-9503578701144532"
        data-ad-slot="6685550238"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
};

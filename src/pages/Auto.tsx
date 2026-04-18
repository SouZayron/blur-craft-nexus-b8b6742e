import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Copy, Check } from "lucide-react";

const TOTAL = 90;
const INTERVAL_MS = 4000;

export default function Auto() {
  const [drawn, setDrawn] = useState<number[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoCopy, setAutoCopy] = useState(true);
  const timerRef = useRef<number | null>(null);

  const remaining = Array.from({ length: TOTAL }, (_, i) => i + 1).filter(
    (n) => !drawn.includes(n),
  );

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignored
    }
  };

  const drawNext = () => {
    setDrawn((prev) => {
      const left = Array.from({ length: TOTAL }, (_, i) => i + 1).filter(
        (n) => !prev.includes(n),
      );
      if (left.length === 0) {
        setRunning(false);
        return prev;
      }
      const next = left[Math.floor(Math.random() * left.length)];
      setCurrent(next);
      if (autoCopy) {
        void copyToClipboard(String(next));
      }
      return [...prev, next];
    });
  };

  useEffect(() => {
    if (!running) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    drawNext();
    timerRef.current = window.setInterval(drawNext, INTERVAL_MS);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const reset = () => {
    setRunning(false);
    setDrawn([]);
    setCurrent(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">
            Bingo <span className="text-labxat-purple">Auto</span> · MixHits
          </h1>
          <div className="text-xs text-foreground/60">
            Sorteados: {drawn.length}/{TOTAL}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[650px,1fr] gap-4">
          {/* Left - xat iframe */}
          <div className="rounded-xl overflow-hidden border border-white/10 bg-background/40 backdrop-blur-sm">
            <iframe
              src="https://xat.com/embed/chat.php#id=67226000&gn=MixHits"
              allow="clipboard-write"
              width={650}
              height={486}
              frameBorder={0}
              scrolling="no"
              title="Chat MixHits"
              className="block w-full"
            />
            <div className="p-3 text-xs text-foreground/70 bg-background/60">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://xat.com/MixHits"
                className="text-labxat-purple hover:underline"
              >
                Abrir MixHits no xat
              </a>
            </div>
          </div>

          {/* Right - roleta */}
          <div className="rounded-xl border border-white/10 bg-background/40 backdrop-blur-sm p-4 md:p-5 flex flex-col">
            {/* Current number */}
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="text-[10px] uppercase tracking-widest text-foreground/60 mb-2">
                Número atual
              </div>
              <div
                className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-labxat-pink/90 text-white flex items-center justify-center text-6xl md:text-7xl font-bold shadow-lg shadow-labxat-pink/30 transition-transform"
                style={{ transform: current ? "scale(1)" : "scale(0.95)" }}
              >
                {current ?? "—"}
              </div>

              {/* Copy status */}
              <div className="mt-3 h-6 flex items-center gap-2 text-sm">
                {current && (
                  <>
                    {copied ? (
                      <span className="flex items-center gap-1 text-labxat-green font-medium">
                        <Check className="w-4 h-4" /> Copiado! Cole no xat (Ctrl+V)
                      </span>
                    ) : (
                      <button
                        onClick={() => copyToClipboard(String(current))}
                        className="flex items-center gap-1 text-foreground/70 hover:text-labxat-purple transition-colors"
                      >
                        <Copy className="w-4 h-4" /> Copiar {current}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <Button
                onClick={() => setRunning((r) => !r)}
                disabled={remaining.length === 0}
                className="bg-labxat-purple hover:bg-labxat-purple/90"
              >
                {running ? (
                  <>
                    <Pause className="w-4 h-4 mr-1" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" /> Iniciar
                  </>
                )}
              </Button>
              <Button onClick={reset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-1" /> Reiniciar
              </Button>
              <label className="flex items-center gap-2 text-xs text-foreground/70 ml-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCopy}
                  onChange={(e) => setAutoCopy(e.target.checked)}
                  className="accent-labxat-purple"
                />
                Auto-copiar para o clipboard
              </label>
            </div>

            {/* Grid 1-90 */}
            <div className="grid grid-cols-10 gap-1 flex-1">
              {Array.from({ length: TOTAL }, (_, i) => i + 1).map((n) => {
                const isDrawn = drawn.includes(n);
                const isCurrent = n === current;
                return (
                  <div
                    key={n}
                    className={`aspect-square rounded-md flex items-center justify-center text-xs md:text-sm font-semibold transition-all ${
                      isCurrent
                        ? "bg-labxat-pink text-white scale-110 shadow-md shadow-labxat-pink/40"
                        : isDrawn
                          ? "bg-labxat-purple/70 text-white"
                          : "bg-background/60 text-foreground/60 border border-white/10"
                    }`}
                  >
                    {n}
                  </div>
                );
              })}
            </div>

            <p className="mt-3 text-[11px] text-foreground/50 text-center">
              ⚠️ O xat não permite envio automático via iframe (bloqueio cross-origin).
              O número é copiado e basta colar no chat com Ctrl+V + Enter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

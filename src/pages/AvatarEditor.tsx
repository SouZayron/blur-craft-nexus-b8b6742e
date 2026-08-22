import { Header } from "@/components/Header";
import { FloatingBlob } from "@/components/FloatingBlob";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Download, Square, Circle, Star, Heart } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

type Shape = "square" | "circle" | "star" | "heart";
type BorderType = "solid" | "gradient";

const PRESET_COLORS = [
  "#ff4d6d", "#ff8c42", "#ffd23f", "#06d6a0", "#118ab2",
  "#7209b7", "#f72585", "#ffffff", "#000000", "#9b87f5",
];

const PRESET_GRADIENTS = [
  ["#ff4d6d", "#7209b7"],
  ["#06d6a0", "#118ab2"],
  ["#ffd23f", "#ff4d6d"],
  ["#9b87f5", "#06d6a0"],
  ["#ff8c42", "#f72585"],
  ["#ffffff", "#000000"],
  ["#00f5d4", "#9b5de5"],
  ["#fee440", "#f15bb5"],
];

const SIZE = 512;

export const AvatarEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [shape, setShape] = useState<Shape>("circle");
  const [borderType, setBorderType] = useState<BorderType>("solid");
  const [borderColor, setBorderColor] = useState("#9b87f5");
  const [gradColors, setGradColors] = useState<[string, string]>(["#ff4d6d", "#7209b7"]);
  const [borderWidth, setBorderWidth] = useState(20);

  const drawShapePath = useCallback((ctx: CanvasRenderingContext2D, s: Shape, inset: number) => {
    const size = SIZE - inset * 2;
    const x = inset;
    const y = inset;
    ctx.beginPath();
    if (s === "square") {
      const r = size * 0.08;
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + size, y, x + size, y + size, r);
      ctx.arcTo(x + size, y + size, x, y + size, r);
      ctx.arcTo(x, y + size, x, y, r);
      ctx.arcTo(x, y, x + size, y, r);
      ctx.closePath();
    } else if (s === "circle") {
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
    } else if (s === "star") {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const spikes = 5;
      const outer = size / 2;
      const inner = outer * 0.45;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;
      ctx.moveTo(cx, cy - outer);
      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
        rot += step;
        ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
        rot += step;
      }
      ctx.lineTo(cx, cy - outer);
      ctx.closePath();
    } else if (s === "heart") {
      // Parametric heart, scaled to fit the bounding box nicely
      const cx = x + size / 2;
      const cy = y + size / 2;
      const scale = size / 32;
      const steps = 200;
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        const px = 16 * Math.pow(Math.sin(t), 3);
        const py = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const X = cx + px * scale;
        const Y = cy + py * scale;
        if (i === 0) ctx.moveTo(X, Y);
        else ctx.lineTo(X, Y);
      }
      ctx.closePath();
    }
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = SIZE;
    canvas.height = SIZE;
    ctx.clearRect(0, 0, SIZE, SIZE);

    const drawAll = (img: HTMLImageElement | null) => {
      // Border layer (full shape)
      if (borderWidth > 0) {
        ctx.save();
        drawShapePath(ctx, shape, 0);
        if (borderType === "gradient") {
          const g = ctx.createLinearGradient(0, 0, SIZE, SIZE);
          g.addColorStop(0, gradColors[0]);
          g.addColorStop(1, gradColors[1]);
          ctx.fillStyle = g;
        } else {
          ctx.fillStyle = borderColor;
        }
        ctx.fill();
        ctx.restore();
      }

      // Image clipped inside shape minus border
      ctx.save();
      drawShapePath(ctx, shape, borderWidth);
      ctx.clip();
      if (img) {
        // cover
        const inner = SIZE - borderWidth * 2;
        const ratio = Math.max(inner / img.width, inner / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        const dx = borderWidth + (inner - w) / 2;
        const dy = borderWidth + (inner - h) / 2;
        ctx.drawImage(img, dx, dy, w, h);
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.fillRect(0, 0, SIZE, SIZE);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "bold 24px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Envie uma foto", SIZE / 2, SIZE / 2);
      }
      ctx.restore();
    };

    if (imgSrc) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => drawAll(img);
      img.src = imgSrc;
    } else {
      drawAll(null);
    }
  }, [imgSrc, shape, borderType, borderColor, gradColors, borderWidth, drawShapePath]);

  useEffect(() => {
    render();
  }, [render]);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Envie uma imagem válida");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImgSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!imgSrc) {
      toast.error("Envie uma foto primeiro");
      return;
    }
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `avatar-zgames.png`;
    a.click();
    toast.success("Avatar baixado!");
  };

  const shapes: { key: Shape; label: string; Icon: typeof Square }[] = [
    { key: "square", label: "Quadrado", Icon: Square },
    { key: "circle", label: "Círculo", Icon: Circle },
    { key: "star", label: "Estrela", Icon: Star },
    { key: "heart", label: "Coração", Icon: Heart },
  ];

  return (
    <div className="min-h-screen animated-gradient-bg">
      <Header />
      <FloatingBlob color="purple" size="xl" position={{ top: "5%", left: "-5%" }} animation="float" />
      <FloatingBlob color="pink" size="lg" position={{ bottom: "10%", right: "-5%" }} animation="float-delayed" />

      <main className="relative z-10 max-w-6xl mx-auto px-4 pt-28 pb-16">
        <div className="text-center mb-8 fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Editor de <span className="text-gradient">Avatar</span>
          </h1>
          <p className="text-foreground/70 text-sm">
            Envie sua foto, escolha o formato e a borda, baixe em PNG sem fundo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Preview */}
          <GlassCard className="p-5 md:p-6 flex flex-col items-center justify-center fade-in-up">
            <div className="relative w-full max-w-[460px] aspect-square">
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.06) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.06) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.06) 75%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                  borderRadius: 16,
                }}
              />
            </div>

            <div className="flex gap-3 mt-5 w-full max-w-[460px]">
              <label className="flex-1">
                <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                <div className="cursor-pointer flex items-center justify-center gap-2 bg-background/40 hover:bg-background/60 border border-white/10 text-foreground font-medium py-3 rounded-xl transition-all">
                  <Upload className="w-4 h-4" /> Enviar foto
                </div>
              </label>
              <Button
                onClick={onDownload}
                className="flex-1 bg-labxat-purple hover:bg-labxat-purple/80 text-white font-bold py-3 rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" /> Download PNG
              </Button>
            </div>
          </GlassCard>

          {/* Controls */}
          <div className="flex flex-col gap-4 fade-in-up-delayed">
            {/* Shape */}
            <GlassCard className="p-4">
              <Label className="text-xs uppercase tracking-wider text-foreground/60 mb-3 block">Formato</Label>
              <div className="grid grid-cols-4 gap-2">
                {shapes.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    onClick={() => setShape(key)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                      shape === key
                        ? "bg-labxat-purple/30 border-labxat-purple text-foreground"
                        : "bg-background/30 border-white/10 text-foreground/70 hover:bg-background/50"
                    }`}
                    title={label}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px]">{label}</span>
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* Border type */}
            <GlassCard className="p-4">
              <Label className="text-xs uppercase tracking-wider text-foreground/60 mb-3 block">Borda</Label>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setBorderType("solid")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                    borderType === "solid"
                      ? "bg-labxat-purple/30 border-labxat-purple"
                      : "bg-background/30 border-white/10 text-foreground/70"
                  }`}
                >
                  Sólida
                </button>
                <button
                  onClick={() => setBorderType("gradient")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                    borderType === "gradient"
                      ? "bg-labxat-purple/30 border-labxat-purple"
                      : "bg-background/30 border-white/10 text-foreground/70"
                  }`}
                >
                  Degradê
                </button>
              </div>

              {borderType === "solid" ? (
                <>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setBorderColor(c)}
                        className={`aspect-square rounded-lg border-2 transition-all ${
                          borderColor === c ? "border-labxat-purple scale-110" : "border-white/20"
                        }`}
                        style={{ background: c }}
                        aria-label={c}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-foreground/60">Custom:</Label>
                    <Input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="h-9 w-16 p-1 cursor-pointer bg-background/30"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {PRESET_GRADIENTS.map((g, i) => {
                      const active = gradColors[0] === g[0] && gradColors[1] === g[1];
                      return (
                        <button
                          key={i}
                          onClick={() => setGradColors([g[0], g[1]])}
                          className={`h-10 rounded-lg border-2 transition-all ${
                            active ? "border-labxat-purple scale-105" : "border-white/20"
                          }`}
                          style={{ background: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }}
                        />
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={gradColors[0]}
                      onChange={(e) => setGradColors([e.target.value, gradColors[1]])}
                      className="h-9 w-full p-1 cursor-pointer bg-background/30"
                    />
                    <Input
                      type="color"
                      value={gradColors[1]}
                      onChange={(e) => setGradColors([gradColors[0], e.target.value])}
                      className="h-9 w-full p-1 cursor-pointer bg-background/30"
                    />
                  </div>
                </>
              )}
            </GlassCard>

            {/* Border width */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs uppercase tracking-wider text-foreground/60">Espessura</Label>
                <span className="text-xs text-foreground/70">{borderWidth}px</span>
              </div>
              <Slider
                value={[borderWidth]}
                min={0}
                max={60}
                step={1}
                onValueChange={(v) => setBorderWidth(v[0])}
              />
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AvatarEditor;

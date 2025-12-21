import { useState } from "react";
import { Header } from "@/components/Header";
import { FloatingBlob } from "@/components/FloatingBlob";
import { GlassCard } from "@/components/GlassCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Image, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface GraphicPack {
  id: string;
  title: string;
  thumbnail: string;
  images: string[];
}

// Pack IDs for translation lookup
const getGraphicPacks = (t: (key: string) => string): GraphicPack[] => [
  {
    id: "ano-novo",
    title: t("newYearBackgrounds"),
    thumbnail: "https://xatimg.com/image/DZ8hn01gLoPo.png",
    images: [
      "https://xatimg.com/image/DZ8hn01gLoPo.png",
      "https://xatimg.com/image/C2ELU7B8Bpke.png",
      "https://xatimg.com/image/3rfwfM6Cse3S.png",
      "https://xatimg.com/image/QariwUQME3QS.png",
      "https://xatimg.com/image/y2vVRrUCM2BG.png",
      "https://xatimg.com/image/lTv3KR9Yo23M.png",
      "https://xatimg.com/image/JZiLaweuLixn.png",
      "https://xatimg.com/image/xgbbizVmRtf8.png",
      "https://xatimg.com/image/hFbEg49CbgGJ.png",
      "https://xatimg.com/image/0zIft4dq8kA3.png",
    ],
  },
];

export const GraphicsFree = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const graphicPacks = getGraphicPacks(t);
  const [selectedPack, setSelectedPack] = useState<GraphicPack | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      toast.success(t("linkCopied"));
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error(t("copyLinkError"));
    }
  };

  return (
    <div className="min-h-screen animated-gradient-bg">
      <Header />

      {/* Floating Blobs */}
      <FloatingBlob color="green" size="xl" position={{ top: "5%", left: "-5%" }} animation="float" />
      <FloatingBlob color="blue" size="lg" position={{ top: "15%", right: "5%" }} animation="float-delayed" />
      <FloatingBlob color="purple" size="md" position={{ bottom: "20%", left: "10%" }} animation="float-slow" />
      <FloatingBlob color="pink" size="lg" position={{ bottom: "15%", right: "-5%" }} animation="float" />

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </button>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t("graphicsFree")}
          </h1>
          <p className="text-foreground/60">
            {t("graphicsFreeDesc")}
          </p>
        </div>

        {/* 3x2 Grid (6 blocks) */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {/* Actual packs */}
            {graphicPacks.map((pack) => (
              <button
                key={pack.id}
                onClick={() => setSelectedPack(pack)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-background/30 border border-border/30 hover:border-labxat-green/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-labxat-green/20"
              >
                <img
                  src={pack.thumbnail}
                  alt={pack.title}
                  className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                  <p className="text-white text-sm md:text-base font-semibold line-clamp-2 text-left">
                    {pack.title}
                  </p>
                  <p className="text-white/70 text-xs mt-1">
                    {pack.images.length} {t("images")}
                  </p>
                </div>
                <div className="absolute top-3 right-3 p-2 rounded-xl bg-labxat-green/90 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Image className="w-4 h-4 text-white" />
                </div>
              </button>
            ))}

            {/* Placeholder slots (5 remaining for total of 6) */}
            {Array.from({ length: 6 - graphicPacks.length }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="aspect-[4/3] rounded-2xl bg-background/20 border-2 border-dashed border-border/30 flex items-center justify-center backdrop-blur-sm"
              >
                <div className="text-center">
                  <span className="text-foreground/20 text-4xl block mb-2">+</span>
                  <span className="text-foreground/30 text-xs">{t("comingSoon")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Gallery Modal */}
      <Dialog open={!!selectedPack} onOpenChange={() => setSelectedPack(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold text-foreground">
              {selectedPack?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {selectedPack?.images.map((imageUrl, index) => (
              <GlassCard
                key={index}
                className="p-0 overflow-hidden"
              >
                {/* Image Preview 4:3 */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={`${selectedPack.title} - ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Copy Link Section */}
                <div className="p-3 flex items-center justify-between bg-background/50">
                  <span className="text-xs text-foreground/60 truncate flex-1 mr-2 font-mono">
                    {imageUrl.slice(0, 35)}...
                  </span>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(imageUrl, index)}
                    className={`shrink-0 gap-1.5 transition-all ${
                      copiedIndex === index
                        ? "bg-labxat-green text-white"
                        : "bg-labxat-green/10 border border-labxat-green/30 hover:bg-labxat-green/20 text-labxat-green"
                    }`}
                    variant={copiedIndex === index ? "default" : "outline"}
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span className="text-xs">{t("copied")}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-xs">{t("copyLink")}</span>
                      </>
                    )}
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GraphicsFree;

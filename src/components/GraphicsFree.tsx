import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download, Image } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface GraphicPack {
  id: string;
  title: string;
  thumbnail: string;
  images: string[];
}

const graphicPacks: GraphicPack[] = [
  {
    id: "ano-novo",
    title: "10 fundos de Ano Novo para o seu xat",
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
  const [selectedPack, setSelectedPack] = useState<GraphicPack | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      toast.success(t("linkCopied") || "Link copiado!");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error("Erro ao copiar link");
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl mb-8 md:mb-12">
        <GlassCard className="fade-in-up p-5 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-labxat-green/20 to-labxat-blue/20">
              <Download className="w-6 h-6 text-labxat-green" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                Graphics FREE
              </h2>
              <p className="text-sm text-foreground/60">
                {t("graphicsFreeDesc") || "Packs gratuitos para baixar"}
              </p>
            </div>
          </div>

          {/* 3x3 Grid */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {graphicPacks.map((pack) => (
              <button
                key={pack.id}
                onClick={() => setSelectedPack(pack)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-background/30 border border-border/30 hover:border-labxat-green/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-labxat-green/10"
              >
                <img
                  src={pack.thumbnail}
                  alt={pack.title}
                  className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
                  <p className="text-white text-xs md:text-sm font-medium line-clamp-2 text-left">
                    {pack.title}
                  </p>
                  <p className="text-white/60 text-xs mt-0.5">
                    {pack.images.length} {t("images") || "imagens"}
                  </p>
                </div>
                <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-labxat-green/90 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Image className="w-3 h-3 text-white" />
                </div>
              </button>
            ))}

            {/* Placeholder slots for future packs */}
            {Array.from({ length: 9 - graphicPacks.length }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="aspect-square rounded-xl bg-background/20 border border-dashed border-border/30 flex items-center justify-center"
              >
                <span className="text-foreground/30 text-2xl">+</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Gallery Modal */}
      <Dialog open={!!selectedPack} onOpenChange={() => setSelectedPack(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              {selectedPack?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {selectedPack?.images.map((imageUrl, index) => (
              <div
                key={index}
                className="group relative rounded-xl overflow-hidden bg-background/30 border border-border/30"
              >
                {/* Image Preview 4:3 */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={`${selectedPack.title} - ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Copy Link Button */}
                <div className="p-3 flex items-center justify-between bg-background/50">
                  <span className="text-xs text-foreground/60 truncate flex-1 mr-2">
                    {imageUrl}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(imageUrl, index)}
                    className="shrink-0 gap-1.5 bg-labxat-green/10 border-labxat-green/30 hover:bg-labxat-green/20 text-labxat-green"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span className="text-xs">{t("copied") || "Copiado"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-xs">{t("copyLink") || "Copiar"}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

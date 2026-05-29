import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const works = [
  { client: "NitroHITS", image: "https://xatimg.com/image/AivQhlTOmd7f.png" },
  { client: "Mixhits", image: "https://xatimg.com/image/7lzpjFK1BGKF.png" },
  { client: "MixHits", image: "https://xatimg.com/image/fL6y8nAHCncM.png" },
  { client: "Tuga", image: "https://xatimg.com/image/DvOy03BrD5nr.png" },
  { client: "Dia&Noite", image: "https://xatimg.com/image/l2DnnNKos1ki.png" },
  { client: "Wrs", image: "https://xatimg.com/image/G0FfhxIfDVr4.png" },
  { client: "Turma do Careca", image: "https://xatimg.com/image/tJo4gL6ZUpp1.png" },
  { client: "Rádio Boa Onda", image: "https://xatimg.com/image/CEB7zPK4keaw.png" },
  { client: "Avonts", image: "https://xatimg.com/image/djue4vNP3rvR.png" },
  { client: "Turma do Careca", image: "https://xatimg.com/image/2FBt85WIds00.png" },
  { client: "Italia", image: "https://xatimg.com/image/DXBt64jJ6rLE.png" },
  { client: "Turma do Careca", image: "https://xatimg.com/image/NHEaPGuQiJRT.png" },
  { client: "Rádio Boa Onda", image: "https://xatimg.com/image/n1koySspWPea.png" },
  { client: "Sociale", image: "https://xatimg.com/image/Jliu70y1wr9s.png" },
  { client: "Reven", image: "https://xatimg.com/image/371VpYkL8HGI.png" },
  { client: "Morgan", image: "https://xatimg.com/image/jzeAaM5euuWa.png" },
  { client: "Pythbots", image: "https://xatimg.com/image/EgtY9RfyPyUI.png" },
  { client: "Wrs", image: "https://xatimg.com/image/qCaF8e1oBThV.png" },
  { client: "Verão Mix Hits", image: "https://xatimg.com/image/eAwPS6OQi5Qb.png" },
];

export const Works = () => {
  const [selectedWork, setSelectedWork] = useState<{ client: string; image: string } | null>(null);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-4 py-12 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Meus Trabalhos
          </h1>
          <p className="text-muted-foreground text-lg">
            Uma seleção dos projetos que desenvolvi para meus clientes
          </p>
        </div>

        {/* Gallery Grid - Masonry style */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 max-w-6xl mx-auto">
          {works.map((work, index) => (
            <div 
              key={index}
              onClick={() => setSelectedWork(work)}
              className="group relative bg-card rounded-xl overflow-hidden shadow-lg border border-border/50 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-primary/30 cursor-pointer mb-4 break-inside-avoid"
            >
              <img 
                src={work.image} 
                alt={`Trabalho para ${work.client}`}
                className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white/20 font-bold text-4xl md:text-5xl rotate-[-25deg] select-none tracking-widest">
                  LABXAT
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
                <h3 className="text-white font-semibold text-lg drop-shadow-lg">
                  {work.client}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />

      {/* Lightbox Modal */}
      {selectedWork && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedWork(null)}
        >
          <button 
            onClick={() => setSelectedWork(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div 
            className="relative max-w-5xl max-h-[90vh] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedWork.image} 
              alt={`Trabalho para ${selectedWork.client}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
              <h3 className="text-white font-semibold text-xl text-center">
                {selectedWork.client}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Works;

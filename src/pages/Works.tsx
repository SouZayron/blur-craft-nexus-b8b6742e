import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
];

export const Works = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Meus Trabalhos
          </h1>
          <p className="text-muted-foreground text-lg">
            Uma seleção dos projetos que desenvolvi para meus clientes
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {works.map((work, index) => (
            <div 
              key={index}
              className="group relative bg-card rounded-xl overflow-hidden shadow-lg border border-border/50 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-primary/30"
            >
              <div className="aspect-video overflow-hidden">
                <img 
                  src={work.image} 
                  alt={`Trabalho para ${work.client}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
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
    </div>
  );
};

export default Works;

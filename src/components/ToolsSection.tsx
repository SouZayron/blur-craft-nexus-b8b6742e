import { ToolButton } from "./ToolButton";
import { FloatingBlob } from "./FloatingBlob";
import { Palette, Sparkles, Dices } from "lucide-react";

export const ToolsSection = () => {
  const tools = [
    {
      name: "Nicks Personalizados",
      icon: Sparkles,
      onClick: () => console.log("Nicks Personalizados clicked"),
    },
    {
      name: "Gerador de Cores",
      icon: Palette,
      onClick: () => console.log("Gerador de Cores clicked"),
    },
    {
      name: "Bingo 1–90",
      icon: Dices,
      onClick: () => console.log("Bingo clicked"),
    },
  ];

  return (
    <section className="relative py-24 md:py-32 px-4 overflow-hidden">
      {/* Background blobs */}
      <FloatingBlob
        color="green"
        size="lg"
        position={{ top: "10%", left: "-10%" }}
        animation="float-slow"
      />
      <FloatingBlob
        color="lilac"
        size="md"
        position={{ bottom: "20%", right: "-5%" }}
        animation="float"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16 scale-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Ferramentas Criativas
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Explore nosso laboratório digital e descubra ferramentas únicas
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {tools.map((tool, index) => (
            <div
              key={tool.name}
              className="scale-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <ToolButton onClick={tool.onClick} className="w-full flex items-center justify-center gap-3">
                <tool.icon className="w-5 h-5 md:w-6 md:h-6" />
                <span>{tool.name}</span>
              </ToolButton>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-labxat-blue/60" />
        <div className="w-2 h-2 rounded-full bg-labxat-purple/60" />
        <div className="w-2 h-2 rounded-full bg-labxat-pink/60" />
      </div>
    </section>
  );
};

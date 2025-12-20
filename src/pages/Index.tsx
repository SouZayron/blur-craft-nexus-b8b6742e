import { Header } from "@/components/Header";
import { FloatingBlob } from "@/components/FloatingBlob";
import { GlassCard } from "@/components/GlassCard";
import { ToolButton } from "@/components/ToolButton";
import { Palette, Sparkles, Dices } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const tools = [
    {
      name: "Nicks Personalizados",
      icon: Sparkles,
      onClick: () => navigate("/nicks"),
      gradient: "blue" as const,
    },
    {
      name: "Gerador de Cores",
      icon: Palette,
      onClick: () => navigate("/cores"),
      gradient: "purple" as const,
    },
    {
      name: "Bingo 1–90",
      icon: Dices,
      onClick: () => navigate("/bingo"),
      gradient: "pink" as const,
    },
  ];

  return (
    <div className="h-screen overflow-hidden animated-gradient-bg">
      <Header />

      {/* Floating Blobs */}
      <FloatingBlob color="blue" size="xl" position={{ top: "5%", left: "-5%" }} animation="float" />
      <FloatingBlob color="purple" size="lg" position={{ top: "15%", right: "5%" }} animation="float-delayed" />
      <FloatingBlob color="pink" size="md" position={{ bottom: "20%", left: "10%" }} animation="float-slow" />
      <FloatingBlob color="green" size="lg" position={{ bottom: "15%", right: "-5%" }} animation="float" />
      <FloatingBlob color="lilac" size="md" position={{ top: "45%", left: "60%" }} animation="float-delayed" />

      {/* Main Content */}
      <main className="relative z-10 h-full flex flex-col items-center justify-center px-4 pt-16">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <GlassCard className="fade-in-up inline-block">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4 text-gradient">
              Labxat
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl font-light text-foreground/80 tracking-[0.15em] uppercase">
              Experimente, Crie & Jogue!
            </p>
            <div className="mt-6 mx-auto w-20 h-1 bg-gradient-to-r from-labxat-blue via-labxat-purple to-labxat-pink rounded-full" />
          </GlassCard>
        </div>

        {/* Tools Section */}
        <div className="w-full max-w-4xl fade-in-up-delayed">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {tools.map((tool, index) => (
              <div
                key={tool.name}
                className="scale-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <ToolButton 
                  onClick={tool.onClick} 
                  gradient={tool.gradient} 
                  icon={tool.icon}
                  label={tool.name}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer inline */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
          <p className="text-muted-foreground text-xs">Feito com amor Zayron - 2025</p>
          <div className="mt-2 flex justify-center gap-1">
            <div className="w-8 h-0.5 rounded-full bg-labxat-blue/50" />
            <div className="w-8 h-0.5 rounded-full bg-labxat-purple/50" />
            <div className="w-8 h-0.5 rounded-full bg-labxat-pink/50" />
          </div>
        </div>
      </main>

      {/* Decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-labxat-blue/50 float" />
      <div className="absolute top-3/4 right-1/4 w-4 h-4 rounded-full bg-labxat-pink/50 float-delayed" />
      <div className="absolute top-1/2 right-1/3 w-2 h-2 rounded-full bg-labxat-purple/50 float-slow" />
    </div>
  );
};

export default Index;
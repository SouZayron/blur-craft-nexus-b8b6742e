import { GlassCard } from "./GlassCard";
import { FloatingBlob } from "./FloatingBlob";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Floating Blobs */}
      <FloatingBlob
        color="blue"
        size="xl"
        position={{ top: "5%", left: "-5%" }}
        animation="float"
      />
      <FloatingBlob
        color="purple"
        size="lg"
        position={{ top: "20%", right: "5%" }}
        animation="float-delayed"
      />
      <FloatingBlob
        color="pink"
        size="md"
        position={{ bottom: "15%", left: "10%" }}
        animation="float-slow"
      />
      <FloatingBlob
        color="green"
        size="lg"
        position={{ bottom: "10%", right: "-5%" }}
        animation="float"
      />
      <FloatingBlob
        color="lilac"
        size="md"
        position={{ top: "40%", left: "50%" }}
        animation="float-delayed"
      />

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <GlassCard className="fade-in-up">
          {/* Logo/Brand */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight mb-6 text-gradient">
            Labxat
          </h1>

          {/* Slogan */}
          <p className="text-xl md:text-2xl lg:text-3xl font-light text-foreground/80 tracking-[0.2em] uppercase fade-in-up-delayed">
            Experimente. Crie. Evolua.
          </p>

          {/* Decorative line */}
          <div className="mt-8 mx-auto w-24 h-1 bg-gradient-to-r from-labxat-blue via-labxat-purple to-labxat-pink rounded-full fade-in-up-delayed-2" />
        </GlassCard>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 fade-in-up-delayed-2">
          <div className="w-6 h-10 rounded-full border-2 border-foreground/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" />
          </div>
        </div>
      </div>

      {/* Additional floating circles */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-labxat-blue/50 float" />
      <div className="absolute top-3/4 right-1/4 w-6 h-6 rounded-full bg-labxat-pink/50 float-delayed" />
      <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-labxat-purple/50 float-slow" />
    </section>
  );
};

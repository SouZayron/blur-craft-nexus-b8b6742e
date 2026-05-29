import { GlassCard } from "./GlassCard";
import { FloatingBlob } from "./FloatingBlob";

export const HeroSection = () => {
  const smilies = [
    "(libro)", "(loalien)", "(locat)", "(locoffee)", "(locoffee2)",
    "(loglasses)", "(loheart)", "(lorose)", "(losword)", "(loworm)"
  ];

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

      {/* Main Content - News Block */}
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        <GlassCard className="fade-in-up p-6 md:p-8">
          {/* Header with Image and Title */}
          <div className="flex items-start gap-4 mb-6">
            <img 
              src="https://s0.xat.com/web_gear/chat/GetStrip8.php?c=a_(libro)_80" 
              alt="Libro Power" 
              className="w-20 h-20 rounded-xl object-contain bg-background/30 shadow-lg"
            />
            <div className="flex-1">
              <p className="text-sm uppercase tracking-wider text-labxat-purple font-semibold mb-1">
                Ultimo Power
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Libro <span className="text-foreground/60 text-lg">(ID: 744)</span>
              </h2>
              <p className="text-xs text-foreground/60 mt-1 italic">It is time to read.</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-background/30 rounded-lg p-3">
              <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">Status</p>
              <p className="text-foreground font-medium">Limited</p>
            </div>
            <div className="bg-background/30 rounded-lg p-3">
              <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">Group</p>
              <p className="text-foreground font-medium">❌</p>
            </div>
            <div className="bg-background/30 rounded-lg p-3">
              <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">Epic</p>
              <p className="text-foreground font-medium">❌</p>
            </div>
            <div className="bg-background/30 rounded-lg p-3">
              <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">Store Price</p>
              <p className="text-foreground font-medium">Desconhecido</p>
            </div>
            <div className="bg-background/30 rounded-lg p-3">
              <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">Trade Price</p>
              <p className="text-foreground font-medium">0 - 0 xats</p>
            </div>
            <div className="bg-background/30 rounded-lg p-3">
              <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">Trade Days</p>
              <p className="text-foreground font-medium">0 - 0 days</p>
            </div>
          </div>

          {/* Smilies Section */}
          <div className="bg-background/20 rounded-xl p-4">
            <p className="text-sm text-foreground/70 font-medium mb-3 uppercase tracking-wider">
              Smilies of the power:
            </p>
            <div className="flex flex-wrap gap-2">
              {smilies.map((smiley, index) => (
                <span 
                  key={index}
                  className="bg-labxat-purple/20 text-labxat-purple px-2 py-1 rounded-md text-sm font-mono"
                >
                  {smiley}
                </span>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Additional floating circles */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-labxat-blue/50 float" />
      <div className="absolute top-3/4 right-1/4 w-6 h-6 rounded-full bg-labxat-pink/50 float-delayed" />
      <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-labxat-purple/50 float-slow" />
    </section>
  );
};

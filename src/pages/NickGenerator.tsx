import { useState } from "react";
import { Header } from "@/components/Header";
import { FloatingBlob } from "@/components/FloatingBlob";
import { GlassCard } from "@/components/GlassCard";
import { fontStyles, transformText } from "@/data/fontStyles";
import { Copy, Check, Sparkles, Search } from "lucide-react";
import { toast } from "sonner";

export const NickGenerator = () => {
  const [inputName, setInputName] = useState("");
  const [generatedNicks, setGeneratedNicks] = useState<{ id: number; name: string; nick: string }[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const handleGenerate = () => {
    if (!inputName.trim()) {
      toast.error("Digite um nome para gerar os nicks!");
      return;
    }

    const nicks = fontStyles.map((style) => ({
      id: style.id,
      name: style.name,
      nick: transformText(inputName, style),
    }));

    setGeneratedNicks(nicks);
    toast.success(`${nicks.length} nicks gerados com sucesso!`);
  };

  const handleCopy = async (nick: string, id: number) => {
    try {
      await navigator.clipboard.writeText(nick);
      setCopiedId(id);
      toast.success("Nick copiado!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const filteredNicks = generatedNicks.filter(
    (item) =>
      item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.nick.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 gradient-bg opacity-30" />

      {/* Floating blobs */}
      <FloatingBlob color="blue" size="xl" position={{ top: "-10%", right: "-5%" }} animation="float" />
      <FloatingBlob color="purple" size="lg" position={{ bottom: "10%", left: "-10%" }} animation="float-delayed" />
      <FloatingBlob color="pink" size="md" position={{ top: "40%", right: "5%" }} animation="float-slow" />

      <Header />

      <main className="relative z-10 pt-24 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-gradient mb-3">
              Gerador de Nicks
            </h1>
            <p className="text-foreground/60 text-lg">
              Transforme seu nome em 139 estilos únicos
            </p>
          </div>

          {/* Input Section */}
          <GlassCard className="max-w-2xl mx-auto mb-8 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="Digite seu nome ou apelido..."
                className="flex-1 px-5 py-4 rounded-2xl bg-white/10 border border-white/20 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
                maxLength={30}
              />
              <button
                onClick={handleGenerate}
                className="px-8 py-4 rounded-2xl gradient-btn shimmer text-primary-foreground font-semibold text-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                <Sparkles className="w-5 h-5" />
                Gerar
              </button>
            </div>
          </GlassCard>

          {/* Results Section */}
          {generatedNicks.length > 0 && (
            <>
              {/* Search Filter */}
              <div className="max-w-md mx-auto mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filtrar estilos..."
                    className="w-full pl-12 pr-5 py-3 rounded-xl bg-white/10 border border-white/20 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Results Count */}
              <p className="text-center text-foreground/60 mb-6">
                Mostrando {filteredNicks.length} de {generatedNicks.length} estilos
              </p>

              {/* Nicks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {filteredNicks.map((item) => (
                  <GlassCard
                    key={item.id}
                    className="p-4 group cursor-pointer hover:bg-white/15 transition-all"
                    onClick={() => handleCopy(item.nick, item.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground/50 mb-1 truncate">
                          #{item.id} • {item.name}
                        </p>
                        <p className="text-xl font-medium text-foreground break-all leading-relaxed">
                          {item.nick}
                        </p>
                      </div>
                      <button
                        className={`p-2 rounded-lg transition-all ${
                          copiedId === item.id
                            ? "bg-green-500/20 text-green-400"
                            : "bg-white/10 text-foreground/60 hover:bg-white/20 hover:text-foreground"
                        }`}
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {generatedNicks.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-primary/60" />
              </div>
              <p className="text-foreground/50 text-lg">
                Digite um nome e clique em Gerar para ver a mágica acontecer!
              </p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.5);
        }
      `}</style>
    </div>
  );
};

export default NickGenerator;

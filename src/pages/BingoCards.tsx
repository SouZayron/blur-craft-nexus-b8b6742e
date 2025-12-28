import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { FloatingBlob } from "@/components/FloatingBlob";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { LayoutGrid, Shuffle, Link2, Copy, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface GeneratedCard {
  id: number;
  numbers: number[];
  userName: string;
  title: string;
  subtitle: string;
}

// Generate unique random numbers between 1 and 90
function generateCardNumbers(): number[] {
  const numbers: number[] = [];
  while (numbers.length < 25) {
    const num = Math.floor(Math.random() * 90) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
}

// Encode card data to URL-safe string
function encodeCardData(card: GeneratedCard): string {
  const data = {
    n: card.numbers,
    u: card.userName,
    t: card.title,
    s: card.subtitle,
    i: card.id,
  };
  return btoa(JSON.stringify(data));
}

export function BingoCards() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [title, setTitle] = useState("Bingo xat");
  const [subtitle, setSubtitle] = useState("Boa sorte!");
  const [quantity, setQuantity] = useState(1);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleGenerate = () => {
    if (!userName.trim()) {
      toast.error("Digite o nome do usuário");
      return;
    }

    const cards: GeneratedCard[] = [];
    for (let i = 0; i < quantity; i++) {
      cards.push({
        id: i + 1,
        numbers: generateCardNumbers(),
        userName: userName.trim(),
        title: title.trim() || "Bingo xat",
        subtitle: subtitle.trim() || "Boa sorte!",
      });
    }
    setGeneratedCards(cards);
    toast.success(`${quantity} cartela${quantity > 1 ? "s" : ""} gerada${quantity > 1 ? "s" : ""} com sucesso!`);
  };

  const getCardUrl = (card: GeneratedCard) => {
    const encoded = encodeCardData(card);
    return `${window.location.origin}/bingo/cartela/${encoded}`;
  };

  const copyLink = async (card: GeneratedCard) => {
    const url = getCardUrl(card);
    await navigator.clipboard.writeText(url);
    setCopiedId(card.id);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openCard = (card: GeneratedCard) => {
    const encoded = encodeCardData(card);
    navigate(`/bingo/cartela/${encoded}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-x-hidden">
      {/* Background Effects */}
      <FloatingBlob color="blue" size="lg" position={{ top: "-10%", left: "-5%" }} animation="float" />
      <FloatingBlob color="purple" size="md" position={{ top: "30%", right: "-10%" }} animation="float-delayed" />
      <FloatingBlob color="pink" size="sm" position={{ bottom: "20%", left: "10%" }} animation="float-slow" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <Header />

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-labxat-blue via-labxat-purple to-labxat-pink bg-clip-text text-transparent mb-2">
            Gerador de Cartelas
          </h1>
          <p className="text-muted-foreground">
            Crie cartelas personalizadas para o Bingo xat
          </p>
        </div>

        {/* Form */}
        <GlassCard className="p-6 mb-8">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="userName" className="text-foreground">Nome do usuário</Label>
              <Input
                id="userName"
                placeholder="Digite seu nome..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-background/50 border-border/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-foreground">Título da cartela</Label>
                <Input
                  id="title"
                  placeholder="Bingo xat"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subtitle" className="text-foreground">Subtítulo</Label>
                <Input
                  id="subtitle"
                  placeholder="Boa sorte!"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="bg-background/50 border-border/50"
                />
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Quantidade de cartelas</Label>
                <span className="text-lg font-bold text-labxat-purple">{quantity}</span>
              </div>
              <Slider
                value={[quantity]}
                onValueChange={(value) => setQuantity(value[0])}
                min={1}
                max={50}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>50</span>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              className="w-full bg-gradient-to-r from-labxat-blue to-labxat-purple hover:brightness-110 text-white font-semibold py-6"
            >
              <Shuffle className="w-5 h-5 mr-2" />
              Gerar Cartelas
            </Button>
          </div>
        </GlassCard>

        {/* Generated Cards List */}
        {generatedCards.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-labxat-purple" />
              Cartelas Geradas ({generatedCards.length})
            </h2>

            <div className="grid gap-4">
              {generatedCards.map((card) => (
                <GlassCard key={card.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-labxat-purple to-labxat-pink flex items-center justify-center text-white font-bold">
                        #{card.id}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{card.title}</p>
                        <p className="text-sm text-muted-foreground">{card.userName}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(card)}
                        className="flex-1 sm:flex-none"
                      >
                        {copiedId === card.id ? (
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        Copiar Link
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openCard(card)}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-labxat-blue to-labxat-purple text-white"
                      >
                        <Link2 className="w-4 h-4 mr-2" />
                        Abrir
                      </Button>
                    </div>
                  </div>

                  {/* Preview of numbers */}
                  <div className="mt-4 flex flex-wrap gap-1">
                    {card.numbers.slice(0, 10).map((num) => (
                      <span
                        key={num}
                        className="w-8 h-8 rounded bg-background/50 flex items-center justify-center text-xs font-medium text-muted-foreground"
                      >
                        {num}
                      </span>
                    ))}
                    <span className="w-8 h-8 rounded bg-background/50 flex items-center justify-center text-xs font-medium text-muted-foreground">
                      ...
                    </span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

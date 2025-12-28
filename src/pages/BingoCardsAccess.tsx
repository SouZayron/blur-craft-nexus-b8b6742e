import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { FloatingBlob } from "@/components/FloatingBlob";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, LayoutGrid, Link2, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { cardThemes, ThemeKey } from "./BingoCards";

interface UserCard {
  id: string;
  cardNumber: number;
  numbers: number[];
  title: string;
  subtitle: string;
  theme: string;
}

export function BingoCardsAccess() {
  const { userName } = useParams<{ userName: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState<UserCard[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userDisplayName, setUserDisplayName] = useState("");

  const handleLogin = async () => {
    if (!password.trim()) {
      toast.error("Digite a senha");
      return;
    }

    setIsLoading(true);

    try {
      // Check if password matches for this user
      const { data, error } = await supabase
        .from("bingo_cards")
        .select("*")
        .eq("user_name", userName)
        .eq("user_password", password.trim());

      if (error) {
        console.error("Error checking password:", error);
        toast.error("Erro ao verificar senha");
        return;
      }

      if (!data || data.length === 0) {
        toast.error("Senha incorreta ou usuário não encontrado");
        return;
      }

      // Password correct, load all cards
      setCards(data.map((card) => ({
        id: card.id,
        cardNumber: card.card_number,
        numbers: card.numbers,
        title: card.title,
        subtitle: card.subtitle,
        theme: card.theme,
      })));

      setUserDisplayName(userName || "");
      setIsAuthenticated(true);
      toast.success("Acesso liberado!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Erro ao acessar");
    } finally {
      setIsLoading(false);
    }
  };

  const getCardUrl = (card: UserCard) => {
    return `${window.location.origin}/bingo/cartela/${userName}/${card.cardNumber}`;
  };

  const copyLink = async (card: UserCard) => {
    const url = getCardUrl(card);
    await navigator.clipboard.writeText(url);
    setCopiedId(card.id);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openCard = (card: UserCard) => {
    navigate(`/bingo/cartela/${userName}/${card.cardNumber}`);
  };

  if (!userName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center">
        <p className="text-muted-foreground">Usuário não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-x-hidden">
      <FloatingBlob color="blue" size="lg" position={{ top: "-10%", left: "-5%" }} animation="float" />
      <FloatingBlob color="purple" size="md" position={{ top: "30%", right: "-10%" }} animation="float-delayed" />
      <FloatingBlob color="pink" size="sm" position={{ bottom: "20%", left: "10%" }} animation="float-slow" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <Header />

        <Button
          variant="ghost"
          onClick={() => navigate("/cartelas")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {!isAuthenticated ? (
          // Login Form
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-labxat-purple to-labxat-pink flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-labxat-blue via-labxat-purple to-labxat-pink bg-clip-text text-transparent mb-2">
                Acessar Cartelas
              </h1>
              <p className="text-muted-foreground">
                Usuário: <span className="font-semibold text-foreground">{userName}</span>
              </p>
            </div>

            <GlassCard className="p-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-foreground">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-labxat-blue to-labxat-purple hover:brightness-110 text-white font-semibold py-5"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Acessar
                    </>
                  )}
                </Button>
              </div>
            </GlassCard>
          </div>
        ) : (
          // Cards List
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-labxat-blue via-labxat-purple to-labxat-pink bg-clip-text text-transparent mb-2">
                Minhas Cartelas
              </h1>
              <p className="text-muted-foreground">
                Usuário: <span className="font-semibold text-foreground">{userDisplayName}</span> • {cards.length} cartela{cards.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid gap-4">
              {cards.map((card) => {
                const theme = cardThemes[card.theme as ThemeKey] || cardThemes.purple;
                return (
                  <GlassCard key={card.id} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold",
                          theme.preview
                        )}>
                          #{card.cardNumber}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{card.title}</p>
                          <p className="text-sm text-muted-foreground">{theme.name}</p>
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
                          className={cn(
                            "flex-1 sm:flex-none bg-gradient-to-r text-white",
                            theme.preview
                          )}
                        >
                          <Link2 className="w-4 h-4 mr-2" />
                          Abrir
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {card.numbers.slice(0, 10).map((num) => (
                        <span
                          key={num}
                          className={cn(
                            "w-8 h-8 rounded bg-gradient-to-br flex items-center justify-center text-xs font-medium text-foreground",
                            theme.numberBg
                          )}
                        >
                          {num}
                        </span>
                      ))}
                      <span className={cn(
                        "w-8 h-8 rounded bg-gradient-to-br flex items-center justify-center text-xs font-medium text-foreground",
                        theme.numberBg
                      )}>
                        ...
                      </span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

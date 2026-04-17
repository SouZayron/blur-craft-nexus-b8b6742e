import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ANIMALS, ANIMAL_EMOJIS, INVERTIDOS_BLOCKS, SEQUENCES_BLOCKS, GAME_NAMES, GAME_ICONS } from "@/data/gameData";
import { Copy, Check, Clock, Gamepad2, LogIn } from "lucide-react";

interface GameRoom {
  id: string;
  game_type: string;
  is_open: boolean;
}

interface GamePlayer {
  id: string;
  name: string;
  is_approved: boolean;
}

interface GamePick {
  id: string;
  room_id: string;
  player_id: string;
  pick_value: string;
}

export const Games = () => {
  const [playerName, setPlayerName] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState<GamePlayer | null>(null);
  const [activeRoom, setActiveRoom] = useState<GameRoom | null>(null);
  const [picks, setPicks] = useState<GamePick[]>([]);
  const [allPlayers, setAllPlayers] = useState<GamePlayer[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    const { data: roomData } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("is_open", true)
      .limit(1)
      .maybeSingle();

    setActiveRoom(roomData as GameRoom | null);

    if (roomData) {
      const { data: picksData } = await supabase
        .from("game_picks")
        .select("*")
        .eq("room_id", roomData.id);
      setPicks((picksData || []) as GamePick[]);
    } else {
      setPicks([]);
    }

    const { data: playersData } = await supabase
      .from("game_players")
      .select("*");
    setAllPlayers((playersData || []) as GamePlayer[]);

    const savedId = localStorage.getItem("game_player_id");
    if (savedId) {
      const { data: playerData } = await supabase
        .from("game_players")
        .select("*")
        .eq("id", savedId)
        .maybeSingle();
      if (playerData) {
        setCurrentPlayer(playerData as GamePlayer);
      } else {
        localStorage.removeItem("game_player_id");
        setCurrentPlayer(null);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel("games-page-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "game_rooms" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "game_picks" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "game_players" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const handleJoin = async () => {
    if (!playerName.trim()) {
      toast({ title: "Digite seu nome", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("game_players")
      .insert({ name: playerName.trim() })
      .select()
      .single();

    if (error) {
      toast({ title: "Erro ao entrar", variant: "destructive" });
      setLoading(false);
      return;
    }
    localStorage.setItem("game_player_id", data.id);
    setCurrentPlayer(data as GamePlayer);
    toast({ title: "Aguardando aprovação do admin..." });
    setLoading(false);
  };

  const myPicks = currentPlayer ? picks.filter(p => p.player_id === currentPlayer.id) : [];
  const hasSelected = myPicks.length > 0;

  const handleSelectBlock = async (block: string) => {
    if (!currentPlayer || !activeRoom || hasSelected) return;
    const taken = picks.map(p => p.pick_value);
    if (taken.includes(block)) return;

    setLoading(true);
    const { error } = await supabase.from("game_picks").insert({
      room_id: activeRoom.id,
      player_id: currentPlayer.id,
      pick_value: block
    });
    if (error) {
      toast({ title: "Erro ao selecionar", variant: "destructive" });
    } else {
      toast({ title: "Selecionado!" });
    }
    setLoading(false);
  };

  const getPickOwner = (value: string) => {
    const pick = picks.find(p => p.pick_value === value);
    if (!pick) return null;
    const player = allPlayers.find(pl => pl.id === pick.player_id);
    return player?.name || "Ocupado";
  };

  const handleCopy = () => {
    if (!activeRoom || myPicks.length === 0) return;
    const value = myPicks[0].pick_value;
    let text = "";
    if (activeRoom.game_type === 'animals') {
      text = `${ANIMAL_EMOJIS[value] || ''} ${value}`;
    } else {
      text = value;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copiado!" });
  };

  const getMaxSlots = () => {
    if (!activeRoom) return 0;
    if (activeRoom.game_type === 'animals') return ANIMALS.length;
    if (activeRoom.game_type === 'invertidos') return INVERTIDOS_BLOCKS.length;
    return SEQUENCES_BLOCKS.length;
  };

  const allSlotsFull = activeRoom ? picks.length >= getMaxSlots() : false;

  // --- RENDER STATES ---

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Games
            </h1>
            <p className="text-muted-foreground text-sm mt-2">Entre com seu nome para jogar</p>
          </div>
          <div className="space-y-4">
            <Input
              placeholder="Seu nome"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              className="bg-white/5 border-white/10"
            />
            <Button
              onClick={handleJoin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPlayer.is_approved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4 animate-pulse shadow-lg shadow-yellow-500/25">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Aguardando Aprovação</h2>
          <p className="text-muted-foreground text-sm">
            Olá, <span className="text-purple-400 font-semibold">{currentPlayer.name}</span>!
            Aguarde o admin aprovar sua entrada.
          </p>
        </div>
      </div>
    );
  }

  if (!activeRoom || !activeRoom.is_open) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Aguarde a Próxima Rodada</h2>
          <p className="text-muted-foreground text-sm">Nenhum jogo ativo no momento. Fique atento!</p>
        </div>
      </div>
    );
  }

  if (hasSelected) {
    const gameName = GAME_NAMES[activeRoom.game_type] || activeRoom.game_type;
    const gameIcon = GAME_ICONS[activeRoom.game_type] || "🎮";
    const value = myPicks[0].pick_value;
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-green-500/30 rounded-2xl p-8 shadow-2xl text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-green-500/25">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-green-400 mb-4">Seleção Confirmada!</h2>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4 mb-4 text-left space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">{gameIcon} {gameName}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              👤 <span className="text-foreground">{currentPlayer.name}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {activeRoom.game_type === 'animals' ? '🐾 Animal: ' : '📋 Bloco: '}
              <span className="text-foreground font-mono text-lg">
                {activeRoom.game_type === 'animals' ? `${ANIMAL_EMOJIS[value] || ''} ${value}` : value}
              </span>
            </p>
          </div>

          <Button
            onClick={handleCopy}
            className={`w-full ${copied
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90'}`}
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copiado!" : "Copiar"}
          </Button>
        </div>
      </div>
    );
  }

  if (allSlotsFull) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-yellow-500/30 rounded-2xl p-8 shadow-2xl text-center">
          <h2 className="text-xl font-bold text-yellow-400 mb-2">Todas as opções preenchidas!</h2>
          <p className="text-muted-foreground text-sm">Aguarde a próxima rodada.</p>
        </div>
      </div>
    );
  }

  // --- GAME BOARD ---
  const gameName = GAME_NAMES[activeRoom.game_type] || activeRoom.game_type;
  const gameIcon = GAME_ICONS[activeRoom.game_type] || "🎮";
  const takenValues = picks.map(p => p.pick_value);

  const renderItems = activeRoom.game_type === 'animals'
    ? ANIMALS
    : activeRoom.game_type === 'invertidos'
      ? INVERTIDOS_BLOCKS
      : SEQUENCES_BLOCKS;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            {gameIcon} {gameName}
          </h1>
          <p className="text-muted-foreground text-sm">
            Olá, <span className="text-purple-400 font-semibold">{currentPlayer.name}</span>! Selecione 1 {activeRoom.game_type === 'animals' ? 'animal' : 'bloco'}.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            {picks.length}/{getMaxSlots()} selecionados
          </p>
        </div>

        <div className={`grid gap-3 ${activeRoom.game_type === 'animals' ? 'grid-cols-3 sm:grid-cols-5 md:grid-cols-7' : 'grid-cols-3 sm:grid-cols-5 md:grid-cols-6'}`}>
          {renderItems.map(item => {
            const taken = takenValues.includes(item);
            const owner = getPickOwner(item);
            return (
              <button
                key={item}
                onClick={() => handleSelectBlock(item)}
                disabled={taken || loading}
                className={`
                  p-3 rounded-xl transition-all duration-300 min-h-[70px] flex flex-col items-center justify-center
                  ${taken
                    ? 'bg-red-500/10 opacity-70 cursor-not-allowed'
                    : 'backdrop-blur-md bg-white/5 border border-white/10 hover:border-purple-500/50 hover:scale-105 cursor-pointer'
                  }
                `}
              >
                {activeRoom.game_type === 'animals' ? (
                  <>
                    <span className="text-2xl">{ANIMAL_EMOJIS[item] || '🐾'}</span>
                    <span className="text-xs mt-1 text-foreground truncate max-w-full">{item}</span>
                  </>
                ) : (
                  <span className="text-base font-bold font-mono text-foreground">{item}</span>
                )}
                {owner && <span className="text-[10px] text-red-400 truncate max-w-full mt-1 font-semibold">{owner}</span>}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded backdrop-blur-md bg-white/5 border border-white/10" />
            <span className="text-muted-foreground">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500/10" />
            <span className="text-muted-foreground">Ocupado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;

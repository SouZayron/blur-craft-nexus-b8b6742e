import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeTables } from "@/hooks/useRealtimeTables";
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
  xat_id: string | null;
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
  const [xatId, setXatId] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState<GamePlayer | null>(null);
  const [activeRoom, setActiveRoom] = useState<GameRoom | null>(null);
  const [picks, setPicks] = useState<GamePick[]>([]);
  const [allPlayers, setAllPlayers] = useState<GamePlayer[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
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

  useRealtimeTables({
    channelName: "games-page-realtime",
    onSync: fetchData,
    tables: ["game_rooms", "game_picks", "game_players"],
  });

  const handleJoin = async () => {
    if (!playerName.trim() || !xatId.trim()) {
      toast({ title: "Digite seu nome e ID do xat", variant: "destructive" });
      return;
    }
    setLoading(true);

    // Verifica se já existe um jogador com mesmo nome+ID (já aprovado anteriormente)
    const { data: existing } = await supabase
      .from("game_players")
      .select("*")
      .eq("name", playerName.trim())
      .eq("xat_id", xatId.trim())
      .maybeSingle();

    if (existing) {
      localStorage.setItem("game_player_id", existing.id);
      setCurrentPlayer(existing as GamePlayer);
      toast({
        title: existing.is_approved ? `Bem-vindo de volta, ${existing.name}!` : "Aguardando aprovação..."
      });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("game_players")
      .insert({ name: playerName.trim(), xat_id: xatId.trim() })
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
  const maxPicks = activeRoom?.game_type === 'animals' ? 2 : 1;
  const reachedLimit = myPicks.length >= maxPicks;

  const handleSelectBlock = async (block: string) => {
    if (!currentPlayer || !activeRoom || reachedLimit) return;
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
    return { name: player?.name || "Ocupado", playerId: pick.player_id };
  };

  const handleCopyBlock = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopiedKey(value);
    setTimeout(() => setCopiedKey(null), 2000);
    toast({ title: "Copiado!" });
  };

  const handleCopyAnimalsCombo = () => {
    const text = myPicks.map(p => p.pick_value).join(' - ');
    navigator.clipboard.writeText(text);
    setCopiedKey('combo');
    setTimeout(() => setCopiedKey(null), 2000);
    toast({ title: "Copiado!" });
  };

  const getMaxSlots = () => {
    if (!activeRoom) return 0;
    if (activeRoom.game_type === 'animals') return ANIMALS.length;
    if (activeRoom.game_type === 'invertidos') return INVERTIDOS_BLOCKS.length;
    return SEQUENCES_BLOCKS.length;
  };

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
            <p className="text-muted-foreground text-sm mt-2">Entre com seu nome e ID do xat</p>
          </div>
          <div className="space-y-4">
            <Input
              placeholder="Seu nome"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              className="bg-white/5 border-white/10"
            />
            <Input
              placeholder="ID do xat"
              value={xatId}
              onChange={(e) => setXatId(e.target.value)}
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
            Olá, <span className="text-purple-400 font-semibold">{currentPlayer.name}</span>!{" "}
            {activeRoom.game_type === 'animals'
              ? (reachedLimit
                  ? `Você selecionou seus 2 animais (${myPicks.length}/2). Copie a combinação ao lado.`
                  : `Você precisa selecionar 2 animais (${myPicks.length}/2).`)
              : (reachedLimit
                  ? `Você já selecionou ${myPicks.length}/${maxPicks}. Clique em copiar.`
                  : `Selecione ${maxPicks} bloco (${myPicks.length}/${maxPicks}).`)}
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            {picks.length}/{getMaxSlots()} ocupados no total
          </p>
        </div>

        <div className={activeRoom.game_type === 'animals' ? 'grid gap-4 lg:grid-cols-[1fr_300px] items-start' : ''}>
          <div className={`grid gap-3 ${activeRoom.game_type === 'animals' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-3 sm:grid-cols-5 md:grid-cols-6'}`}>
            {renderItems.map(item => {
              const taken = takenValues.includes(item);
              const owner = getPickOwner(item);
              const isMine = owner?.playerId === currentPlayer.id;
              const isCopied = copiedKey === item;
              return (
                <button
                  key={item}
                  onClick={() => handleSelectBlock(item)}
                  disabled={taken || loading || reachedLimit}
                  className={`
                    relative p-3 rounded-xl transition-all duration-300 min-h-[80px] flex flex-col items-center justify-center
                    ${isMine
                      ? 'bg-green-500/15 border border-green-500/50 cursor-default'
                      : taken
                        ? 'bg-red-500/10 opacity-70 cursor-not-allowed border border-transparent'
                        : reachedLimit
                          ? 'backdrop-blur-md bg-white/5 border border-white/5 opacity-50 cursor-not-allowed'
                          : 'backdrop-blur-md bg-white/5 border border-white/10 hover:border-purple-500/50 hover:scale-105 cursor-pointer'
                    }
                  `}
                >
                  {activeRoom.game_type === 'animals' ? (
                    <span className="text-base font-semibold text-foreground text-center leading-tight">{item}</span>
                  ) : (
                    <span className="text-base font-bold font-mono text-foreground">{item}</span>
                  )}
                  {owner && (
                    <span className={`text-[10px] truncate max-w-full mt-1 font-semibold ${isMine ? 'text-green-400' : 'text-red-400'}`}>
                      {owner.name}
                    </span>
                  )}
                  {isMine && activeRoom.game_type !== 'animals' && (
                    <span
                      role="button"
                      onClick={(e) => handleCopyBlock(e, item)}
                      className={`mt-1.5 inline-flex items-center justify-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md cursor-pointer transition-colors ${
                        isCopied
                          ? 'bg-green-500 text-white'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                      }`}
                    >
                      {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {isCopied ? 'Copiado' : 'Copiar'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {activeRoom.game_type === 'animals' && myPicks.length > 0 && (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 lg:sticky lg:top-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Sua combinação</h3>
              <div className="bg-background/40 border border-white/10 rounded-lg p-4 mb-3 text-center">
                <span className="text-lg font-bold text-foreground break-words">
                  {myPicks.map(p => p.pick_value).join(' - ')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {myPicks.length < 2
                  ? `Falta selecionar ${2 - myPicks.length} animal.`
                  : 'Pronto! Copie e envie.'}
              </p>
              <Button
                onClick={handleCopyAnimalsCombo}
                disabled={myPicks.length === 0}
                className={`w-full ${copiedKey === 'combo' ? 'bg-green-500 hover:bg-green-500' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90'}`}
              >
                {copiedKey === 'combo' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copiedKey === 'combo' ? 'Copiado!' : 'Copiar combinação'}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded backdrop-blur-md bg-white/5 border border-white/10" />
            <span className="text-muted-foreground">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500/15 border border-green-500/50" />
            <span className="text-muted-foreground">Sua seleção</span>
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

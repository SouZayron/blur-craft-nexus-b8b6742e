import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeTables } from "@/hooks/useRealtimeTables";
import { ANIMALS, ANIMAL_EMOJIS, INVERTIDOS_BLOCKS, SEQUENCES_BLOCKS, RHYTHMS, RHYTHM_EMOJIS, GAME_NAMES, GAME_ICONS } from "@/data/gameData";
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
  const [currentPlayer, setCurrentPlayer] = useState<GamePlayer | null>(null);
  const [activeRoom, setActiveRoom] = useState<GameRoom | null>(null);
  const [picks, setPicks] = useState<GamePick[]>([]);
  const [allPlayers, setAllPlayers] = useState<GamePlayer[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
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
    if (!playerName.trim()) {
      toast({ title: "Digite seu nome", variant: "destructive" });
      return;
    }
    setLoading(true);

    // Verifica se já existe um jogador com mesmo nome (case-insensitive)
    const { data: existing } = await supabase
      .from("game_players")
      .select("*")
      .ilike("name", playerName.trim())
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
  const maxPicks = (activeRoom?.game_type === 'animals' || activeRoom?.game_type === 'rhythms') ? 2 : 1;
  const reachedLimit = myPicks.length >= maxPicks;

  const handleSelectBlock = async (block: string) => {
    if (!currentPlayer || !activeRoom || reachedLimit) return;
    if (submittingRef.current) return; // bloqueia duplo-clique síncrono
    const taken = picks.map(p => p.pick_value);
    if (taken.includes(block)) return;

    submittingRef.current = true;
    setLoading(true);
    const { error } = await supabase.from("game_picks").insert({
      room_id: activeRoom.id,
      player_id: currentPlayer.id,
      pick_value: block
    });
    if (error) {
      // 23505 = unique_violation (alguém pegou primeiro)
      // check_violation = limite de seleções atingido
      if (error.code === '23505') {
        toast({ title: "Esse bloco acabou de ser ocupado", variant: "destructive" });
      } else if (error.message?.includes('Limite')) {
        toast({ title: "Você já atingiu o limite de seleções", variant: "destructive" });
      } else {
        toast({ title: "Erro ao selecionar", variant: "destructive" });
      }
      await fetchData();
    } else {
      toast({ title: "Selecionado!" });
    }
    setLoading(false);
    submittingRef.current = false;
  };

  const getPickOwner = (value: string) => {
    const pick = picks.find(p => p.pick_value === value);
    if (!pick) return null;
    const player = allPlayers.find(pl => pl.id === pick.player_id);
    return { name: player?.name || "Ocupado", playerId: pick.player_id };
  };

  const copyText = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyBlock = async (e: React.MouseEvent | React.TouchEvent, value: string) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await copyText(value);
    setCopiedKey(value);
    setTimeout(() => setCopiedKey(null), 2000);
    toast({ title: ok ? "Copiado!" : "Erro ao copiar", variant: ok ? "default" : "destructive" });
  };

  const handleCopyAnimalsCombo = async () => {
    const text = myPicks.map(p => p.pick_value).join(' - ');
    const ok = await copyText(text);
    setCopiedKey('combo');
    setTimeout(() => setCopiedKey(null), 2000);
    toast({ title: ok ? "Copiado!" : "Erro ao copiar", variant: ok ? "default" : "destructive" });
  };

  const getMaxSlots = () => {
    if (!activeRoom) return 0;
    if (activeRoom.game_type === 'animals') return ANIMALS.length;
    if (activeRoom.game_type === 'invertidos') return INVERTIDOS_BLOCKS.length;
    if (activeRoom.game_type === 'rhythms') return RHYTHMS.length;
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
            <p className="text-muted-foreground text-sm mt-2">Entre com seu nome</p>
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

  // --- GAME BOARD ---
  const gameName = GAME_NAMES[activeRoom.game_type] || activeRoom.game_type;
  const gameIcon = GAME_ICONS[activeRoom.game_type] || "🎮";
  const takenValues = picks.map(p => p.pick_value);

  const renderItems = activeRoom.game_type === 'animals'
    ? ANIMALS
    : activeRoom.game_type === 'invertidos'
      ? INVERTIDOS_BLOCKS
      : activeRoom.game_type === 'rhythms'
        ? RHYTHMS
        : SEQUENCES_BLOCKS;

  const isAnimalsGame = activeRoom.game_type === 'animals';
  const isRhythmsGame = activeRoom.game_type === 'rhythms';
  const isMultiPickGame = isAnimalsGame || isRhythmsGame;
  const itemLabel = isAnimalsGame ? 'animais' : isRhythmsGame ? 'ritmos' : 'blocos';

  return (
    <div className={`${isMultiPickGame ? 'h-screen overflow-hidden flex flex-col' : 'min-h-screen'} bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20 p-2`}>
      <div className={`${isMultiPickGame ? 'flex-1 min-h-0 flex flex-col gap-2 max-w-[98vw]' : 'max-w-6xl'} mx-auto w-full`}>
        <div className={`text-center ${isMultiPickGame ? 'mb-1 flex-shrink-0' : 'mb-6'}`}>
          <h1 className={`${isMultiPickGame ? 'text-lg md:text-xl' : 'text-3xl'} font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ${isMultiPickGame ? 'mb-0.5' : 'mb-2'}`}>
            {gameIcon} {gameName}
          </h1>
          <p className="text-muted-foreground text-xs leading-tight">
            Olá, <span className="text-purple-400 font-semibold">{currentPlayer.name}</span>{" "}
            {isMultiPickGame
              ? (reachedLimit
                  ? `• Selecionados ${myPicks.length}/2. Copie abaixo.`
                  : `• Selecione 2 ${itemLabel} (${myPicks.length}/2).`)
              : (reachedLimit
                  ? `Você já selecionou ${myPicks.length}/${maxPicks}. Clique em copiar.`
                  : `Selecione ${maxPicks} bloco (${myPicks.length}/${maxPicks}).`)}
            {" • "}{picks.length}/{getMaxSlots()} ocupados
          </p>
        </div>

        <div className={`grid ${isMultiPickGame ? 'gap-1 flex-1 min-h-0 h-full grid-cols-5 grid-rows-[repeat(14,minmax(0,1fr))] sm:grid-cols-7 sm:grid-rows-[repeat(10,minmax(0,1fr))] lg:grid-cols-10 lg:grid-rows-[repeat(7,minmax(0,1fr))]' : 'gap-3 grid-cols-3 sm:grid-cols-5 md:grid-cols-6'}`}>
          {renderItems.map(item => {
            const taken = takenValues.includes(item);
            const owner = getPickOwner(item);
            const isMine = owner?.playerId === currentPlayer.id;
            const isCopied = copiedKey === item;
            const isDisabled = taken || loading || reachedLimit;
            const handleClick = () => {
              if (isDisabled || isMine) return;
              handleSelectBlock(item);
            };
            return (
              <div
                key={item}
                role="button"
                tabIndex={isDisabled ? -1 : 0}
                onClick={handleClick}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
                aria-disabled={isDisabled}
                className={`
                  relative flex h-full min-h-0 flex-col items-center justify-center select-none overflow-hidden transition-all duration-300
                  ${isMultiPickGame ? 'rounded-md p-1' : 'rounded-xl p-3 min-h-[80px]'}
                  ${isMine
                    ? 'bg-green-500/15 border border-green-500/50 cursor-default'
                    : taken
                      ? 'bg-red-500/10 opacity-70 cursor-not-allowed border border-transparent'
                      : reachedLimit
                        ? 'backdrop-blur-md bg-white/5 border border-white/5 opacity-50 cursor-not-allowed'
                        : 'neon-snake backdrop-blur-md bg-white/5 border border-white/10 hover:border-purple-500/50 hover:scale-105 cursor-pointer'
                  }
                `}
              >
                {isMultiPickGame ? (
                  <span className="text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-foreground text-center leading-none">{item}</span>
                ) : (
                  <span className="text-base font-bold font-mono text-foreground">{item}</span>
                )}
                {owner && (
                  <span className={`${isMultiPickGame ? 'text-[6px] mt-0.5 leading-none' : 'text-[10px] mt-1'} truncate max-w-full font-semibold ${isMine ? 'text-green-400' : 'text-red-400'}`}>
                    {owner.name}
                  </span>
                )}
                {isMine && !isMultiPickGame && (
                  <button
                    type="button"
                    onClick={(e) => handleCopyBlock(e, item)}
                    className={`mt-1.5 inline-flex items-center justify-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md cursor-pointer transition-colors ${
                      isCopied
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                    }`}
                  >
                    {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {isCopied ? 'Copiado' : 'Copiar'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {isMultiPickGame && (
          <div className="flex-shrink-0 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-1.5 flex items-center gap-2 min-h-[44px]">
            <div className="flex-1 bg-background/40 border border-white/10 rounded-md px-2 py-1 text-center min-w-0 overflow-hidden">
              <span className="text-xs font-bold text-foreground break-words leading-tight">
                {myPicks.length > 0
                  ? myPicks.map(p => p.pick_value).join(' - ')
                  : <span className="text-muted-foreground font-normal">Selecione 2 {itemLabel}</span>}
              </span>
            </div>
            <Button
              onClick={handleCopyAnimalsCombo}
              disabled={myPicks.length === 0}
              size="sm"
              className={`h-9 flex-shrink-0 ${copiedKey === 'combo' ? 'bg-green-500 hover:bg-green-500' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90'}`}
            >
              {copiedKey === 'combo' ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copiedKey === 'combo' ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
        )}

        {!isMultiPickGame && (
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
        )}
      </div>
    </div>
  );
};

export default Games;

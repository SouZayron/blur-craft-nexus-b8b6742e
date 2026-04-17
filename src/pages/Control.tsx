import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ANIMALS, ANIMAL_EMOJIS, INVERTIDOS_BLOCKS, SEQUENCES_BLOCKS, GAME_NAMES, GAME_ICONS } from "@/data/gameData";
import { Lock, Power, PowerOff, UserCheck, Trash2, Users, RefreshCw } from "lucide-react";

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

export const Control = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [picks, setPicks] = useState<GamePick[]>([]);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    const [roomsRes, playersRes, picksRes] = await Promise.all([
      supabase.from("game_rooms").select("*"),
      supabase.from("game_players").select("*"),
      supabase.from("game_picks").select("*")
    ]);
    setRooms((roomsRes.data || []) as GameRoom[]);
    setPlayers((playersRes.data || []) as GamePlayer[]);
    setPicks((picksRes.data || []) as GamePick[]);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
    const channel = supabase
      .channel("control-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "game_rooms" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "game_picks" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "game_players" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated, fetchData]);

  const handleLogin = () => {
    if (password === "7845") {
      setIsAuthenticated(true);
    } else {
      toast({ title: "Senha incorreta", variant: "destructive" });
    }
  };

  const handleOpenGame = async (roomId: string) => {
    await supabase.from("game_rooms").update({ is_open: false }).eq("is_open", true);
    await supabase.from("game_rooms").update({ is_open: true }).eq("id", roomId);
    toast({ title: "Jogo aberto!" });
  };

  const handleCloseGame = async (roomId: string) => {
    await supabase.from("game_rooms").update({ is_open: false }).eq("id", roomId);
    toast({ title: "Jogo fechado!" });
  };

  const handleCloseAll = async () => {
    await supabase.from("game_rooms").update({ is_open: false }).eq("is_open", true);
    toast({ title: "Todos os jogos fechados!" });
  };

  const handleApprovePlayer = async (playerId: string) => {
    await supabase.from("game_players").update({ is_approved: true }).eq("id", playerId);
    toast({ title: "Jogador aprovado!" });
  };

  const handleApproveAll = async () => {
    const pending = players.filter(p => !p.is_approved);
    for (const p of pending) {
      await supabase.from("game_players").update({ is_approved: true }).eq("id", p.id);
    }
    toast({ title: "Todos aprovados!" });
  };

  const handleResetPicks = async (roomId: string) => {
    await supabase.from("game_picks").delete().eq("room_id", roomId);
    toast({ title: "Seleções resetadas!" });
  };

  const handleRemovePlayer = async (playerId: string) => {
    await supabase.from("game_picks").delete().eq("player_id", playerId);
    await supabase.from("game_players").delete().eq("id", playerId);
    toast({ title: "Jogador removido!" });
  };

  const handleResetAll = async () => {
    for (const room of rooms) {
      await supabase.from("game_picks").delete().eq("room_id", room.id);
    }
    for (const p of players) {
      await supabase.from("game_players").delete().eq("id", p.id);
    }
    await supabase.from("game_rooms").update({ is_open: false }).eq("is_open", true);
    toast({ title: "Tudo resetado!" });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-red-500/25">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Painel de Controle</h1>
          </div>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="bg-white/5 border-white/10"
            />
            <Button onClick={handleLogin} className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90">
              Entrar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const pendingPlayers = players.filter(p => !p.is_approved);
  const approvedPlayers = players.filter(p => p.is_approved);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Painel de Controle
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {approvedPlayers.length} jogadores • {picks.length} seleções
          </p>
        </div>

        {/* Pending Players */}
        {pendingPlayers.length > 0 && (
          <div className="backdrop-blur-xl bg-white/5 border border-yellow-500/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Pendentes ({pendingPlayers.length})
              </h2>
              <Button onClick={handleApproveAll} size="sm" className="bg-green-500 hover:bg-green-600">
                <UserCheck className="w-4 h-4 mr-1" /> Aprovar Todos
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {pendingPlayers.map(p => (
                <div key={p.id} className="flex items-center gap-2 backdrop-blur-md bg-white/5 px-3 py-2 border border-white/10 rounded-lg">
                  <span className="text-sm text-foreground">{p.name}</span>
                  <Button onClick={() => handleApprovePlayer(p.id)} size="sm" variant="ghost" className="h-6 w-6 p-0 text-green-400 hover:text-green-300">
                    <UserCheck className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => handleRemovePlayer(p.id)} size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400 hover:text-red-300">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Games Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {rooms.map(room => {
            const roomPicks = picks.filter(p => p.room_id === room.id);
            const gameName = GAME_NAMES[room.game_type] || room.game_type;
            const gameIcon = GAME_ICONS[room.game_type] || "🎮";
            const maxSlots = room.game_type === 'animals' ? ANIMALS.length
              : room.game_type === 'invertidos' ? INVERTIDOS_BLOCKS.length
              : SEQUENCES_BLOCKS.length;

            return (
              <div key={room.id} className={`backdrop-blur-xl bg-white/5 rounded-2xl p-6 shadow-xl border ${room.is_open ? 'border-green-500/50' : 'border-white/10'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-foreground">{gameIcon} {gameName}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${room.is_open ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {room.is_open ? 'Aberto' : 'Fechado'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {roomPicks.length}/{maxSlots} seleções
                </p>

                <div className="space-y-2">
                  {room.is_open ? (
                    <Button onClick={() => handleCloseGame(room.id)} size="sm" variant="outline" className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20">
                      <PowerOff className="w-4 h-4 mr-1" /> Fechar Inscrições
                    </Button>
                  ) : (
                    <Button onClick={() => handleOpenGame(room.id)} size="sm" className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90">
                      <Power className="w-4 h-4 mr-1" /> Abrir Jogo
                    </Button>
                  )}
                  {roomPicks.length > 0 && (
                    <Button onClick={() => handleResetPicks(room.id)} size="sm" variant="outline" className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20">
                      <RefreshCw className="w-4 h-4 mr-1" /> Resetar ({roomPicks.length})
                    </Button>
                  )}
                </div>

                {/* Selections list */}
                {roomPicks.length > 0 && (
                  <div className="mt-4 space-y-1 max-h-48 overflow-y-auto">
                    {roomPicks.map(pick => {
                      const player = players.find(pl => pl.id === pick.player_id);
                      return (
                        <div key={pick.id} className="flex items-center justify-between text-xs backdrop-blur-md bg-white/5 px-2 py-1.5 border border-white/5 rounded-lg">
                          <span className="text-foreground truncate">{player?.name || '?'}</span>
                          <span className="text-muted-foreground font-mono ml-2">
                            {room.game_type === 'animals' ? `${ANIMAL_EMOJIS[pick.pick_value] || ''} ${pick.pick_value}` : pick.pick_value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Players who picked (across rooms) */}
        {picks.length > 0 && (
          <div className="backdrop-blur-xl bg-white/5 border border-purple-500/30 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
              🎯 Jogadores que Selecionaram ({picks.length})
            </h2>
            <div className="space-y-2">
              {rooms.filter(r => picks.some(p => p.room_id === r.id)).map(room => {
                const roomPicks = picks.filter(p => p.room_id === room.id);
                const gameName = GAME_NAMES[room.game_type] || room.game_type;
                const gameIcon = GAME_ICONS[room.game_type] || "🎮";
                return (
                  <div key={room.id} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-sm font-semibold text-foreground mb-2">{gameIcon} {gameName} <span className="text-muted-foreground font-normal">({roomPicks.length})</span></p>
                    <div className="flex flex-wrap gap-2">
                      {roomPicks.map(pick => {
                        const player = players.find(pl => pl.id === pick.player_id);
                        return (
                          <div key={pick.id} className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs">
                            <span className="text-foreground font-semibold">{player?.name || '?'}</span>
                            <span className="text-purple-300 font-mono">→ {room.game_type === 'animals' ? `${ANIMAL_EMOJIS[pick.pick_value] || ''} ${pick.pick_value}` : pick.pick_value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Approved Players */}
        {approvedPlayers.length > 0 && (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-400" />
              Jogadores Aprovados ({approvedPlayers.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {approvedPlayers.map(p => (
                <div key={p.id} className="flex items-center gap-2 backdrop-blur-md bg-white/5 px-3 py-1.5 border border-white/5 rounded-lg">
                  <span className="text-xs text-foreground">{p.name}</span>
                  <Button onClick={() => handleRemovePlayer(p.id)} size="sm" variant="ghost" className="h-5 w-5 p-0 text-red-400 hover:text-red-300">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={handleCloseAll} variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/20">
            <PowerOff className="w-4 h-4 mr-1" /> Fechar Todos
          </Button>
          <Button onClick={handleResetAll} variant="outline" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20">
            <Trash2 className="w-4 h-4 mr-1" /> Resetar Tudo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Control;

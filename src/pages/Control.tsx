import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeTables } from "@/hooks/useRealtimeTables";
import { GAME_NAMES, GAME_ICONS, getGameItems, isItemGame } from "@/data/gameData";
import { Lock, Power, PowerOff, UserCheck, Trash2, Users, RefreshCw } from "lucide-react";
import { BingoDrawPanel } from "@/components/BingoDrawPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  useRealtimeTables({
    channelName: "control-realtime",
    enabled: isAuthenticated,
    onSync: fetchData,
    tables: ["game_rooms", "game_picks", "game_players"],
  });

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
    await fetchData();
    toast({ title: "Jogo aberto!" });
  };

  const handleCloseGame = async (roomId: string) => {
    await supabase.from("game_rooms").update({ is_open: false }).eq("id", roomId);
    await fetchData();
    toast({ title: "Jogo fechado!" });
  };

  const handleCloseAll = async () => {
    await supabase.from("game_rooms").update({ is_open: false }).eq("is_open", true);
    await fetchData();
    toast({ title: "Todos os jogos fechados!" });
  };

  const handleApprovePlayer = async (playerId: string) => {
    await supabase.from("game_players").update({ is_approved: true }).eq("id", playerId);
    await fetchData();
    toast({ title: "Jogador aprovado!" });
  };

  const handleApproveAll = async () => {
    const pending = players.filter(p => !p.is_approved);
    await Promise.all(pending.map(p =>
      supabase.from("game_players").update({ is_approved: true }).eq("id", p.id)
    ));
    await fetchData();
    toast({ title: "Todos aprovados!" });
  };

  const handleResetPicks = async (roomId: string) => {
    await supabase.from("game_picks").delete().eq("room_id", roomId);
    await fetchData();
    toast({ title: "Seleções resetadas!" });
  };

  const handleRemovePick = async (pickId: string) => {
    await supabase.from("game_picks").delete().eq("id", pickId);
    await fetchData();
    toast({ title: "Bloco removido!" });
  };

  const handleRemovePlayerPicksInRoom = async (playerId: string, roomId: string) => {
    await supabase.from("game_picks").delete().eq("player_id", playerId).eq("room_id", roomId);
    await fetchData();
    toast({ title: "Seleções removidas!" });
  };

  const handleRemovePlayer = async (playerId: string) => {
    await supabase.from("game_picks").delete().eq("player_id", playerId);
    await supabase.from("game_players").delete().eq("id", playerId);
    await fetchData();
    toast({ title: "Jogador removido!" });
  };

  const handleResetAll = async () => {
    // Apenas limpa picks e fecha jogos. Mantém jogadores aprovados registrados.
    await Promise.all(rooms.map(room =>
      supabase.from("game_picks").delete().eq("room_id", room.id)
    ));
    await supabase.from("game_rooms").update({ is_open: false }).eq("is_open", true);
    await fetchData();
    toast({ title: "Picks resetadas e jogos fechados! Jogadores mantidos." });
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

  const openRoom = rooms.find(r => r.is_open) || null;
  const activeRoom = openRoom;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20 p-4">
      <div className="max-w-[1700px] mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Painel de Controle
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {approvedPlayers.length} jogadores • {picks.length} seleções
          </p>
        </div>

        <Tabs defaultValue="cadastros" className="w-full">
          <TabsList className="mx-auto flex w-full max-w-2xl backdrop-blur-xl bg-white/5 border border-white/10">
            <TabsTrigger value="cadastros" className="flex-1">
              <Users className="w-4 h-4 mr-1.5" /> Cadastros
              {pendingPlayers.length > 0 && (
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                  {pendingPlayers.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="games" className="flex-1">🎮 Games</TabsTrigger>
            <TabsTrigger value="roletas" className="flex-1">🎡 Roletas</TabsTrigger>
          </TabsList>

          {/* ===== CADASTROS ===== */}
          <TabsContent value="cadastros" className="mt-6 space-y-6">
            <div className="backdrop-blur-xl bg-white/5 border border-yellow-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Aguardando aprovação ({pendingPlayers.length})
                </h2>
                {pendingPlayers.length > 0 && (
                  <Button onClick={handleApproveAll} size="sm" className="bg-green-500 hover:bg-green-600">
                    <UserCheck className="w-4 h-4 mr-1" /> Aprovar Todos
                  </Button>
                )}
              </div>
              {pendingPlayers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum cadastro pendente.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {pendingPlayers.map(p => (
                    <div key={p.id} className="flex items-center gap-2 backdrop-blur-md bg-white/5 px-3 py-2 border border-white/10 rounded-lg">
                      <span className="text-sm text-foreground">{p.name} {p.xat_id && <span className="text-xs text-muted-foreground">({p.xat_id})</span>}</span>
                      <Button onClick={() => handleApprovePlayer(p.id)} size="sm" variant="ghost" className="h-6 w-6 p-0 text-green-400 hover:text-green-300">
                        <UserCheck className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => handleRemovePlayer(p.id)} size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400 hover:text-red-300">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-400" />
                Jogadores Aprovados ({approvedPlayers.length})
              </h2>
              {approvedPlayers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum jogador aprovado ainda.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {approvedPlayers.map(p => (
                    <div key={p.id} className="flex items-center gap-2 backdrop-blur-md bg-white/5 px-3 py-1.5 border border-white/5 rounded-lg">
                      <span className="text-xs text-foreground">{p.name}{p.xat_id ? ` (${p.xat_id})` : ''}</span>
                      <Button onClick={() => handleRemovePlayer(p.id)} size="sm" variant="ghost" className="h-5 w-5 p-0 text-red-400 hover:text-red-300">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ===== GAMES ===== */}
          <TabsContent value="games" className="mt-6 space-y-6">
            {picks.length > 0 && (
              <div className="backdrop-blur-xl bg-white/5 border border-purple-500/30 rounded-2xl p-4 shadow-xl">
                <h2 className="text-base font-bold text-purple-400 mb-3 flex items-center gap-2">
                  🎯 Jogadores que Selecionaram ({picks.length})
                </h2>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {rooms.filter(r => picks.some(p => p.room_id === r.id)).map(room => {
                    const roomPicks = picks.filter(p => p.room_id === room.id);
                    const gameName = GAME_NAMES[room.game_type] || room.game_type;
                    const gameIcon = GAME_ICONS[room.game_type] || "🎮";
                    return (
                      <div key={room.id} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3">
                        <p className="text-sm font-semibold text-foreground mb-2">{gameIcon} {gameName} <span className="text-muted-foreground font-normal">({roomPicks.length})</span></p>
                        <div className="flex flex-wrap gap-2">
                          {isItemGame(room.game_type) ? (
                            Array.from(new Set(roomPicks.map(p => p.player_id))).map(playerId => {
                              const player = players.find(pl => pl.id === playerId);
                              const playerPicks = roomPicks.filter(p => p.player_id === playerId);
                              const combo = playerPicks.map(p => p.pick_value).join(' - ');
                              return (
                                <div key={playerId} className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs">
                                  <span className="text-foreground font-semibold">{player?.name || '?'}{player?.xat_id ? ` (${player.xat_id})` : ''}</span>
                                  <span className="text-purple-300">→ {combo}</span>
                                  <Button onClick={() => handleRemovePlayerPicksInRoom(playerId, room.id)} size="sm" variant="ghost" className="h-5 w-5 p-0 text-red-400 hover:text-red-300">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              );
                            })
                          ) : (
                            roomPicks.map(pick => {
                              const player = players.find(pl => pl.id === pick.player_id);
                              return (
                                <div key={pick.id} className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs">
                                  <span className="text-foreground font-semibold">{player?.name || '?'}{player?.xat_id ? ` (${player.xat_id})` : ''}</span>
                                  <span className="text-purple-300 font-mono">→ {pick.pick_value}</span>
                                  <Button onClick={() => handleRemovePick(pick.id)} size="sm" variant="ghost" className="h-5 w-5 p-0 text-red-400 hover:text-red-300">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">

              {rooms.map(room => {
                const roomPicks = picks.filter(p => p.room_id === room.id);
                const gameName = GAME_NAMES[room.game_type] || room.game_type;
                const gameIcon = GAME_ICONS[room.game_type] || "🎮";
                const maxSlots = getGameItems(room.game_type).length;

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

                    {roomPicks.length > 0 && (
                      <div className="mt-4 space-y-1 max-h-56 overflow-y-auto">
                        {isItemGame(room.game_type) ? (
                          Array.from(new Set(roomPicks.map(p => p.player_id))).map(playerId => {
                            const player = players.find(pl => pl.id === playerId);
                            const playerPicks = roomPicks.filter(p => p.player_id === playerId);
                            const combo = playerPicks.map(p => p.pick_value).join(' - ');
                            return (
                              <div key={playerId} className="flex items-center justify-between text-xs backdrop-blur-md bg-white/5 px-2 py-1.5 border border-white/5 rounded-lg gap-2">
                                <span className="text-foreground truncate font-semibold">{player?.name || '?'}{player?.xat_id ? ` (${player.xat_id})` : ''}</span>
                                <span className="text-muted-foreground ml-2 truncate">{combo}</span>
                                <Button onClick={() => handleRemovePlayerPicksInRoom(playerId, room.id)} size="sm" variant="ghost" className="h-5 w-5 p-0 text-red-400 hover:text-red-300 shrink-0">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            );
                          })
                        ) : (
                          roomPicks.map(pick => {
                            const player = players.find(pl => pl.id === pick.player_id);
                            return (
                              <div key={pick.id} className="flex items-center justify-between text-xs backdrop-blur-md bg-white/5 px-2 py-1.5 border border-white/5 rounded-lg gap-2">
                                <span className="text-foreground truncate">{player?.name || '?'}{player?.xat_id ? ` (${player.xat_id})` : ''}</span>
                                <span className="text-muted-foreground font-mono ml-2">{pick.pick_value}</span>
                                <Button onClick={() => handleRemovePick(pick.id)} size="sm" variant="ghost" className="h-5 w-5 p-0 text-red-400 hover:text-red-300 shrink-0">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>




            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={handleCloseAll} variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/20">
                <PowerOff className="w-4 h-4 mr-1" /> Fechar Todos
              </Button>
              <Button onClick={handleResetAll} variant="outline" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20">
                <Trash2 className="w-4 h-4 mr-1" /> Resetar Tudo
              </Button>
            </div>
          </TabsContent>

          {/* ===== ROLETAS ===== */}
          <TabsContent value="roletas" className="mt-6 h-[calc(100vh-190px)] min-h-0">
            <div className="h-full flex flex-col min-h-0 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl">
              {activeRoom ? (
                <div className="flex-1 min-h-0">
                  <BingoDrawPanel activeRoom={activeRoom} players={players} picks={picks} />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
                  <span className="text-4xl">🎡</span>
                  <p className="text-sm text-muted-foreground">
                    Nenhum jogo ativo. Abra um jogo na aba <span className="text-foreground font-semibold">Games</span> para a roleta aparecer aqui.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Control;

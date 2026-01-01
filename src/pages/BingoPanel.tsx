import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Lock, LogIn, Shield, Users, Gamepad2, Trash2, 
  LockOpen, RefreshCw, ToggleLeft, ToggleRight 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Blocos do Jogo 1 - Bingo 2 Números
const PAIRS_BLOCKS = [
  "01-10", "02-20", "03-30", "04-40", "05-50", "06-60", "07-70", "08-80", "09-90",
  "12-21", "13-31", "14-41", "15-51", "16-61", "17-71", "18-81",
  "23-32", "24-42", "25-52", "26-62", "27-72", "28-82",
  "34-43", "35-53", "36-63", "37-73", "38-83",
  "45-54", "46-64", "47-74", "48-84",
  "56-65", "57-75", "58-85",
  "67-76", "68-86",
  "78-87",
  "11-22", "33-44", "55-66", "77-88",
  "19-29", "39-49", "59-69", "79-89"
];

// Blocos do Jogo 2 - Bingo das Sequências
const SEQUENCE_BLOCKS = [
  "1-2-3", "4-5-6", "7-8-9", "10-11-12", "13-14-15", "16-17-18",
  "19-20-21", "22-23-24", "25-26-27", "28-29-30", "31-32-33", "34-35-36",
  "37-38-39", "40-41-42", "43-44-45", "46-47-48", "49-50-51", "52-53-54",
  "55-56-57", "58-59-60", "61-62-63", "64-65-66", "67-68-69",
  "70-71-72", "73-74-75", "76-77-78", "79-80-81", "82-83-84",
  "85-86-87", "88-89-90"
];

interface Player {
  id: string;
  username: string;
  created_at: string;
}

interface Selection {
  id: string;
  player_id: string;
  block_index: number;
  player?: Player;
}

interface Game {
  id: string;
  game_type: 'pairs' | 'sequences';
  is_open: boolean;
}

export const BingoPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [game, setGame] = useState<Game | null>(null);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch game and selections
  const fetchData = async () => {
    console.log('Fetching data...');
    
    const { data: gameData } = await supabase
      .from('bingo_games')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (gameData) {
      console.log('Game data:', gameData);
      setGame(gameData as Game);
      
      const { data: selectionsData } = await supabase
        .from('bingo_selections')
        .select('*, player:bingo_players(*)')
        .eq('game_id', gameData.id);
      
      console.log('Selections data:', selectionsData);
      if (selectionsData) {
        setSelections(selectionsData as any);
      }
    }

    const { data: playersData } = await supabase
      .from('bingo_players')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (playersData) {
      setPlayers(playersData);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();

      // Setup realtime subscriptions with unique channel name
      const channel = supabase
        .channel('bingo-admin-realtime')
        .on(
          'postgres_changes', 
          { event: '*', schema: 'public', table: 'bingo_games' }, 
          (payload) => {
            console.log('Game update:', payload);
            fetchData();
          }
        )
        .on(
          'postgres_changes', 
          { event: '*', schema: 'public', table: 'bingo_selections' }, 
          (payload) => {
            console.log('Selection update:', payload);
            fetchData();
          }
        )
        .on(
          'postgres_changes', 
          { event: '*', schema: 'public', table: 'bingo_players' }, 
          (payload) => {
            console.log('Player update:', payload);
            fetchData();
          }
        )
        .subscribe((status) => {
          console.log('Admin channel status:', status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('bingo_admins')
      .select('*')
      .eq('username', username.trim())
      .eq('password', password.trim())
      .maybeSingle();

    if (error || !data) {
      toast({ title: "Credenciais inválidas", variant: "destructive" });
    } else {
      setIsLoggedIn(true);
      toast({ title: "Bem-vindo, Admin!" });
    }
    setLoading(false);
  };

  const toggleGameOpen = async () => {
    if (!game) return;
    
    await supabase
      .from('bingo_games')
      .update({ is_open: !game.is_open })
      .eq('id', game.id);
    
    toast({ title: game.is_open ? "Painel fechado" : "Painel aberto" });
  };

  const switchGameType = async () => {
    if (!game) return;
    
    const newType = game.game_type === 'pairs' ? 'sequences' : 'pairs';
    
    // First, delete all selections when switching game type
    await supabase
      .from('bingo_selections')
      .delete()
      .eq('game_id', game.id);
    
    // Then update game type
    await supabase
      .from('bingo_games')
      .update({ game_type: newType, updated_at: new Date().toISOString() })
      .eq('id', game.id);
    
    toast({ title: `Jogo alterado para: ${newType === 'pairs' ? 'Bingo 2 Números' : 'Bingo das Sequências'}` });
  };

  const resetGame = async () => {
    if (!game) return;
    
    // Delete all selections
    await supabase
      .from('bingo_selections')
      .delete()
      .eq('game_id', game.id);
    
    toast({ title: "Jogo resetado! Todos os blocos estão disponíveis." });
  };

  const removePlayer = async (playerId: string) => {
    // Delete player's selections first
    await supabase
      .from('bingo_selections')
      .delete()
      .eq('player_id', playerId);
    
    // Then delete player
    await supabase
      .from('bingo_players')
      .delete()
      .eq('id', playerId);
    
    toast({ title: "Jogador removido" });
  };

  const removeSelection = async (selectionId: string) => {
    await supabase
      .from('bingo_selections')
      .delete()
      .eq('id', selectionId);
    
    toast({ title: "Bloco liberado" });
  };

  const getPlayerBlock = (playerId: string) => {
    const selection = selections.find(s => s.player_id === playerId);
    if (!selection) return null;
    
    const blocks = game?.game_type === 'sequences' ? SEQUENCE_BLOCKS : PAIRS_BLOCKS;
    return { block: blocks[selection.block_index], selectionId: selection.id };
  };

  const getBlockOwner = (blockIndex: number) => {
    const selection = selections.find(s => s.block_index === blockIndex);
    if (selection) {
      // Try nested player first, then fallback to players array
      const player = selection.player || players.find(p => p.id === selection.player_id);
      return { player, selectionId: selection.id };
    }
    return null;
  };

  const blocks = game?.game_type === 'sequences' ? SEQUENCE_BLOCKS : PAIRS_BLOCKS;
  const selectedCount = selections.length;
  const availableCount = blocks.length - selectedCount;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-labxat-purple/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card border-labxat-purple/30">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-labxat-purple to-labxat-pink flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-labxat-purple to-labxat-pink bg-clip-text text-transparent">
              Painel Admin
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Acesso restrito
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-background/50"
              />
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50"
              />
            </div>
            
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-labxat-purple to-labxat-pink hover:opacity-90"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-labxat-purple/10 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-labxat-purple to-labxat-pink bg-clip-text text-transparent">
              Painel Administrador
            </h1>
            <p className="text-muted-foreground">
              {game?.game_type === 'sequences' ? 'Bingo das Sequências' : 'Bingo 2 Números'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={toggleGameOpen}
              variant={game?.is_open ? "destructive" : "default"}
              className={game?.is_open ? "" : "bg-green-600 hover:bg-green-700"}
            >
              {game?.is_open ? <Lock className="w-4 h-4 mr-2" /> : <LockOpen className="w-4 h-4 mr-2" />}
              {game?.is_open ? "Fechar Painel" : "Abrir Painel"}
            </Button>
            
            <Button onClick={switchGameType} variant="outline">
              {game?.game_type === 'pairs' ? <ToggleLeft className="w-4 h-4 mr-2" /> : <ToggleRight className="w-4 h-4 mr-2" />}
              Trocar Jogo
            </Button>
            
            <Button onClick={resetGame} variant="outline" className="text-orange-500 border-orange-500 hover:bg-orange-500/10">
              <RefreshCw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-labxat-purple">{players.length}</div>
              <div className="text-sm text-muted-foreground">Jogadores</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-500">{selectedCount}</div>
              <div className="text-sm text-muted-foreground">Selecionados</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-orange-500">{availableCount}</div>
              <div className="text-sm text-muted-foreground">Disponíveis</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className={`text-3xl font-bold ${game?.is_open ? 'text-green-500' : 'text-red-500'}`}>
                {game?.is_open ? 'Aberto' : 'Fechado'}
              </div>
              <div className="text-sm text-muted-foreground">Status</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Players Table */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-labxat-purple" />
                Jogadores Cadastrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Bloco</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.map((player) => {
                      const blockInfo = getPlayerBlock(player.id);
                      return (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">{player.username}</TableCell>
                          <TableCell>
                            {blockInfo ? (
                              <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-sm">
                                {blockInfo.block}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {blockInfo && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeSelection(blockInfo.selectionId)}
                                  className="text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removePlayer(player.id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {players.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Nenhum jogador cadastrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Blocks Grid */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-labxat-purple" />
                Blocos ({selectedCount}/{blocks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid gap-2 max-h-[400px] overflow-auto ${game?.game_type === 'sequences' ? 'grid-cols-5' : 'grid-cols-5 md:grid-cols-9'}`}>
                {blocks.map((block, index) => {
                  const ownerInfo = getBlockOwner(index);
                  return (
                    <div
                      key={index}
                      className={`
                        p-2 rounded-lg text-center text-xs transition-all
                        ${ownerInfo 
                          ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/50' 
                          : 'bg-gradient-to-br from-labxat-purple/20 to-labxat-pink/20 border border-labxat-purple/30'
                        }
                      `}
                      title={ownerInfo?.player?.username || 'Disponível'}
                    >
                      <div className="font-bold">{block}</div>
                      {ownerInfo && (
                        <div className="text-[10px] text-green-400 truncate">
                          {ownerInfo.player?.username}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BingoPanel;

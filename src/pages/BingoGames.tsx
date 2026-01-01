import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, LogIn, UserPlus, Gamepad2 } from "lucide-react";

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

export const BingoGames = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch game and selections
  const fetchData = async () => {
    const { data: gameData } = await supabase
      .from('bingo_games')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (gameData) {
      setGame(gameData as Game);
      
      const { data: selectionsData } = await supabase
        .from('bingo_selections')
        .select('*, player:bingo_players(*)')
        .eq('game_id', gameData.id);
      
      if (selectionsData) {
        setSelections(selectionsData as any);
      }
    }

    const { data: playersData } = await supabase
      .from('bingo_players')
      .select('*');
    
    if (playersData) {
      setPlayers(playersData);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup realtime subscriptions with unique channel name
    const channel = supabase
      .channel('bingo-user-realtime')
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
        console.log('User channel status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('bingo_players')
      .select('*')
      .eq('username', username.trim())
      .eq('password', password.trim())
      .maybeSingle();

    if (error || !data) {
      toast({ title: "Usuário ou senha incorretos", variant: "destructive" });
    } else {
      setCurrentPlayer(data);
      setIsLoggedIn(true);
      toast({ title: `Bem-vindo, ${data.username}!` });
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('bingo_players')
      .insert({ username: username.trim(), password: password.trim() })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        toast({ title: "Nome de usuário já existe", variant: "destructive" });
      } else {
        toast({ title: "Erro ao cadastrar", variant: "destructive" });
      }
    } else {
      setCurrentPlayer(data);
      setIsLoggedIn(true);
      toast({ title: `Cadastrado com sucesso! Bem-vindo, ${data.username}!` });
    }
    setLoading(false);
  };

  const handleSelectBlock = async (blockIndex: number) => {
    if (!currentPlayer || !game) return;

    // Check if block is already selected
    const existingSelection = selections.find(s => s.block_index === blockIndex);
    if (existingSelection) {
      toast({ title: "Este bloco já foi selecionado", variant: "destructive" });
      return;
    }

    // Check if player already has a selection
    const playerSelection = selections.find(s => s.player_id === currentPlayer.id);
    if (playerSelection) {
      toast({ title: "Você já selecionou um bloco", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('bingo_selections')
      .insert({
        game_id: game.id,
        player_id: currentPlayer.id,
        block_index: blockIndex
      });

    if (error) {
      toast({ title: "Erro ao selecionar bloco", variant: "destructive" });
    } else {
      toast({ title: "Bloco selecionado com sucesso!" });
    }
  };

  const getBlockOwner = (blockIndex: number) => {
    const selection = selections.find(s => s.block_index === blockIndex);
    if (selection) {
      // First try to get from nested player object
      if ((selection as any).player?.username) {
        return (selection as any).player.username;
      }
      // Fallback to players array
      const player = players.find(p => p.id === selection.player_id);
      return player?.username || "Ocupado";
    }
    return null;
  };

  const isMyBlock = (blockIndex: number) => {
    if (!currentPlayer) return false;
    const selection = selections.find(s => s.block_index === blockIndex);
    return selection?.player_id === currentPlayer.id;
  };

  const blocks = game?.game_type === 'sequences' ? SEQUENCE_BLOCKS : PAIRS_BLOCKS;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-labxat-purple/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card border-labxat-purple/30">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-labxat-purple to-labxat-pink flex items-center justify-center mb-4">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-labxat-purple to-labxat-pink bg-clip-text text-transparent">
              Bingo Games
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              {isRegistering ? "Crie sua conta para jogar" : "Entre para jogar"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Nome de usuário"
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
            
            {isRegistering ? (
              <>
                <Button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-labxat-purple to-labxat-pink hover:opacity-90"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsRegistering(false)}
                  className="w-full"
                >
                  Já tenho conta
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-labxat-purple to-labxat-pink hover:opacity-90"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsRegistering(true)}
                  className="w-full"
                >
                  Criar conta
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!game?.is_open) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-labxat-purple/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card border-labxat-purple/30">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-500">
              Jogo em Andamento
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              O painel está fechado. Aguarde o próximo jogo.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const hasPlayerSelected = currentPlayer ? selections.some(s => s.player_id === currentPlayer.id) : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-labxat-purple/10 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-labxat-purple to-labxat-pink bg-clip-text text-transparent mb-2">
            {game?.game_type === 'sequences' ? 'Bingo das Sequências' : 'Bingo 2 Números'}
          </h1>
          <p className="text-muted-foreground">
            Olá, <span className="text-labxat-purple font-semibold">{currentPlayer?.username}</span>! 
            {hasPlayerSelected 
              ? ' Você já selecionou seu bloco.' 
              : ' Selecione seu bloco.'}
          </p>
          {hasPlayerSelected && (
            <p className="text-green-500 text-sm mt-1">✓ Bloco selecionado com sucesso!</p>
          )}
        </div>

        {/* Blocks Grid */}
        <div className={`grid gap-3 ${game?.game_type === 'sequences' ? 'grid-cols-3 sm:grid-cols-5 md:grid-cols-6' : 'grid-cols-3 sm:grid-cols-5 md:grid-cols-9'}`}>
          {blocks.map((block, index) => {
            const owner = getBlockOwner(index);
            const isMine = isMyBlock(index);
            const isAvailable = !owner;
            const canSelect = isAvailable && !hasPlayerSelected;

            return (
              <button
                key={index}
                onClick={() => canSelect && handleSelectBlock(index)}
                disabled={!canSelect}
                className={`
                  relative p-3 rounded-xl transition-all duration-300 min-h-[80px] flex flex-col items-center justify-center
                  ${isMine 
                    ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-2 border-green-500'
                    : owner
                      ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20 cursor-not-allowed opacity-70'
                      : hasPlayerSelected
                        ? 'bg-gradient-to-br from-labxat-purple/10 to-labxat-pink/10 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-br from-labxat-purple/20 to-labxat-pink/20 hover:from-labxat-purple/40 hover:to-labxat-pink/40 cursor-pointer hover:scale-105'
                  }
                  ${canSelect ? 'animate-border-glow' : ''}
                `}
              >
                <span className="text-lg font-bold text-foreground">{block}</span>
                {owner && (
                  <span className={`text-xs mt-1 truncate max-w-full font-semibold ${isMine ? 'text-green-400' : 'text-red-400'}`}>
                    {owner}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-labxat-purple/40 to-labxat-pink/40" />
            <span className="text-muted-foreground">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500" />
            <span className="text-muted-foreground">Seu bloco</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-red-500/20 to-orange-500/20" />
            <span className="text-muted-foreground">Ocupado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BingoGames;

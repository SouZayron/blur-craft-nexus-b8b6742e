// Tabuleiro de 60 casas em formato loop quadrado (estilo Monopoly)
// Layout: 16 casas por lado, totalizando 60 casas no perímetro
// (canto superior-esq=0, depois horário)

export type TileType = "start" | "chat" | "event" | "penalty" | "boost" | "teleport" | "finish" | "neutral";

export interface Tile {
  index: number;
  type: TileType;
  name: string;
  price?: number; // para chat
  baseRent?: number;
  color?: string; // tailwind gradient classes
  description?: string;
}

const CHAT_NAMES = [
  "Help", "Trade", "Brasil", "Portugal", "Espanha", "EUA", "Anime", "Music",
  "Flirt", "Chess", "Poker", "Movies", "Gaming", "Sports", "Tech", "Art",
  "Roleplay", "Karaoke", "PartyTime", "Lounge", "VIP", "Mods", "Radio", "Coders",
];

const CHAT_GRADIENTS = [
  "from-pink-500 to-rose-400",
  "from-purple-500 to-fuchsia-400",
  "from-blue-500 to-cyan-400",
  "from-emerald-500 to-teal-400",
  "from-amber-500 to-orange-400",
  "from-red-500 to-pink-500",
  "from-indigo-500 to-violet-400",
  "from-sky-500 to-blue-400",
];

// Define tipo de cada casa específica (loop de 60)
function buildBoard(): Tile[] {
  const tiles: Tile[] = [];
  let chatIdx = 0;

  for (let i = 0; i < 60; i++) {
    if (i === 0) {
      tiles.push({ index: 0, type: "start", name: "Início", description: "Ganhe 200 PX ao passar" });
    } else if (i === 30) {
      tiles.push({ index: 30, type: "teleport", name: "Teleporte", description: "Vá para casa aleatória" });
    } else if (i === 15 || i === 45) {
      tiles.push({ index: i, type: "penalty", name: "Banido", description: "Perde turno + paga 100 PX" });
    } else if (i % 7 === 0) {
      tiles.push({ index: i, type: "event", name: "Evento", description: "Carta surpresa" });
    } else if (i % 11 === 0) {
      tiles.push({ index: i, type: "boost", name: "Boost", description: "+150 PX" });
    } else if (i % 13 === 0) {
      tiles.push({ index: i, type: "neutral", name: "Lounge", description: "Descansa" });
    } else {
      // Casa de chat
      const name = CHAT_NAMES[chatIdx % CHAT_NAMES.length];
      const color = CHAT_GRADIENTS[chatIdx % CHAT_GRADIENTS.length];
      const price = 100 + (chatIdx % 8) * 40; // 100..380
      tiles.push({
        index: i,
        type: "chat",
        name,
        price,
        baseRent: Math.floor(price * 0.2),
        color,
      });
      chatIdx++;
    }
  }

  return tiles;
}

export const BOARD_TILES: Tile[] = buildBoard();
export const BOARD_SIZE = 60;
export const SIDE_LENGTH = 16; // 16 casas por lado (16*4 - 4 cantos = 60)

// Posiciona cada casa em coordenadas grid (16x16)
// Canto sup-esq = 0, sup-dir = 15, inf-dir = 30, inf-esq = 45
export function tileToGrid(index: number): { row: number; col: number } {
  const i = ((index % 60) + 60) % 60;
  if (i <= 15) {
    // Topo: esquerda → direita
    return { row: 0, col: i };
  } else if (i <= 30) {
    // Direita: topo → baixo
    return { row: i - 15, col: 15 };
  } else if (i <= 45) {
    // Base: direita → esquerda
    return { row: 15, col: 15 - (i - 30) };
  } else {
    // Esquerda: baixo → topo
    return { row: 15 - (i - 45), col: 0 };
  }
}

// Cores dos avatares
export const AVATAR_COLORS = [
  { name: "Rosa", value: "#ec4899", glow: "shadow-[0_0_20px_rgba(236,72,153,0.6)]" },
  { name: "Lilás", value: "#a855f7", glow: "shadow-[0_0_20px_rgba(168,85,247,0.6)]" },
  { name: "Azul", value: "#3b82f6", glow: "shadow-[0_0_20px_rgba(59,130,246,0.6)]" },
  { name: "Aqua", value: "#06b6d4", glow: "shadow-[0_0_20px_rgba(6,182,212,0.6)]" },
  { name: "Verde", value: "#10b981", glow: "shadow-[0_0_20px_rgba(16,185,129,0.6)]" },
  { name: "Amarelo", value: "#f59e0b", glow: "shadow-[0_0_20px_rgba(245,158,11,0.6)]" },
  { name: "Coral", value: "#f97316", glow: "shadow-[0_0_20px_rgba(249,115,22,0.6)]" },
  { name: "Vermelho", value: "#ef4444", glow: "shadow-[0_0_20px_rgba(239,68,68,0.6)]" },
];

export const EVENT_CARDS = [
  { text: "Você viralizou no chat! +300 PX", px: 300 },
  { text: "Doação anônima de fã. +150 PX", px: 150 },
  { text: "Ganhou um Power de presente. +200 PX", px: 200 },
  { text: "Bot invadiu seu chat. -100 PX", px: -100 },
  { text: "Perdeu PX em aposta no Dado. -150 PX", px: -150 },
  { text: "Reclamação no main: multa. -80 PX", px: -80 },
  { text: "Avance 3 casas", move: 3 },
  { text: "Volte 2 casas", move: -2 },
  { text: "Você foi promovido a Owner! +400 PX", px: 400 },
  { text: "Caiu o servidor. Pule 1 turno.", skip: 1 },
];

export type EventCard = (typeof EVENT_CARDS)[number];

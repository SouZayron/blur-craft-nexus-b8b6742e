export const ANIMALS = [
  "Cachorro", "Gato", "Cavalo", "Vaca", "Boi", "Cabra", "Ovelha", "Porco", "Coelho", "Rato",
  "Leão", "Tigre", "Onça", "Lobo", "Raposa", "Urso", "Panda", "Zebra", "Girafa", "Elefante",
  "Rinoceronte", "Hipopótamo", "Macaco", "Gorila", "Canguru", "Koala", "Capivara", "Tatu", "Anta", "Veado",
  "Galo", "Galinha", "Pato", "Peru", "Ganso", "Coruja", "Águia", "Falcão", "Tucano", "Arara",
  "Papagaio", "Pardal", "Canário", "Pinguim", "Avestruz", "Cobra", "Jacaré", "Lagarto", "Sapo", "Rã",
  "Tartaruga", "Tubarão", "Baleia", "Golfinho", "Polvo", "Lula", "Sardinha", "Atum", "Caranguejo", "Lagosta",
  "Camarão", "Abelha", "Formiga", "Borboleta", "Joaninha", "Besouro", "Mosca", "Aranha", "Escorpião", "Grilo"
];

export const ANIMAL_EMOJIS: Record<string, string> = {
  "Cachorro": "🐕", "Gato": "🐱", "Cavalo": "🐴", "Vaca": "🐄", "Boi": "🐂",
  "Cabra": "🐐", "Ovelha": "🐑", "Porco": "🐷", "Coelho": "🐰", "Rato": "🐀",
  "Leão": "🦁", "Tigre": "🐅", "Onça": "🐆", "Lobo": "🐺", "Raposa": "🦊",
  "Urso": "🐻", "Panda": "🐼", "Zebra": "🦓", "Girafa": "🦒", "Elefante": "🐘",
  "Rinoceronte": "🦏", "Hipopótamo": "🦛", "Macaco": "🐒", "Gorila": "🦍", "Canguru": "🦘",
  "Koala": "🐨", "Capivara": "🦫", "Tatu": "🦔", "Anta": "🫏", "Veado": "🦌",
  "Galo": "🐓", "Galinha": "🐔", "Pato": "🦆", "Peru": "🦃", "Ganso": "🪿",
  "Coruja": "🦉", "Águia": "🦅", "Falcão": "🦅", "Tucano": "🐦", "Arara": "🦜",
  "Papagaio": "🦜", "Pardal": "🐦", "Canário": "🐤", "Pinguim": "🐧", "Avestruz": "🦤",
  "Cobra": "🐍", "Jacaré": "🐊", "Lagarto": "🦎", "Sapo": "🐸", "Rã": "🐸",
  "Tartaruga": "🐢", "Tubarão": "🦈", "Baleia": "🐋", "Golfinho": "🐬", "Polvo": "🐙",
  "Lula": "🦑", "Sardinha": "🐟", "Atum": "🐟", "Caranguejo": "🦀", "Lagosta": "🦞",
  "Camarão": "🦐", "Abelha": "🐝", "Formiga": "🐜", "Borboleta": "🦋", "Joaninha": "🐞",
  "Besouro": "🪲", "Mosca": "🪰", "Aranha": "🕷️", "Escorpião": "🦂", "Grilo": "🦗"
};

export const INVERTIDOS_BLOCKS = [
  "01-10", "02-20", "03-30", "04-40", "05-50", "06-60", "07-70", "08-80", "09-90",
  "12-21", "13-31", "14-41", "15-51", "16-61", "17-71", "18-81",
  "23-32", "24-42", "25-52", "26-62", "27-72", "28-82",
  "34-43", "35-53", "36-63", "37-73", "38-83",
  "45-54", "46-64", "47-74", "48-84",
  "56-65", "57-75", "58-85",
  "67-76", "68-86",
  "78-87",
  "11-22", "33-44", "55-66", "77-88"
];

export const SEQUENCES_BLOCKS = [
  "1-2-3", "4-5-6", "7-8-9", "10-11-12", "13-14-15", "16-17-18",
  "19-20-21", "22-23-24", "25-26-27", "28-29-30", "31-32-33", "34-35-36",
  "37-38-39", "40-41-42", "43-44-45", "46-47-48", "49-50-51", "52-53-54",
  "55-56-57", "58-59-60", "61-62-63", "64-65-66", "67-68-69",
  "70-71-72", "73-74-75", "76-77-78", "79-80-81", "82-83-84",
  "85-86-87", "88-89-90"
];

export const GAME_NAMES: Record<string, string> = {
  animals: "Jogo dos Animais",
  invertidos: "Jogo dos Invertidos",
  sequences: "Bingo das Sequências"
};

export const GAME_ICONS: Record<string, string> = {
  animals: "🐾",
  invertidos: "🔢",
  sequences: "📊"
};

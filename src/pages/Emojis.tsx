import { Header } from "@/components/Header";
import { FloatingBlob } from "@/components/FloatingBlob";
import { GlassCard } from "@/components/GlassCard";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const emojiThemes = [
  { name: "Natal", emojis: ["🎄", "🎅", "🤶", "🧑‍🎄", "🎁", "🦌", "🛷", "❄️", "☃️", "🌨️", "⭐", "✨", "🌟", "🔔", "🕯️", "🍪", "🥛", "🎶", "🎼", "🎀", "🎉", "🧦"] },
  { name: "Ano Novo", emojis: ["🎆", "🎇", "🎉", "🎊", "🥂", "🍾", "🕛", "⏰", "✨", "🌟", "💫", "🎈", "🎶", "📅", "📆", "💥", "🔥", "⭐"] },
  { name: "Férias", emojis: ["🏖️", "🏝️", "🌴", "☀️", "🌞", "😎", "🕶️", "👙", "🩳", "🍹", "🍸", "🍺", "🌊", "🏄‍♂️", "🚤", "✈️", "🧳", "📸"] },
  { name: "Florestas", emojis: ["🌲", "🌳", "🍃", "🌿", "🍄", "🦌", "🦉", "🐦", "🐿️", "🌫️", "🍂", "🍁"] },
  { name: "Primavera", emojis: ["🌸", "🌷", "🌼", "🌺", "🌻", "🐝", "🐞", "🦋", "🌈", "☀️", "🌱", "💐", "✨"] },
  { name: "Verão", emojis: ["☀️", "🌞", "🔥", "🏖️", "🌊", "🍉", "🍍", "🍓", "🍦", "😎", "🕶️", "🏄‍♀️", "🚴‍♂️", "🎶", "🎉"] },
  { name: "Outono", emojis: ["🍂", "🍁", "🌰", "☕", "🍎", "🍐", "🌾", "🌫️", "🍃", "🧣", "🕯️", "🍄", "📖"] },
  { name: "Inverno", emojis: ["❄️", "☃️", "🌨️", "🧊", "🧣", "🧤", "🧥", "🔥", "☕", "🍫", "🕯️", "🌙", "⭐"] },
  { name: "Espaço", emojis: ["🌌", "🚀", "🪐", "🌍", "🌑", "🌕", "⭐", "✨", "💫", "☄️", "👽", "🛸", "🔭", "🌠"] },
  { name: "Oceano", emojis: ["🌊", "🐬", "🐠", "🐟", "🐡", "🐳", "🐋", "🦈", "🪸", "⚓", "🚢", "🏝️", "🌞"] },
  { name: "Festa", emojis: ["🎉", "🎊", "🥳", "🎈", "🍾", "🥂", "🎶", "🎧", "💃", "🕺", "✨", "🌟"] },
  { name: "Halloween", emojis: ["👻", "🎃", "🕸️", "🕷️", "🦇", "💀", "🕯️", "🩸", "⚰️", "🌑", "🔮", "🧛"] },
  { name: "Música", emojis: ["🎶", "🎵", "🎼", "🎧", "🎤", "🎸", "🎹", "🥁", "🎷", "🎺", "📻", "🎚️", "🎛️"] },
  { name: "Games", emojis: ["🎮", "🕹️", "👾", "🔥", "⚔️", "🛡️", "🏆", "🎯", "🎲", "🧩", "💥", "🚀"] },
  { name: "Estudos", emojis: ["📚", "📖", "📝", "✏️", "📐", "📏", "🎓", "🧠", "🧪", "🔬", "📊", "💡"] },
  { name: "Trabalho", emojis: ["💼", "🖥️", "📊", "📈", "📉", "📅", "🗂️", "🧾", "📞", "☕", "⌨️", "🖨️", "⏰"] },
  { name: "Arte", emojis: ["🎨", "🖌️", "🖍️", "✏️", "🖼️", "🧑‍🎨", "🧵", "🪡", "📐", "✨", "🌈"] },
  { name: "Viagem", emojis: ["🌍", "✈️", "🧳", "🗺️", "📍", "📸", "🚆", "🚢", "🏝️", "🗽", "🗼"] },
  { name: "Aventura", emojis: ["🏕️", "🔥", "🗻", "🥾", "🎒", "🧭", "🌄", "🚵‍♂️", "🧗‍♂️", "🌲"] },
  { name: "Animais", emojis: ["🐾", "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐯", "🦁", "🐮", "🐷", "🐸"] },
  { name: "Fantasia", emojis: ["🧙‍♂️", "🪄", "🐉", "🦄", "✨", "📖", "🔮", "🏰", "👑", "⚔️", "🛡️", "🌌"] },
  { name: "Medieval", emojis: ["⚔️", "🛡️", "🏰", "👑", "🐎", "📜", "🔥", "🎺", "🕯️"] },
  { name: "Dark", emojis: ["🖤", "🌑", "🕷️", "🕸️", "🦇", "🔥", "🩸", "💀", "⚰️", "🌫️", "👁️"] },
  { name: "Minimalista", emojis: ["🤍", "⚪", "⬜", "📐", "📏", "✨", "🧘‍♂️", "🌫️"] },
  { name: "Neon", emojis: ["💜", "💙", "💚", "💛", "💖", "✨", "🌈", "⚡", "🌃", "🔮", "💡", "🎶"] },
  { name: "Positividade", emojis: ["🌞", "😊", "😁", "✨", "💛", "🌈", "💫", "🙌", "🌼", "🌻", "☀️", "💖"] },
  { name: "Tristeza", emojis: ["💔", "😢", "😞", "😭", "🌧️", "🥀", "🌫️", "🕯️", "💭", "🖤"] },
  { name: "Luxo", emojis: ["💎", "👑", "🥂", "🍾", "✨", "💼", "🕶️", "🛍️", "💍", "🏛️", "🌟"] },
  { name: "Cidade", emojis: ["🌆", "🏙️", "🌃", "🏢", "🚦", "🚕", "🚇", "🏬", "🗽", "🗼", "🏗️"] },
  { name: "Casa", emojis: ["🏡", "🛋️", "🕯️", "☕", "🪴", "🖼️", "🧸", "📺", "🍪", "🧹"] },
  { name: "Natureza", emojis: ["🌿", "🌍", "🍃", "🌳", "🌸", "🌱", "🌼", "🌾", "🦋", "🐦"] },
  { name: "Fotografia", emojis: ["📸", "📷", "🌄", "🌅", "🖼️", "✨", "🎞️", "🔍", "📐"] },
  { name: "Cinema", emojis: ["🎬", "🎥", "🍿", "📽️", "🎞️", "⭐", "🎭", "🏆", "📺"] },
  { name: "Streaming", emojis: ["📺", "📡", "🎧", "🎮", "🍿", "🛋️", "🔊", "🎬", "🌐"] },
  { name: "Compras", emojis: ["🛍️", "🛒", "🏷️", "💳", "💰", "🎁", "📦", "🏬", "🧾"] },
  { name: "Comida", emojis: ["🍔", "🍕", "🌮", "🍟", "🍝", "🥗", "🍣", "🍩", "🥤"] },
  { name: "Doces", emojis: ["🧁", "🍰", "🍪", "🍩", "🍫", "🍬", "🍭", "🍮", "🍦"] },
  { name: "Café", emojis: ["☕", "🍵", "🫖", "🥐", "🍪", "🧁", "📖", "🕯️", "🌧️"] },
  { name: "Relax", emojis: ["🧘‍♂️", "🧘‍♀️", "🌿", "🕯️", "☯️", "🎧", "🌊", "💤", "✨"] },
  { name: "Zen", emojis: ["🌸", "🍃", "🪷", "🧘", "🕯️", "☁️", "🌫️", "💭", "☯️"] },
  { name: "Criatividade", emojis: ["🧠", "💡", "✨", "🎨", "🖌️", "📐", "📓", "🚀", "🌈"] },
  { name: "Motivação", emojis: ["🔥", "🚀", "💪", "🏆", "✨", "⚡", "🎯", "📈", "🌟"] },
  { name: "Futurista", emojis: ["🌌", "🤖", "🚀", "🛸", "💡", "⚙️", "🔮", "🌠", "🧬"] },
  { name: "Vintage", emojis: ["🕰️", "📻", "📼", "📜", "🖋️", "🎞️", "🧳", "🪞"] },
  { name: "Colorido", emojis: ["🌈", "🎨", "💛", "💙", "💚", "💜", "🧡", "❤️", "✨"] },
  { name: "Energia", emojis: ["⚡", "🔋", "🔥", "💥", "🚀", "🎶", "🌟", "🏃‍♂️"] },
  { name: "Tecnologia", emojis: ["🖥️", "💻", "🧪", "🤖", "⚙️", "🔌", "📡", "🖱️", "⌨️"] },
  { name: "Negócios", emojis: ["📊", "📈", "📉", "💼", "🤝", "💡", "🏢", "📅", "🧾"] },
  { name: "Conquistas", emojis: ["🏆", "🥇", "🎖️", "🎯", "🚀", "👏", "✨", "📸", "🌟"] },
  { name: "Inspiração", emojis: ["🌟", "💫", "✨", "💡", "🚀", "📖", "🌈", "🕊️", "🎨"] },
];

export const Emojis = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const copyEmoji = (emoji: string) => {
    navigator.clipboard.writeText(emoji);
    toast.success(`${emoji} copiado!`);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />
      
      <FloatingBlob 
        color="blue" 
        size="xl" 
        position={{ top: "5%", left: "-5%" }}
        animation="float"
      />
      <FloatingBlob 
        color="pink" 
        size="lg" 
        position={{ bottom: "10%", right: "-5%" }}
        animation="float-delayed"
      />

      <main className="relative z-10 container mx-auto px-4 pt-24 pb-12">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-foreground/70 hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </button>

        <h1 className="text-3xl font-bold text-foreground mb-2">Emojis</h1>
        <p className="text-foreground/70 mb-8">50 Temas diversos para personalização | Clique em cima para copiar automaticamente</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emojiThemes.map((theme, index) => (
            <GlassCard key={index} className="p-4">
              <h3 className="text-lg font-semibold text-foreground mb-3">{theme.name}</h3>
              <div className="flex flex-wrap gap-1">
                {theme.emojis.map((emoji, emojiIndex) => (
                  <button
                    key={emojiIndex}
                    onClick={() => copyEmoji(emoji)}
                    className="text-2xl hover:scale-125 hover:bg-white/10 rounded p-1 transition-all duration-200 cursor-pointer"
                    title={`Copiar ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </main>
    </div>
  );
};

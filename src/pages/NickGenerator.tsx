import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { FloatingBlob } from "@/components/FloatingBlob";
import { GlassCard } from "@/components/GlassCard";
import { Copy, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

type FontMap = {
  upper: string[] | null;
  lower: string[] | null;
  digits: string[] | null;
};

const FONT_DATA: Record<string, FontMap> = {
  custom_cursive: { upper: ["ꪖ","Ꮖ","ᥴ","ᦔ","ꫀ","ᠻ","ᧁ","ꫝ","ꪱ","ꪀ","ᛕ","ꪶ","ꪑ","ꪀ","ꪮ","ᖘ","ᥴ","ᕴ","ꪊ","ꪻ","ꪊ","ꪜ","ꪡ","x","ꪗ","ɀ"], lower: null, digits: null },
  bold: { upper: ["𝐀","𝐁","𝐂","𝐃","𝐄","𝐅","𝐆","𝐇","𝐈","𝐉","𝐊","𝐋","𝐌","𝐍","𝐎","𝐏","𝐐","𝐑","𝐒","𝐓","𝐔","𝐕","𝐖","𝐗","𝐘","𝐙"], lower: ["𝐚","𝐛","𝐜","𝐝","𝐞","𝐟","𝐠","𝐡","𝐢","𝐣","𝐤","𝐥","𝐦","𝐧","𝐨","𝐩","𝐪","𝐫","𝐬","𝐭","𝐮","𝐯","𝐰","𝐱","𝐲","𝐳"], digits: ["𝟎","𝟏","𝟐","𝟑","𝟒","𝟓","𝟔","𝟕","𝟖","𝟗"] },
  italic: { upper: ["𝐴","𝐵","𝐶","𝐷","𝐸","𝐹","𝐺","𝐻","𝐼","𝐽","𝐾","𝐿","𝑀","𝑁","𝑂","𝑃","𝑄","𝑅","𝑆","𝑇","𝑈","𝑉","𝑊","𝑋","𝑌","𝑍"], lower: ["𝑎","𝑏","𝑐","𝑑","𝑒","𝑓","𝑔","ℎ","𝑖","𝑗","𝑘","𝑙","𝑚","𝑛","𝑜","𝑝","𝑞","𝑟","𝑠","𝑡","𝑢","𝑣","𝑤","𝑥","𝑦","𝑧"], digits: null },
  bold_italic: { upper: ["𝑨","𝑩","𝑪","𝑫","𝑬","𝑭","𝑮","𝑯","𝑰","𝑱","𝑲","𝑳","𝑴","𝑵","𝑶","𝑷","𝑸","𝑹","𝑺","𝑻","𝑼","𝑽","𝑾","𝑿","𝒀","𝒁"], lower: ["𝒂","𝒃","𝒄","𝒅","𝒆","𝒇","𝒈","𝒉","𝒊","𝒋","𝒌","𝒍","𝒎","𝒏","𝒐","𝒑","𝒒","𝒓","𝒔","𝒕","𝒖","𝒗","𝒘","𝒙","𝒚","𝒛"], digits: null },
  script: { upper: ["𝒜","ℬ","𝒞","𝒟","ℰ","ℱ","𝒢","ℋ","ℐ","𝒥","𝒦","ℒ","ℳ","𝒩","𝒪","𝒫","𝒬","ℛ","𝒮","𝒯","𝒰","𝒱","𝒲","𝒳","𝒴","𝒵"], lower: ["𝒶","𝒷","𝒸","𝒹","ℯ","𝒻","ℊ","𝒽","𝒾","𝒿","𝓀","𝓁","𝓂","𝓃","ℴ","𝓅","𝓆","𝓇","𝓈","𝓉","𝓊","𝓋","𝓌","𝓍","𝓎","𝓏"], digits: null },
  bold_script: { upper: ["𝓐","𝓑","𝓒","𝓓","𝓔","𝓕","𝓖","𝓗","𝓘","𝓙","𝓚","𝓛","𝓜","𝓝","𝓞","𝓟","𝓠","𝓡","𝓢","𝓣","𝓤","𝓥","𝓦","𝓧","𝓨","𝓩"], lower: ["𝓪","𝓫","𝓬","𝓭","𝓮","𝓯","𝓰","𝓱","𝓲","𝓳","𝓴","𝓵","𝓶","𝓷","𝓸","𝓹","𝓺","𝓻","𝓼","𝓽","𝓾","𝓿","𝔀","𝔁","𝔂","𝔃"], digits: null },
  fraktur: { upper: ["𝔄","ℬ","𝔆","𝔇","𝔈","𝔉","𝔊","ℌ","ℑ","𝔍","𝔎","𝔏","𝔐","𝔑","𝔒","𝔓","𝔔","ℜ","𝔖","𝔗","𝔘","𝔙","𝔚","𝔛","𝔜","ℨ"], lower: ["𝔞","𝔟","𝔠","𝔡","𝔢","𝔣","𝔤","𝔥","𝔦","𝔧","𝔨","𝔩","𝔪","𝔫","𝔬","𝔭","𝔮","𝔯","𝔰","𝔱","𝔲","𝔳","𝔴","𝔵","𝔶","𝔷"], digits: null },
  bold_fraktur: { upper: ["𝕬","𝕭","𝕮","𝕯","𝕰","𝕱","𝕲","𝕳","𝕴","𝕵","𝕶","𝕷","𝕸","𝕹","𝕺","𝕻","𝕼","𝕽","𝕾","𝕿","𝖀","𝖁","𝖂","𝖃","𝖄","𝖅"], lower: ["𝖆","𝖇","𝖈","𝖉","𝖊","𝖋","𝖌","𝖍","𝖎","𝖏","𝖐","𝖑","𝖒","𝖓","𝖔","𝖕","𝖖","𝖗","𝖘","𝖙","𝖚","𝖛","𝖜","𝖝","𝖞","𝖟"], digits: null },
  double_struck: { upper: ["𝔸","𝔹","ℂ","𝔻","𝔼","𝔽","𝔾","ℍ","𝕀","𝕁","𝕂","𝕃","𝕄","ℕ","𝕆","ℙ","ℚ","ℝ","𝕊","𝕋","𝕌","𝕍","𝕎","𝕏","𝕐","ℤ"], lower: ["𝕒","𝕓","𝕔","𝕕","𝕖","𝕗","𝕘","𝕙","𝕚","𝕛","𝕜","𝕝","𝕞","𝕟","𝕠","𝕡","𝕢","𝕣","𝕤","𝕥","𝕦","𝕧","𝕨","𝕩","𝕪","𝕫"], digits: ["𝟘","𝟙","𝟚","𝟛","𝟜","𝟝","𝟞","𝟟","𝟠","𝟡"] },
  monospace: { upper: ["𝙰","𝙱","𝙲","𝙳","𝙴","𝙵","𝙶","𝙷","𝙸","𝙹","𝙺","𝙻","𝙼","𝙽","𝙾","𝙿","𝚀","𝚁","𝚂","𝚃","𝚄","𝚅","𝚆","𝚇","𝚈","𝚉"], lower: ["𝚊","𝚋","𝚌","𝚍","𝚎","𝚏","𝚐","𝚑","𝚒","𝚓","𝚔","𝚕","𝚖","𝚗","𝚘","𝚙","𝚚","𝚛","𝚜","𝚝","𝚞","𝚟","𝚠","𝚡","𝚢","𝚣"], digits: ["𝟶","𝟷","𝟸","𝟹","𝟺","𝟻","𝟼","𝟽","𝟾","𝟿"] },
  sans: { upper: ["𝖠","𝖡","𝖢","𝖣","𝖤","𝖥","𝖦","𝖧","𝖨","𝖩","𝖪","𝖫","𝖬","𝖭","𝖮","𝖯","𝖰","𝖱","𝖲","𝖳","𝖴","𝖵","𝖶","𝖷","𝖸","𝖹"], lower: ["𝖺","𝖻","𝖼","𝖽","𝖾","𝖿","𝗀","𝗁","𝗂","𝗃","𝗄","𝗅","𝗆","𝗇","𝗈","𝗉","𝗊","𝗋","𝗌","𝗍","𝗎","𝗏","𝗐","𝗑","𝗒","𝗓"], digits: ["𝟢","𝟣","𝟤","𝟥","𝟦","𝟧","𝟨","𝟩","𝟪","𝟫"] },
  sans_bold: { upper: ["𝗔","𝗕","𝗖","𝗗","𝗘","𝗙","𝗚","𝗛","𝗜","𝗝","𝗞","𝗟","𝗠","𝗡","𝗢","𝗣","𝗤","𝗥","𝗦","𝗧","𝗨","𝗩","𝗪","𝗫","𝗬","𝗭"], lower: ["𝗮","𝗯","𝗰","𝗱","𝗲","𝗳","𝗴","𝗵","𝗶","𝗷","𝗸","𝗹","𝗺","𝗻","𝗼","𝗽","𝗾","𝗿","𝘀","𝘁","𝘂","𝘃","𝘄","𝘅","𝘆","𝘇"], digits: ["𝟬","𝟭","𝟮","𝟯","𝟰","𝟱","𝟲","𝟳","𝟴","𝟵"] },
  sans_italic: { upper: ["𝘈","𝘉","𝘊","𝘋","𝘌","𝘍","𝘎","𝘏","𝘐","𝘑","𝘒","𝘓","𝘔","𝘕","𝘖","𝘗","𝘘","𝘙","𝘚","𝘛","𝘜","𝘝","𝘞","𝘟","𝘠","𝘡"], lower: ["𝘢","𝘣","𝘤","𝘥","𝘦","𝘧","𝘨","𝘩","𝘪","𝘫","𝘬","𝘭","𝘮","𝘯","𝘰","𝘱","𝘲","𝘳","𝘴","𝘵","𝘶","𝘷","𝘸","𝘹","𝘺","𝘻"], digits: null },
  squared: { upper: ["🄰","🄱","🄲","🄳","🄴","🄵","🄶","🄷","🄸","🄹","🄺","🄻","🄼","🄽","🄾","🄿","🅀","🅁","🅂","🅃","🅄","🅅","🅆","🅇","🅈","🅉"], lower: ["🄰","🄱","🄲","🄳","🄴","🄵","🄶","🄷","🄸","🄹","🄺","🄻","🄼","🄽","🄾","🄿","🅀","🅁","🅂","🅃","🅄","🅅","🅆","🅇","🅈","🅉"], digits: null },
  squared_filled: { upper: ["🅰","🅱","🅲","🅳","🅴","🅵","🅶","🅷","🅸","🅹","🅺","🅻","🅼","🅽","🅾","🅿","🆀","🆁","🆂","🆃","🆄","🆅","🆆","🆇","🆈","🆉"], lower: ["🅰","🅱","🅲","🅳","🅴","🅵","🅶","🅷","🅸","🅹","🅺","🅻","🅼","🅽","🅾","🅿","🆀","🆁","🆂","🆃","🆄","🆅","🆆","🆇","🆈","🆉"], digits: null },
  circled: { upper: ["Ⓐ","Ⓑ","Ⓒ","Ⓓ","Ⓔ","Ⓕ","Ⓖ","Ⓗ","Ⓘ","Ⓙ","Ⓚ","Ⓛ","Ⓜ","Ⓝ","Ⓞ","Ⓟ","Ⓠ","Ⓡ","Ⓢ","Ⓣ","Ⓤ","Ⓥ","Ⓦ","Ⓧ","Ⓨ","Ⓩ"], lower: ["ⓐ","ⓑ","ⓒ","ⓓ","ⓔ","ⓕ","ⓖ","ⓗ","ⓘ","ⓙ","ⓚ","ⓛ","ⓜ","ⓝ","ⓞ","ⓟ","ⓠ","ⓡ","ⓢ","ⓣ","ⓤ","ⓥ","ⓦ","ⓧ","ⓨ","ⓩ"], digits: null },
  circled_filled: { upper: ["🅐","🅑","🅒","🅓","🅔","🅕","🅖","🅗","🅘","🅙","🅚","🅛","🅜","🅝","🅞","🅟","🅠","🅡","🅢","🅣","🅤","🅥","🅦","🅧","🅨","🅩"], lower: ["🅐","🅑","🅒","🅓","🅔","🅕","🅖","🅗","🅘","🅙","🅚","🅛","🅜","🅝","🅞","🅟","🅠","🅡","🅢","🅣","🅤","🅥","🅦","🅧","🅨","🅩"], digits: null },
  fullwidth: { upper: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"], lower: ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"], digits: ["0","1","2","3","4","5","6","7","8","9"] },
  small_caps: { upper: ["ᴀ","ʙ","ᴄ","ᴅ","ᴇ","ꜰ","ɢ","ʜ","ɪ","ᴊ","ᴋ","ʟ","ᴍ","ɴ","ᴏ","ᴘ","ǫ","ʀ","ꜱ","ᴛ","ᴜ","ᴠ","ᴡ","x","ʏ","ᴢ"], lower: ["ᴀ","ʙ","ᴄ","ᴅ","ᴇ","ꜰ","ɢ","ʜ","ɪ","ᴊ","ᴋ","ʟ","ᴍ","ɴ","ᴏ","ᴘ","ǫ","ʀ","ꜱ","ᴛ","ᴜ","ᴠ","ᴡ","x","ʏ","ᴢ"], digits: null },
};

const FONT_LABELS: Record<string, string> = {
  custom_cursive: "Cursivo Mágico",
  bold: "Negrito",
  italic: "Itálico",
  bold_italic: "Negrito Itálico",
  script: "Cursiva Elegante",
  bold_script: "Cursiva Negrito",
  fraktur: "Gótico",
  bold_fraktur: "Gótico Negrito",
  double_struck: "Contorno Duplo",
  monospace: "Monoespaçado",
  sans: "Sem Serifa",
  sans_bold: "Sem Serifa Negrito",
  sans_italic: "Sem Serifa Itálico",
  squared: "Quadrado",
  squared_filled: "Quadrado Preenchido",
  circled: "Círculo",
  circled_filled: "Círculo Preenchido",
  fullwidth: "Largura Total",
  small_caps: "Caixa Alta Pequena",
};

const FEATURED = "custom_cursive";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";

function convert(text: string, key: string) {
  const font = FONT_DATA[key];
  if (!font) return text;
  let out = "";
  for (const ch of text) {
    const u = UPPER.indexOf(ch);
    const l = LOWER.indexOf(ch);
    const d = DIGITS.indexOf(ch);
    if (u !== -1 && font.upper) out += font.upper[u];
    else if (l !== -1 && font.lower) out += font.lower[l];
    else if (l !== -1 && !font.lower && font.upper) out += font.upper[l];
    else if (u !== -1 && !font.upper && font.lower) out += font.lower[u];
    else if (d !== -1 && font.digits) out += font.digits[d];
    else out += ch;
  }
  return out;
}

export const NickGenerator = () => {
  const [input, setInput] = useState("Hello World");
  const [copied, setCopied] = useState<string | null>(null);
  const { t } = useLanguage();

  const keys = useMemo(() => {
    const all = Object.keys(FONT_DATA);
    return [FEATURED, ...all.filter((k) => k !== FEATURED)];
  }, []);

  const handleCopy = async (txt: string, key: string) => {
    if (!txt) return;
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(key);
      toast.success(t("nickCopied") || "Copiado!");
      setTimeout(() => setCopied(null), 1600);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  return (
    <div className="zgames-shell overflow-hidden relative">
      <div className="fixed inset-0 zgames-grid-line opacity-30" />
      <FloatingBlob color="blue" size="xl" position={{ top: "-10%", right: "-5%" }} animation="float" />
      <FloatingBlob color="purple" size="lg" position={{ bottom: "10%", left: "-10%" }} animation="float-delayed" />
      <FloatingBlob color="pink" size="md" position={{ top: "40%", right: "5%" }} animation="float-slow" />

      <Header />

      <main className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-zgames-green font-semibold mb-2">
              Conversor de texto
            </p>
            <h1 className="zgames-page-title text-4xl md:text-5xl mb-2">
              Gerador de fontes <span className="text-zgames-purple">estilizadas</span>
            </h1>
            <p className="text-foreground/60 text-sm md:text-base">
              Digite um texto e veja em vários estilos Unicode. Clique em copiar para usar em bio, status, nick, etc.
            </p>
          </div>

          <GlassCard className="p-5 md:p-6 mb-6">
            <label className="block text-xs uppercase tracking-wider text-foreground/60 mb-2">
              Seu texto
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escreva algo aqui..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 text-base resize-y"
              maxLength={200}
            />
            <div className="flex justify-between mt-2 text-xs text-foreground/50">
              <span>{input.length} caracteres</span>
              <span>Só A–Z convertidas; números/acentos variam por fonte</span>
            </div>
          </GlassCard>

          <div className="flex flex-col gap-3">
            {keys.map((key) => {
              const out = convert(input, key);
              const isFeatured = key === FEATURED;
              const isCopied = copied === key;
              return (
                <GlassCard
                  key={key}
                  onClick={() => handleCopy(out, key)}
                  className={`p-4 md:p-5 flex items-center gap-4 group ${
                    isFeatured ? "ring-2 ring-zgames-purple/60" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-zgames-green">
                        {FONT_LABELS[key]}
                      </span>
                      {isFeatured && (
                        <span className="bg-zgames-purple text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                          DESTAQUE
                        </span>
                      )}
                    </div>
                    <p className={`text-lg md:text-xl leading-snug break-words ${!out ? "text-foreground/40 text-sm" : "text-foreground"}`}>
                      {out || "—"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(out, key); }}
                    className={`flex-shrink-0 p-2.5 rounded-lg transition-all ${
                      isCopied
                        ? "bg-green-500/20 text-green-400"
                        : "bg-white/10 text-foreground/70 hover:bg-white/20 hover:text-foreground"
                    }`}
                    aria-label="Copiar"
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </GlassCard>
              );
            })}
          </div>

          <p className="text-xs text-foreground/40 mt-8 text-center max-w-2xl mx-auto leading-relaxed">
            Essas fontes são caracteres Unicode reais (não HTML/CSS), funcionam em qualquer lugar que aceite texto puro — bio, status, nick, etc. Algumas só cobrem o alfabeto latino.
          </p>
        </div>
      </main>
    </div>
  );
};

export default NickGenerator;

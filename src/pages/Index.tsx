import { useState, type LucideIcon } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, BadgeCheck, Bomb, ChevronRight, Dices, Film, Globe2,
  Instagram, LockKeyhole, Menu, Palette, Rocket, RotateCcw, Shapes,
  ShieldCheck, Sparkles, Trophy, Users, WandSparkles, X, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Game = { name: string; emoji: string; players: number };
type Tool = { name: string; description: string; path: string; icon: LucideIcon };

const games: Game[] = [
  { name: "Bingo das Sequências", emoji: "🔢", players: 30 },
  { name: "Jogo das Olimpíadas", emoji: "🏅", players: 35 },
  { name: "Jogo dos Filmes", emoji: "🎬", players: 35 },
  { name: "Jogo dos Países", emoji: "🌍", players: 35 },
  { name: "Jogo das Frutas", emoji: "🍎", players: 35 },
  { name: "Jogo das Cores", emoji: "🎨", players: 35 },
  { name: "Jogo das Comidas", emoji: "🍕", players: 35 },
  { name: "Jogo dos Invertidos", emoji: "🔀", players: 41 },
  { name: "Jogo dos Powers", emoji: "⚡", players: 35 },
  { name: "Jogo dos Snacks", emoji: "🍿", players: 35 },
  { name: "Jogo dos Animais", emoji: "🐾", players: 35 },
  { name: "Jogo das Marcas", emoji: "🏷️", players: 30 },
  { name: "Jogo dos Ritmos", emoji: "🎵", players: 30 },
  { name: "Cantores e Bandas", emoji: "🎤", players: 35 },
  { name: "Jogo dos Objetos", emoji: "🧩", players: 35 },
  { name: "Jogo dos Desenhos", emoji: "🖍️", players: 35 },
];

const tools: Tool[] = [
  { name: "Gerador de Nicks", description: "Crie nomes estilizados para usar no xat.", path: "/nicks", icon: Sparkles },
  { name: "Gerador de Cores", description: "Monte combinações e códigos de cores.", path: "/cores", icon: Palette },
  { name: "Bingo", description: "Faça sorteios rápidos e dinâmicos.", path: "/bingo", icon: Dices },
  { name: "Emojis", description: "Encontre e copie emojis por categoria.", path: "/emojis", icon: Shapes },
  { name: "Editor de Avatar", description: "Prepare seu avatar com praticidade.", path: "/avatar-editor", icon: WandSparkles },
];

const navItems = [
  ["Início", "#inicio"], ["Jogos", "#jogos"], ["Ferramentas", "#ferramentas"],
  ["Diferenciais", "#diferenciais"], ["Planos", "#planos"], ["Contato", "https://xat.com/mixhits"],
];

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

function GameCard({ game, index }: { game: Game; index: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.article
      {...reveal}
      transition={{ ...reveal.transition, delay: reduceMotion ? 0 : Math.min(index * 0.035, 0.28) }}
      whileHover={reduceMotion ? undefined : { y: -5, scale: 1.02 }}
      className="zgames-card group min-h-44 p-5 flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-12 place-items-center rounded-xl border border-border/70 bg-card/70 text-2xl" aria-hidden="true">{game.emoji}</span>
        <ChevronRight className="size-5 text-muted-foreground transition-colors group-hover:text-cyan" aria-hidden="true" />
      </div>
      <div>
        <h3 className="zgames-heading mt-5 text-base font-bold text-foreground">{game.name}</h3>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Users className="size-3.5 text-cyan" aria-hidden="true" /> Até {game.players} jogadores
        </p>
      </div>
    </motion.article>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <motion.div {...reveal} className="mx-auto mb-10 max-w-2xl text-center">
      <p className="mb-3 text-xs font-bold uppercase text-cyan">{eyebrow}</p>
      <h2 className="zgames-heading text-3xl font-extrabold text-foreground md:text-4xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">{description}</p>
    </motion.div>
  );
}

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <div className="zgames-page zgames-grid-line min-h-screen overflow-x-hidden text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/65 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#inicio" aria-label="ZGames - início" className="zgames-heading text-2xl font-extrabold zgames-text-gradient">ZGames</a>
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Navegação principal">
            {navItems.map(([label, href]) => (
              <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className="text-sm font-medium text-muted-foreground transition-colors hover:text-cyan">{label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="neon" className="hidden rounded-xl sm:inline-flex zgames-pulse">
              <a href="https://xat.com/mixhits" target="_blank" rel="noopener noreferrer">Quero meu painel <ArrowRight /></a>
            </Button>
            <Button variant="glass" size="icon" className="lg:hidden" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-border/50 bg-background/90 px-4 py-4 backdrop-blur-2xl lg:hidden" aria-label="Menu móvel">
            <div className="mx-auto grid max-w-7xl gap-1">
              {navItems.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-card hover:text-cyan">{label}</a>)}
            </div>
          </nav>
        )}
      </header>

      <main>
        <section id="inicio" className="relative flex min-h-[760px] items-center px-4 pb-20 pt-28 sm:px-6 lg:px-8">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_.92fr]">
            <motion.div initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                <Zap className="size-3.5" /> 16+ jogos disponíveis · Atualizações mensais
              </span>
              <h1 className="zgames-heading mt-6 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Leve os melhores jogos e bingos para sua sala do <span className="zgames-text-gradient">Xat</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Painéis modernos, seguros e atualizados todo mês — para donos de sala que querem dar vida às suas dinâmicas.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" variant="neon" className="rounded-xl zgames-pulse"><a href="#jogos">Ver Jogos <ArrowRight /></a></Button>
                <Button asChild size="lg" variant="glass" className="rounded-xl"><a href="https://xat.com/mixhits" target="_blank" rel="noopener noreferrer">Falar com a gente</a></Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-2"><BadgeCheck className="size-4 text-cyan" /> Instalação simplificada</span>
                <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-cyan" /> Suporte contínuo</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30, rotate: reduceMotion ? 0 : 1.5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.15 }} className="relative mx-auto w-full max-w-lg">
              <div className="absolute -inset-8 bg-primary/10 blur-3xl" aria-hidden="true" />
              <div className="zgames-card relative overflow-hidden p-5 sm:p-7">
                <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-5">
                  <div><p className="text-xs font-semibold text-cyan">PAINEL AO VIVO</p><p className="zgames-heading mt-1 text-xl font-bold">Bingo das Sequências</p></div>
                  <span className="flex items-center gap-2 rounded-full bg-cyan/10 px-3 py-1 text-xs font-semibold text-cyan"><span className="size-2 rounded-full bg-cyan zgames-pulse" /> Online</span>
                </div>
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {[7, 18, 24, 32, 45, 3, 16, 29, 38, 41, 10, 21, 35, 44, 50].map((number, index) => (
                    <div key={number} className={`grid aspect-square place-items-center rounded-xl border text-sm font-bold sm:text-base ${index === 12 ? "border-primary bg-primary text-primary-foreground shadow-neon" : "border-border/70 bg-card/70 text-muted-foreground"}`}>{number}</div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between rounded-xl border border-border/60 bg-card/50 p-4">
                  <span className="text-xs text-muted-foreground">Último sorteado</span><span className="zgames-heading text-2xl font-extrabold text-primary">35</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="jogos" className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading eyebrow="Catálogo ZGames" title="Um jogo novo para cada dinâmica" description="Painéis preparados para divertir comunidades pequenas ou grandes, com visual claro e operação simples." />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{games.map((game, index) => <GameCard key={game.name} game={game} index={index} />)}</div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 lg:px-8">
          <motion.div {...reveal} className="zgames-card zgames-bomb-card mx-auto grid max-w-7xl overflow-hidden p-7 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2"><span className="rounded-full bg-ember/15 px-3 py-1 text-xs font-bold text-ember">MAIS JOGADO</span><span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">EXCLUSIVO ZGAMES</span></div>
              <h2 className="zgames-heading mt-5 text-3xl font-extrabold md:text-4xl">Jogo Bomba Atômica 💣</h2>
              <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">Cada jogador escolhe 5 números de 1 a 15. A cada rodada, uma bomba explode um número. Ganha quem sobreviver com o último número restante!</p>
              <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-ember"><Users className="size-4" /> Jogadores ilimitados 🔥</p>
            </div>
            <div className="mt-8 grid size-36 place-items-center rounded-2xl border border-ember/30 bg-ember/10 shadow-neon md:mt-0" aria-hidden="true"><Bomb className="size-20 text-ember" /></div>
          </motion.div>
        </section>

        <section id="ferramentas" className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading eyebrow="Ferramentas gratuitas" title="Tudo que sua comunidade precisa" description="As ferramentas que você já usa continuam disponíveis, agora organizadas em um único lugar." />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {tools.map((tool, index) => (
                <motion.div key={tool.name} {...reveal} transition={{ ...reveal.transition, delay: index * 0.06 }} whileHover={reduceMotion ? undefined : { y: -4 }}>
                  <Link to={tool.path} className="zgames-card group flex h-full min-h-52 flex-col p-5">
                    <span className="grid size-11 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary"><tool.icon className="size-5" /></span>
                    <h3 className="zgames-heading mt-5 font-bold">{tool.name}</h3><p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{tool.description}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-cyan">Abrir ferramenta <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-1" /></span>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-5 text-center"><Button asChild variant="glass"><Link to="/sobre">Conheça o projeto</Link></Button></div>
          </div>
        </section>

        <section id="diferenciais" className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading eyebrow="Nosso diferencial" title="Feito para quem movimenta salas" description="Tecnologia confiável sem complicar a rotina de quem organiza cada partida." />
            <div className="grid gap-5 md:grid-cols-3">
              {[
                { icon: Rocket, title: "Plataforma Moderna", text: "Interface rápida, bonita e fácil de usar." },
                { icon: LockKeyhole, title: "Segurança", text: "Painéis protegidos, sem riscos para sua sala." },
                { icon: RotateCcw, title: "Atualizações Mensais", text: "Novos jogos e melhorias todo mês." },
              ].map((item, index) => <motion.article key={item.title} {...reveal} transition={{ ...reveal.transition, delay: index * 0.1 }} className="zgames-card p-7"><item.icon className="size-8 text-cyan" /><h3 className="zgames-heading mt-5 text-xl font-bold">{item.title}</h3><p className="mt-3 leading-7 text-muted-foreground">{item.text}</p></motion.article>)}
            </div>
          </div>
        </section>

        <section id="planos" className="px-4 py-16 sm:px-6 lg:px-8">
          <motion.div {...reveal} className="zgames-cta-band mx-auto max-w-7xl rounded-2xl border border-primary/25 px-6 py-16 text-center shadow-neon md:px-12">
            <Trophy className="mx-auto size-9 text-cyan" />
            <h2 className="zgames-heading mt-5 text-3xl font-extrabold md:text-5xl">Pronto para transformar sua sala?</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Escolha seus jogos e leve uma experiência profissional para sua comunidade.</p>
            <Button asChild size="lg" variant="neon" className="mt-8 rounded-xl zgames-pulse"><a href="https://xat.com/mixhits" target="_blank" rel="noopener noreferrer">Quero meu painel ZGames <ArrowRight /></a></Button>
          </motion.div>
        </section>
      </main>

      <footer className="mt-16 border-t border-border/60 bg-background/55 px-4 py-10 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div><p className="zgames-heading text-2xl font-extrabold zgames-text-gradient">ZGames</p><p className="mt-2 text-xs text-muted-foreground">© 2026 ZGames. Todos os direitos reservados.</p></div>
          <div className="flex flex-wrap justify-center gap-5 text-xs font-medium text-muted-foreground"><Link to="/sobre" className="hover:text-cyan">Sobre</Link><Link to="/privacidade" className="hover:text-cyan">Privacidade</Link><Link to="/termos" className="hover:text-cyan">Termos</Link><a href="https://xat.com/mixhits" target="_blank" rel="noopener noreferrer" className="hover:text-cyan">Contato</a></div>
          <a href="https://xat.com/mixhits" target="_blank" rel="noopener noreferrer" aria-label="ZGames no xat" className="grid size-10 place-items-center rounded-xl border border-border bg-card/50 text-muted-foreground transition-colors hover:text-cyan"><Instagram className="size-4" /></a>
        </div>
      </footer>
    </div>
  );
};

export default Index;
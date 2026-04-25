import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./contexts/LanguageContext";
import { lazy, Suspense } from "react";

// Eager-loaded: home is the LCP page, keep it in the initial bundle.
import Index from "./pages/Index";

// Lazy-loaded: every other route is split into its own chunk so the
// initial JS payload (and TBT) shrinks dramatically.
const ColorGenerator = lazy(() => import("./pages/ColorGenerator"));
const NickGenerator = lazy(() => import("./pages/NickGenerator").then(m => ({ default: m.NickGenerator })));
const Bingo = lazy(() => import("./pages/Bingo").then(m => ({ default: m.Bingo })));
const BingoAnimais = lazy(() => import("./pages/BingoAnimais").then(m => ({ default: m.BingoAnimais })));
const GraphicsFree = lazy(() => import("./pages/GraphicsFree").then(m => ({ default: m.GraphicsFree })));
const Emojis = lazy(() => import("./pages/Emojis").then(m => ({ default: m.Emojis })));
const BingoCards = lazy(() => import("./pages/BingoCards").then(m => ({ default: m.BingoCards })));
const AvatarEditor = lazy(() => import("./pages/AvatarEditor").then(m => ({ default: m.AvatarEditor })));
const BingoCardView = lazy(() => import("./pages/BingoCardView").then(m => ({ default: m.BingoCardView })));
const BingoCardsAccess = lazy(() => import("./pages/BingoCardsAccess").then(m => ({ default: m.BingoCardsAccess })));
const BingoGames = lazy(() => import("./pages/BingoGames").then(m => ({ default: m.BingoGames })));
const BingoPanel = lazy(() => import("./pages/BingoPanel").then(m => ({ default: m.BingoPanel })));
const About = lazy(() => import("./pages/About").then(m => ({ default: m.About })));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy").then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import("./pages/TermsOfService").then(m => ({ default: m.TermsOfService })));
const Works = lazy(() => import("./pages/Works").then(m => ({ default: m.Works })));
const MixHits = lazy(() => import("./pages/MixHits").then(m => ({ default: m.MixHits })));
const Games = lazy(() => import("./pages/Games").then(m => ({ default: m.Games })));
const Control = lazy(() => import("./pages/Control").then(m => ({ default: m.Control })));
const Bingo2 = lazy(() => import("./pages/Bingo2"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Non-critical UI: defer until after first paint.
const CookieConsent = lazy(() => import("./components/CookieConsent").then(m => ({ default: m.CookieConsent })));
const FloatingRadio = lazy(() => import("./components/FloatingRadio").then(m => ({ default: m.FloatingRadio })));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen bg-background" aria-hidden="true" />
);

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/cores" element={<ColorGenerator />} />
              <Route path="/nicks" element={<NickGenerator />} />
              <Route path="/bingo" element={<Bingo />} />
              <Route path="/bingoanimais" element={<BingoAnimais />} />
              <Route path="/graphics" element={<GraphicsFree />} />
              <Route path="/emojis" element={<Emojis />} />
              <Route path="/avatar-editor" element={<AvatarEditor />} />
              <Route path="/cartelas" element={<BingoCards />} />
              <Route path="/cartelas/:userName" element={<BingoCardsAccess />} />
              <Route path="/bingo/cartela/:userName/:cardId" element={<BingoCardView />} />
              <Route path="/bingo-games" element={<BingoGames />} />
              <Route path="/Painel" element={<BingoPanel />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/privacidade" element={<PrivacyPolicy />} />
              <Route path="/termos" element={<TermsOfService />} />
              <Route path="/works" element={<Works />} />
              <Route path="/mixhits" element={<MixHits />} />
              <Route path="/games" element={<Games />} />
              <Route path="/control" element={<Control />} />
              <Route path="/bingo2" element={<Bingo2 />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Suspense fallback={null}>
            <CookieConsent />
            <FloatingRadio />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;

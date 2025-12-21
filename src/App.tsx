import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import ColorGenerator from "./pages/ColorGenerator";
import { NickGenerator } from "./pages/NickGenerator";
import { Bingo } from "./pages/Bingo";
import { GraphicsFree } from "./pages/GraphicsFree";
import { About } from "./pages/About";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { CookieConsent } from "./components/CookieConsent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cores" element={<ColorGenerator />} />
            <Route path="/nicks" element={<NickGenerator />} />
            <Route path="/bingo" element={<Bingo />} />
            <Route path="/graphics" element={<GraphicsFree />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/privacidade" element={<PrivacyPolicy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
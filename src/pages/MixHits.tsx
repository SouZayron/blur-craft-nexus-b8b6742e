import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AppOption {
  name: string;
  image: string;
  colorCode: string;
}

interface Selection {
  app_name: string;
  user_name: string;
  user_id: string;
}

const appOptions: AppOption[] = [
  { name: "Instagram", image: "https://xatimg.com/image/0W9nJzIdugiw.jpg", colorCode: "(glow#E1306C#grad#r45#FCAF45#F77737#E1306C#C13584#833AB4#o3)" },
  { name: "TikTok", image: "https://xatimg.com/image/95sosAIYhpaH.jpg", colorCode: "(glow#66BFBF#grad#r45#69C9D0#EE1D52#BB1D52#f6)" },
  { name: "Facebook", image: "https://xatimg.com/image/v05Hi24iXwuf.jpg", colorCode: "(glow#1877F2#grad#r45#ADD8E6#1877F2#0A66C2#0047AB#o3)" },
  { name: "X (Twitter)", image: "https://xatimg.com/image/PrAjoG38l2Zr.jpg", colorCode: "(glow#1a1d20#grad#r60#52575c#282c30#0f1113#o3)" },
  { name: "Pinterest", image: "https://xatimg.com/image/Pby7duiydGXu.jpg", colorCode: "(glow#DC143C#grad#r55#FF6347#FF0000#CD5C5C#o3)" },
  { name: "Kwai", image: "https://xatimg.com/image/3j6AWUmb9xPM.jpg", colorCode: "(glow#FF5733#grad#r60#FF5733#FFC300#FF5733#o2)" },
  { name: "Spotify", image: "https://xatimg.com/image/bGUNRoMIRpWy.jpg", colorCode: "(glow#1DB954#grad#r60#1ED760#1DB954#0F7D2B#0A5B1D#o2)" },
  { name: "YouTube", image: "https://xatimg.com/image/3h12TlElzICD.jpg", colorCode: "(glow#FF0000#grad#r0#FF0000#E60000#FFFFFF#CCCCCC#o3)" },
  { name: "Netflix", image: "https://xatimg.com/image/ILoK9jHwXb44.jpg", colorCode: "(glow#E50914#grad#r45#B20710#E50914#221F1F#f6)" },
  { name: "WhatsApp", image: "https://xatimg.com/image/Kdr5NgqLHD5G.jpg", colorCode: "(glow#25D366#grad#r45#25D366#128C7E#075E54#o3)" },
  { name: "Telegram", image: "https://xatimg.com/image/NKx8vRw9zZpq.jpg", colorCode: "(glow#36AEE2#grad#r45#2AABEE#5FB0DA#C0DAED#o3)" },
  { name: "Discord", image: "https://xatimg.com/image/JbnPA2kNVjnj.jpg", colorCode: "(glow#7289DA#grad#r45#7289DA#99AAB5#424549#2C2F33#o3)" },
  { name: "Uber", image: "https://xatimg.com/image/YGW4PCbJZMdG.jpg", colorCode: "(glow#1C1C1C#grad#r60#1C1C1C#3C3C3C#666666#A0A0A0#o3)" },
  { name: "99", image: "https://xatimg.com/image/bPS7IOW6eDcZ.jpg", colorCode: "(glow#FFD700#grad#r45#000000#36454F#FFD700#FFFF00#o2)" },
  { name: "iFood", image: "https://xatimg.com/image/dTJGzyZ52uw1.jpg", colorCode: "(glow#FF0000#grad#r45#FF0000#FFFFFF#o3)" },
  { name: "Tinder", image: "https://xatimg.com/image/HnYcSEZdV1yN.jpg", colorCode: "(glow#FF4500#grad#r80#FFDAB9#FF4500#FF6347#CD5C5C#f6)" },
  { name: "Nubank", image: "https://xatimg.com/image/i1Ejz7s4tyW3.jpg", colorCode: "(glow#8A2BE2#grad#r70#E6E6FA#8A2BE2#9370DB#6A5ACD#o3)" },
  { name: "PicPay", image: "https://xatimg.com/image/qefmPFIQR1Ly.jpg", colorCode: "(glow#DCF8C6#grad#r45#FFFFFF#E0FFE0#90EE90#3CB371#o3)" },
  { name: "Shopee", image: "https://xatimg.com/image/WrBzmqzNKM5x.jpg", colorCode: "(glow#FFA500#grad#r30#F8F8FF#FFBF00#FF8C00#FF4500#f8)" },
  { name: "Amazon", image: "https://xatimg.com/image/jwWAOhtGj1ow.jpg", colorCode: "(glow#FFA500#grad#r70#FFD700#FFA500#FF8C00#f6)" },
  { name: "AliExpress", image: "https://xatimg.com/image/p9dRqazYXJ0x.jpg", colorCode: "(glow#FFCC00#grad#r60#FFCC00#FF9933#FF6600#161616#f6)" },
  { name: "Shein", image: "https://xatimg.com/image/vSREvpQe1gAs.jpg", colorCode: "(glow#333333#grad#r30#000000#222222#444444#666666#888888#f8)" },
  { name: "Canva", image: "https://xatimg.com/image/YAYJMnoxXVlf.jpg", colorCode: "(glow#FF00FF#grad#r30#FF1493#DA70D6#9932CC#8A2BE2#o3)" },
  { name: "Waze", image: "https://xatimg.com/image/0Ts8ogCtVAS5.jpg", colorCode: "(glow#ADD8E6#grad#r60#E0FFFF#B0E0E6#87CEEB#b#o2)" },
  { name: "Duolingo", image: "https://xatimg.com/image/R7tUQROxHZdL.jpg", colorCode: "(glow#58CC02#grad#r30#A4FF00#58CC02#2ECC71#27AE60#o3)" },
  { name: "Airbnb", image: "https://xatimg.com/image/5cuxR47zCvqr.jpg", colorCode: "(glow#FF5A5F#grad#r70#FFC0CB#FF5A5F#o3)" },
  { name: "Orkut", image: "https://xatimg.com/image/6roomDYZhJ0L.jpg", colorCode: "(glow#FF69B4#grad#r80#FFC0CB#FFB6C1#FF69B4#C71585#o3)" },
  { name: "Privacy", image: "https://xatimg.com/image/R9YD9TKdcAlo.jpg", colorCode: "(glow#FF4500#grad#r75#8B0000#CD5C5C#F08080#FFA07A#o3)" },
  { name: "Xat.com", image: "https://xatimg.com/image/olkxB0e7oPsq.jpg", colorCode: "(glow#007BFF#grad#r45#007BFF#0056B3#003366#f6)" },
  { name: "Olx", image: "https://xatimg.com/image/mEbJEVxJoG9u.jpg", colorCode: "(glow#9900FF#grad#r40#CC66FF#9900FF#6600CC#f10)" },
  { name: "Mercado Livre", image: "https://xatimg.com/image/5Sum8Srj1TON.jpg", colorCode: "(glow#3483FA#grad#r75#FFE600#FFD700#3483FA#2968C8#o3)" },
];

export const MixHits = () => {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [selectedAppForForm, setSelectedAppForForm] = useState<AppOption | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [selectedApp, setSelectedApp] = useState<AppOption | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [copiedColor, setCopiedColor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedUserName, setConfirmedUserName] = useState("");
  const [confirmedUserId, setConfirmedUserId] = useState("");
  const { toast } = useToast();

  // Fetch existing selections
  useEffect(() => {
    fetchSelections();
  }, []);

  const fetchSelections = async () => {
    const { data, error } = await supabase
      .from("mixhits_selections")
      .select("app_name, user_name, user_id");
    
    if (!error && data) {
      setSelections(data);
    }
  };

  const getSelectionForApp = (appName: string): Selection | undefined => {
    return selections.find(s => s.app_name === appName);
  };

  const handleSelectClick = (app: AppOption) => {
    const existingSelection = getSelectionForApp(app.name);
    if (existingSelection) {
      toast({
        title: "Fantasia já escolhida!",
        description: `${existingSelection.user_name} #${existingSelection.user_id} já escolheu ${app.name}`,
        variant: "destructive",
      });
      return;
    }
    setSelectedAppForForm(app);
    setUserName("");
    setUserId("");
    setFormDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForForm || !userName.trim() || !userId.trim()) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("mixhits_selections")
        .insert({
          app_name: selectedAppForForm.name,
          user_name: userName.trim(),
          user_id: userId.trim(),
        });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Fantasia já escolhida!",
            description: "Alguém acabou de escolher essa fantasia. Tente outra!",
            variant: "destructive",
          });
          await fetchSelections();
        } else {
          throw error;
        }
      } else {
        // Success - show result popup
        setConfirmedUserName(userName.trim());
        setConfirmedUserId(userId.trim());
        setSelectedApp(selectedAppForForm);
        setFormDialogOpen(false);
        setResultDialogOpen(true);
        await fetchSelections();
        toast({
          title: "Fantasia reservada!",
          description: `Você escolheu ${selectedAppForForm.name}!`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível reservar a fantasia. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyColor = async () => {
    if (selectedApp) {
      await navigator.clipboard.writeText(selectedApp.colorCode);
      setCopiedColor(true);
      toast({
        title: "Cor copiada!",
        description: "O código de cor foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopiedColor(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#0f0a1a]">
      <Header />
      
      <main className="container mx-auto px-4 py-12 pt-24 min-h-[calc(100vh-200px)]">
        <div className="text-center mb-12">
          <img 
            src="https://xatimg.com/image/ch0vUciFYIgI.png" 
            alt="Mix Hits" 
            className="h-48 md:h-64 lg:h-72 mx-auto mb-6 drop-shadow-2xl"
            style={{
              animation: "float 3s ease-in-out infinite",
              filter: "drop-shadow(0 0 30px rgba(168, 85, 247, 0.4))"
            }}
          />
          <p className="text-purple-200/70 text-lg">
            Escolha sua fantasia para a festa! Clique em "Selecionar" para reservar.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {appOptions.map((app) => {
            const selection = getSelectionForApp(app.name);
            const isTaken = !!selection;

            return (
              <div
                key={app.name}
                className={`relative backdrop-blur-xl bg-purple-900/20 border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isTaken 
                    ? "border-red-500/50 opacity-75" 
                    : "border-purple-500/20 hover:border-purple-400/50 hover:shadow-xl hover:shadow-purple-500/20"
                }`}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={app.image}
                    alt={app.name}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      isTaken ? "grayscale" : ""
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  {isTaken && (
                    <div className="absolute top-2 right-2 bg-red-500/90 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      Reservado
                    </div>
                  )}
                </div>
                
                <div className="p-3 space-y-2">
                  <p className="text-white font-semibold text-sm text-center truncate">
                    {app.name}
                  </p>
                  
                  {isTaken ? (
                    <div className="text-center">
                      <p className="text-red-300 text-xs truncate">
                        {selection.user_name} #{selection.user_id}
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleSelectClick(app)}
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-semibold"
                    >
                      Selecionar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Form Dialog - Enter Name and ID */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0f0a1a] border-purple-500/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-white text-xl">
              Reservar: <span className="text-purple-400">{selectedAppForForm?.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedAppForForm && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-500/20">
                <img
                  src={selectedAppForForm.image}
                  alt={selectedAppForForm.name}
                  className="w-full h-40 object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Seu Nome
                  </label>
                  <Input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Digite seu nome"
                    className="bg-purple-950/50 border-purple-500/40 text-white placeholder:text-purple-300/50 focus:border-purple-400"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Seu ID (número)
                  </label>
                  <Input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Digite seu ID"
                    className="bg-purple-950/50 border-purple-500/40 text-white placeholder:text-purple-300/50 focus:border-purple-400"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Reservando...
                  </>
                ) : (
                  "Confirmar Reserva"
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Result Dialog - Show photo and color */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0f0a1a] border-purple-500/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-white text-xl">
              Sua Fantasia: <span className="text-purple-400">{selectedApp?.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="backdrop-blur-xl bg-purple-900/30 border border-purple-500/30 rounded-full px-4 py-2 inline-block mb-4">
                  <span className="text-purple-200 font-medium">
                    {confirmedUserName} <span className="text-purple-400">#{confirmedUserId}</span>
                  </span>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-500/20">
                <img
                  src={selectedApp.image}
                  alt={selectedApp.name}
                  className="w-full h-auto"
                />
              </div>

              <div className="space-y-3">
                <p className="text-purple-200 text-sm font-medium text-center">
                  Sugestão de Cor:
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 backdrop-blur-xl bg-purple-950/50 border border-purple-500/30 rounded-xl p-3 overflow-x-auto">
                    <code className="text-purple-300 text-xs break-all">
                      {selectedApp.colorCode}
                    </code>
                  </div>
                  <Button
                    onClick={handleCopyColor}
                    size="icon"
                    className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {copiedColor ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default MixHits;

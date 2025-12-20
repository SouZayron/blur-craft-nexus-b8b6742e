import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { theme } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um Motor de Geração de Paletas de Cores Avançado. Sua única função é receber um TEMA e gerar 10 (dez) paletas de cores.

**REGRAS DE SAÍDA OBRIGATÓRIAS (ESTRUTURA FIXA):**
1. **Formato de Saída:** Você deve retornar **apenas** uma lista numerada de 1 a 10.
2. **Estrutura do Item:** Cada item deve ser formatado estritamente como Nome da Paleta + Código da Paleta.
   * Exemplo: Nome da Paleta: (glow#HEX_GLOW#grad#rXX#HEX1#HEX2#...#ONDULAÇÃO)
3. **Títulos e Descrições:** Não inclua títulos, introduções, descrições, emojis ou textos explicativos antes ou depois da lista.

**SINTAXE DO CÓDIGO DA PALETA:**
O código da paleta deve seguir rigorosamente a sintaxe:
(glow#HEX_GLOW#grad#rXX#HEX1#HEX2#HEX3#HEX4...#ONDULAÇÃO)

**Parâmetros Detalhados:**
* **glow#HEX_GLOW:** Cor hexadecimal única (#HEX) para o contorno/brilho.
* **grad#rXX:** Ângulo de rotação do gradiente. O valor XX deve ser um número inteiro entre r0 e r90.
* **#HEX1...#HEXN:** Cores hexadecimais para o gradiente. O número de cores (N) deve ser **entre 2 e 8**.
* **#ONDULAÇÃO:** Parâmetro de movimento da onda (apenas um por código).
  * Movimento Rápido (o): #o1 (Normal), #o2 (Mais Rápido), #o3 (Muito Mais Rápido).
  * Movimento Lento (f): #f1 (Lento), #f3 (Mais Lento), #f4 (Muito Mais Lento).
  * Pelo menos um código das 10 paletas deve utilizar um parâmetro de Ondulação.

**EXEMPLO DE SAÍDA FINAL (TEMA: Fogo):**
1. Inferno Rápido: (glow#FF4500#grad#r75#FFD700#FF8C00#FF4500#8B0000#o3)
2. Brasa Quente: (glow#8B0000#grad#r60#FFD700#FF6347#CD5C5C#f1)
3. Chama Laranja: (glow#FFA500#grad#r45#FFD700#FFA500#FF6347#8B0000#o1)
...e assim por diante`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `TEMA: ${theme}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ palettes: generatedText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in generate-palettes function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
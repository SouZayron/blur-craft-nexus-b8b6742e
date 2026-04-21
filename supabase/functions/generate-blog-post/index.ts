import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES = ["tech", "curiosidades", "comunicacao"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_PROMPT: Record<Category, string> = {
  tech: "tecnologia, inovação, gadgets, IA, programação, internet ou cultura digital",
  curiosidades:
    "fatos curiosos pouco conhecidos, ciência popular, história estranha, mistérios resolvidos, descobertas surpreendentes",
  comunicacao:
    "comunicação humana, redes sociais, comportamento online, linguagem, mídia, marketing digital, oratória",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function callLovableAI(body: Record<string, unknown>, apiKey: string) {
  const resp = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Lovable AI error ${resp.status}: ${text}`);
  }
  return await resp.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SERVICE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Pick category by rotating through them based on day of year
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86_400_000,
    );
    const category: Category = CATEGORIES[dayOfYear % CATEGORIES.length];

    console.log(`[blog] Generating article for category: ${category}`);

    // 1. Generate article via Gemini with structured output
    const articlePayload = {
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "Você é um redator profissional brasileiro especializado em criar artigos de blog envolventes, bem estruturados e otimizados para SEO. Escreva sempre em português do Brasil, com tom acessível mas inteligente.",
        },
        {
          role: "user",
          content: `Crie um artigo COMPLETO de blog com aproximadamente 1000 palavras sobre um tema de ${CATEGORY_PROMPT[category]}.

Escolha um tema interessante, atual e específico (não genérico). Estruture o conteúdo HTML usando:
- 1 <h1> com o título principal
- Vários <h2> para seções (mínimo 4)
- <h3> para subseções quando fizer sentido
- <p> para parágrafos
- <ul>/<ol>/<li> para listas
- <strong> e <em> para destaques
- 2 a 4 <a href="URL"> com hiperlinks externos REAIS e relevantes (Wikipedia, sites oficiais, artigos confiáveis), com target="_blank" e rel="noopener noreferrer"
- 1 <blockquote> com uma citação ou destaque

NÃO inclua tags <html>, <head> ou <body>. Apenas o conteúdo do artigo.
Retorne via tool call.`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "publish_article",
            description: "Publica o artigo gerado",
            parameters: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Título principal do artigo (max 80 chars)",
                },
                excerpt: {
                  type: "string",
                  description:
                    "Resumo cativante de 2-3 frases (max 200 chars)",
                },
                content_html: {
                  type: "string",
                  description:
                    "Conteúdo HTML completo do artigo, ~1000 palavras",
                },
                meta_title: {
                  type: "string",
                  description: "Título SEO otimizado (max 60 chars)",
                },
                meta_description: {
                  type: "string",
                  description: "Meta description SEO (max 155 chars)",
                },
                image_prompt: {
                  type: "string",
                  description:
                    "Prompt em INGLÊS para gerar uma imagem fotorrealista de capa, descrevendo a cena visual relacionada ao artigo. Sem texto na imagem.",
                },
                reading_time_minutes: {
                  type: "integer",
                  description: "Tempo estimado de leitura em minutos",
                },
              },
              required: [
                "title",
                "excerpt",
                "content_html",
                "meta_title",
                "meta_description",
                "image_prompt",
                "reading_time_minutes",
              ],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: {
        type: "function",
        function: { name: "publish_article" },
      },
    };

    const articleResp = await callLovableAI(articlePayload, LOVABLE_API_KEY);
    const toolCall =
      articleResp.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!toolCall) {
      throw new Error("AI did not return a tool call");
    }
    const article = JSON.parse(toolCall) as {
      title: string;
      excerpt: string;
      content_html: string;
      meta_title: string;
      meta_description: string;
      image_prompt: string;
      reading_time_minutes: number;
    };

    console.log(`[blog] Article generated: "${article.title}"`);

    // 2. Generate cover image via Nano Banana
    let coverImageUrl: string | null = null;
    try {
      const imageResp = await callLovableAI(
        {
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: `Photorealistic, high-quality editorial blog cover image. ${article.image_prompt}. Cinematic lighting, vibrant colors, no text, no watermark, 16:9 composition.`,
            },
          ],
          modalities: ["image", "text"],
        },
        LOVABLE_API_KEY,
      );
      const dataUrl =
        imageResp.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (dataUrl?.startsWith("data:image/")) {
        // Upload to ImgBB so we don't store huge base64 in DB
        const IMGBB_KEY = Deno.env.get("IMGBB_API_KEY");
        if (IMGBB_KEY) {
          const base64 = dataUrl.split(",")[1];
          const form = new FormData();
          form.append("image", base64);
          const up = await fetch(
            `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
            { method: "POST", body: form },
          );
          const upData = await up.json();
          if (upData?.data?.url) {
            coverImageUrl = upData.data.url;
          }
        } else {
          // Fallback: store the data URL directly
          coverImageUrl = dataUrl;
        }
      }
    } catch (e) {
      console.error("[blog] Image generation failed:", e);
    }

    // 3. Create unique slug
    let slug = slugify(article.title);
    if (!slug) slug = `artigo-${Date.now()}`;
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    // 4. Insert into DB
    const { data: inserted, error: insertError } = await supabase
      .from("blog_posts")
      .insert({
        slug,
        title: article.title.slice(0, 200),
        excerpt: article.excerpt.slice(0, 300),
        content_html: article.content_html,
        category,
        cover_image_url: coverImageUrl,
        meta_title: article.meta_title.slice(0, 70),
        meta_description: article.meta_description.slice(0, 160),
        reading_time_minutes: article.reading_time_minutes,
        is_published: true,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log(`[blog] Published: /${slug}`);

    return new Response(
      JSON.stringify({ success: true, post: inserted }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("[blog] Error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

// Blog module — redeploy trigger
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingBlob } from "@/components/FloatingBlob";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar, Clock, Eye, ArrowRight } from "lucide-react";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: "tech" | "curiosidades" | "comunicacao";
  cover_image_url: string | null;
  reading_time_minutes: number;
  views: number;
  published_at: string;
};

const CATEGORY_LABEL: Record<BlogPost["category"], string> = {
  tech: "Tech",
  curiosidades: "Curiosidades",
  comunicacao: "Comunicação",
};

const CATEGORY_COLOR: Record<BlogPost["category"], string> = {
  tech: "bg-blue-500/20 text-blue-300 border-blue-400/30",
  curiosidades: "bg-pink-500/20 text-pink-300 border-pink-400/30",
  comunicacao: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
};

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BlogPost["category"] | "all">("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const query = supabase
        .from("blog_posts")
        .select(
          "id, slug, title, excerpt, category, cover_image_url, reading_time_minutes, views, published_at",
        )
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(60);
      const { data } = await query;
      if (data) setPosts(data as BlogPost[]);
      setLoading(false);
    };
    load();
  }, []);

  const filtered =
    filter === "all" ? posts : posts.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen animated-gradient-bg">
      <Helmet>
        <title>Blog Labxat — Tech, Curiosidades & Comunicação</title>
        <meta
          name="description"
          content="Artigos diários sobre tecnologia, curiosidades e comunicação. Conteúdo fresco todos os dias no Blog Labxat."
        />
        <link rel="canonical" href="https://labxat.com/blog" />
        <meta property="og:title" content="Blog Labxat" />
        <meta
          property="og:description"
          content="Artigos diários sobre tech, curiosidades e comunicação."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <Header />

      <FloatingBlob color="blue" size="xl" position={{ top: "10%", left: "-10%" }} animation="float" />
      <FloatingBlob color="pink" size="lg" position={{ bottom: "15%", right: "-5%" }} animation="float-delayed" />

      <main className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gradient mb-4">
              Blog Labxat
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tech, curiosidades e comunicação — um artigo novo todos os dias.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8 fade-in-up-delayed">
            {(["all", "tech", "curiosidades", "comunicacao"] as const).map(
              (cat) => (
                <Button
                  key={cat}
                  variant={filter === cat ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(cat)}
                  className={filter === cat ? "gradient-btn text-white" : ""}
                >
                  {cat === "all"
                    ? "Todos"
                    : CATEGORY_LABEL[cat as BlogPost["category"]]}
                </Button>
              ),
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <GlassCard className="max-w-md mx-auto text-center py-12">
              <p className="text-muted-foreground">
                Nenhum artigo publicado ainda. Volte em breve!
              </p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post, i) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group scale-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <article className="glass-card overflow-hidden h-full flex flex-col hover:scale-[1.02] transition-all duration-300">
                    {post.cover_image_url && (
                      <div className="aspect-video overflow-hidden bg-muted/30">
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <Badge
                        className={`self-start mb-3 ${CATEGORY_COLOR[post.category]}`}
                        variant="outline"
                      >
                        {CATEGORY_LABEL[post.category]}
                      </Badge>
                      <h2 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-gradient transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground/80 pt-3 border-t border-white/10">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.published_at).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.reading_time_minutes} min
                        </span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;

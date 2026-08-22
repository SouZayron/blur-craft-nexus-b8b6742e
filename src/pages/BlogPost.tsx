import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingBlob } from "@/components/FloatingBlob";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar, Clock, Eye, ArrowLeft, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_html: string;
  category: "tech" | "curiosidades" | "comunicacao";
  cover_image_url: string | null;
  meta_title: string;
  meta_description: string;
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

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error || !data) {
        setNotFound(true);
      } else {
        setPost(data as BlogPost);
        // Increment views (fire and forget)
        supabase
          .from("blog_posts")
          .update({ views: (data.views || 0) + 1 })
          .eq("id", data.id)
          .then(() => {});
      }
      setLoading(false);
    };
    load();
    window.scrollTo({ top: 0 });
  }, [slug]);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: post?.title, url });
      } catch {}
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Link copiado!", description: "Cole onde quiser." });
    }
  };

  if (notFound) return <Navigate to="/blog" replace />;

  if (loading || !post) {
    return (
      <div className="min-h-screen zgames-page zgames-grid-line">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const canonical = `https://zgames.com/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description,
    image: post.cover_image_url ? [post.cover_image_url] : undefined,
    datePublished: post.published_at,
    dateModified: post.published_at,
    author: { "@type": "Organization", name: "ZGames" },
    publisher: {
      "@type": "Organization",
      name: "ZGames",
      logo: {
        "@type": "ImageObject",
        url: "https://zgames.com/zgames-logo-64.png",
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
  };

  return (
    <div className="min-h-screen zgames-page zgames-grid-line">
      <Helmet>
        <title>{post.meta_title}</title>
        <meta name="description" content={post.meta_description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={post.meta_title} />
        <meta property="og:description" content={post.meta_description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        {post.cover_image_url && (
          <meta property="og:image" content={post.cover_image_url} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.meta_title} />
        <meta name="twitter:description" content={post.meta_description} />
        {post.cover_image_url && (
          <meta name="twitter:image" content={post.cover_image_url} />
        )}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Header />

      <FloatingBlob color="purple" size="xl" position={{ top: "5%", right: "-15%" }} animation="float" />
      <FloatingBlob color="blue" size="lg" position={{ bottom: "20%", left: "-10%" }} animation="float-delayed" />

      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Blog
          </Link>

          <article className="glass-card p-6 md:p-10 fade-in-up">
            {post.cover_image_url && (
              <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-muted/30">
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  fetchPriority="high"
                />
              </div>
            )}

            <Badge
              className={`mb-4 ${CATEGORY_COLOR[post.category]}`}
              variant="outline"
            >
              {CATEGORY_LABEL[post.category]}
            </Badge>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gradient mb-4 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-white/10">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.published_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.reading_time_minutes} min de leitura
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {post.views} visualizações
              </span>
              <Button
                onClick={share}
                variant="ghost"
                size="sm"
                className="ml-auto"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Compartilhar
              </Button>
            </div>

            <div
              className="blog-content prose prose-invert prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content_html }}
            />
          </article>

          <div className="mt-8 text-center">
            <Link to="/blog">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ver mais artigos
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;

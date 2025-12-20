import { Link, useLocation } from "react-router-dom";
import { Palette, Sparkles, Dices } from "lucide-react";

export const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const tools = [
    { name: "Nicks", icon: Sparkles, path: "/nicks" },
    { name: "Cores", icon: Palette, path: "/cores" },
    { name: "Bingo", icon: Dices, path: "/bingo" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-6xl mx-auto">
        <div className="glass-card px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/labxat-icon.gif" alt="Labxat" className="w-8 h-8" />
            <span className="text-2xl font-black text-gradient">Labxat</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {tools.map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  location.pathname === tool.path
                    ? "bg-primary/20 text-primary"
                    : "hover:bg-white/20 text-foreground/70 hover:text-foreground"
                }`}
              >
                <tool.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tool.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};
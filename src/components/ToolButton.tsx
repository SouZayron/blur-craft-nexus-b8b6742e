import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ToolButtonProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
  gradient?: "blue" | "purple" | "pink" | "green";
}

// Stroke gradients (thin neon outlines) — kept per "color" name for back-compat.
const strokeGradients: Record<NonNullable<ToolButtonProps["gradient"]>, string> = {
  blue: "linear-gradient(135deg, hsl(185 100% 60%), hsl(152 100% 55%))",
  purple: "linear-gradient(135deg, hsl(152 100% 55%), hsl(165 90% 60%))",
  pink: "linear-gradient(135deg, hsl(165 90% 60%), hsl(185 100% 60%))",
  green: "linear-gradient(135deg, hsl(152 100% 55%), hsl(185 100% 60%))",
};

export const ToolButton = ({ label, icon: Icon, onClick, className, gradient = "blue" }: ToolButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center gap-3",
        "px-4 py-4 rounded-xl",
        "bg-card text-foreground font-semibold text-sm md:text-base",
        "transition-all duration-300 ease-out",
        "hover:scale-[1.03] hover:brightness-110",
        "whitespace-nowrap",
        className
      )}
      style={{
        // Flat background + thin gradient stroke via background-clip masking
        backgroundImage: `linear-gradient(hsl(var(--card)), hsl(var(--card))), ${strokeGradients[gradient]}`,
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        border: "1px solid transparent",
        boxShadow: "0 0 0 0 transparent",
      }}
    >
      <Icon className="w-5 h-5 flex-shrink-0 text-primary" />
      <span>{label}</span>
    </button>
  );
};

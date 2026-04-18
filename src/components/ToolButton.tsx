import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ToolButtonProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
  gradient?: "blue" | "purple" | "pink" | "green";
}

// All variants resolve to the pink → purple gradient family for visual cohesion.
const strokeGradients: Record<NonNullable<ToolButtonProps["gradient"]>, string> = {
  blue: "linear-gradient(135deg, hsl(326 100% 60%), hsl(262 100% 65%))",
  purple: "linear-gradient(135deg, hsl(290 100% 65%), hsl(262 100% 65%))",
  pink: "linear-gradient(135deg, hsl(326 100% 60%), hsl(290 100% 65%))",
  green: "linear-gradient(135deg, hsl(326 100% 60%), hsl(262 100% 65%))",
};

export const ToolButton = ({ label, icon: Icon, onClick, className, gradient = "purple" }: ToolButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center gap-3",
        "px-4 py-4 rounded-2xl",
        "text-foreground font-semibold text-sm md:text-base",
        "transition-all duration-300 ease-out",
        "hover:scale-[1.03] hover:brightness-110 hover:shadow-glow",
        "whitespace-nowrap backdrop-blur-xl",
        className
      )}
      style={{
        backgroundImage: `linear-gradient(hsl(260 40% 10% / 0.7), hsl(260 40% 10% / 0.7)), ${strokeGradients[gradient]}`,
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        border: "1px solid transparent",
        boxShadow: "0 4px 24px hsl(326 100% 60% / 0.18)",
      }}
    >
      <Icon className="w-5 h-5 flex-shrink-0 text-secondary" />
      <span>{label}</span>
    </button>
  );
};

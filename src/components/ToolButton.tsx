import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ToolButtonProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
  gradient?: "blue" | "purple" | "pink" | "green";
}

const gradientStyles = {
  blue: "bg-gradient-to-r from-labxat-blue to-labxat-purple",
  purple: "bg-gradient-to-r from-labxat-purple to-labxat-pink",
  pink: "bg-gradient-to-r from-labxat-pink to-labxat-green",
  green: "bg-gradient-to-r from-labxat-green to-labxat-blue",
};

export const ToolButton = ({ label, icon: Icon, onClick, className, gradient = "blue" }: ToolButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-3",
        "px-4 py-4",
        "rounded-xl",
        gradientStyles[gradient],
        "text-primary-foreground font-semibold text-sm md:text-base",
        "transition-all duration-300 ease-out",
        "hover:scale-105 hover:brightness-110",
        "border border-white/20",
        "shadow-lg hover:shadow-xl",
        "whitespace-nowrap",
        className
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{label}</span>
    </button>
  );
};

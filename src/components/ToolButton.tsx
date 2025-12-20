import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ToolButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  gradient?: "blue" | "purple" | "pink";
}

const gradientStyles = {
  blue: "bg-gradient-to-r from-labxat-blue to-labxat-purple",
  purple: "bg-gradient-to-r from-labxat-purple to-labxat-pink",
  pink: "bg-gradient-to-r from-labxat-pink to-labxat-green",
};

export const ToolButton = ({ children, onClick, className, gradient = "blue" }: ToolButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group overflow-hidden",
        "px-6 py-3",
        "rounded-xl",
        gradientStyles[gradient],
        "text-primary-foreground font-semibold text-sm md:text-base",
        "transform transition-all duration-300 ease-out",
        "hover:scale-105 hover:brightness-110",
        "border border-white/20",
        "shadow-lg hover:shadow-xl",
        className
      )}
    >
      <span className="relative z-10 tracking-wide">{children}</span>
    </button>
  );
};

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ToolButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export const ToolButton = ({ children, onClick, className }: ToolButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group overflow-hidden",
        "px-8 py-5 md:px-10 md:py-6",
        "rounded-2xl md:rounded-3xl",
        "gradient-btn shimmer",
        "text-primary-foreground font-semibold text-base md:text-lg",
        "transform transition-all duration-500 ease-out",
        "hover:scale-105 hover:brightness-110",
        "glow-hover",
        "border border-white/20",
        "shadow-lg hover:shadow-2xl",
        className
      )}
    >
      {/* Blur overlay effect */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <span className="relative z-10 tracking-wide">{children}</span>
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-white/0 via-white/20 to-white/0" />
    </button>
  );
};

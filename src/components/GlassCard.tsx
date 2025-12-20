import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard = ({ children, className, onClick }: GlassCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card p-8 md:p-12",
        "transform transition-all duration-500",
        "hover:scale-[1.02] hover:shadow-glow-lg",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
};

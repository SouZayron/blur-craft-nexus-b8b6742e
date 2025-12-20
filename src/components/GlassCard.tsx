import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export const GlassCard = ({ children, className }: GlassCardProps) => {
  return (
    <div
      className={cn(
        "glass-card p-8 md:p-12",
        "transform transition-all duration-500",
        "hover:scale-[1.02] hover:shadow-glow-lg",
        className
      )}
    >
      {children}
    </div>
  );
};

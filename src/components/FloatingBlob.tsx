import { cn } from "@/lib/utils";
import { memo } from "react";

interface FloatingBlobProps {
  color: "blue" | "purple" | "pink" | "green" | "lilac";
  size: "sm" | "md" | "lg" | "xl";
  position: { top?: string; left?: string; right?: string; bottom?: string };
  animation?: "float" | "float-delayed" | "float-slow";
  className?: string;
}

const colorClasses = {
  blue: "bg-labxat-blue",
  purple: "bg-labxat-purple",
  pink: "bg-labxat-pink",
  green: "bg-labxat-green",
  lilac: "bg-labxat-lilac",
};

const sizeClasses = {
  sm: "w-32 h-32",
  md: "w-48 h-48",
  lg: "w-64 h-64",
  xl: "w-96 h-96",
};

// Memoized for performance - blobs don't change after initial render
export const FloatingBlob = memo(({
  color,
  size,
  position,
  animation = "float",
  className,
}: FloatingBlobProps) => {
  return (
    <div
      className={cn(
        "blob pulse-glow",
        colorClasses[color],
        sizeClasses[size],
        animation,
        className
      )}
      style={{
        ...position,
        opacity: 0.35,
        // GPU layer promotion
        transform: 'translateZ(0)',
      }}
      aria-hidden="true"
    />
  );
});

FloatingBlob.displayName = "FloatingBlob";

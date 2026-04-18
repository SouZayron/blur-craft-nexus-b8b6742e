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

// Disabled per design request — no decorative floating blobs in the background.
// Kept as a no-op component so existing imports/usages keep working.
export const FloatingBlob = memo((_props: FloatingBlobProps) => null);

FloatingBlob.displayName = "FloatingBlob";

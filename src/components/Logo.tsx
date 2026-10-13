import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="grid place-items-center w-8 h-8 rounded-full bg-brand text-white">
        <Leaf className="w-4 h-4" />
      </span>
      <span className="font-display text-xl font-semibold uppercase tracking-[0.12em] text-ink">
        Clean<span className="text-brand">X</span>
      </span>
    </span>
  );
}

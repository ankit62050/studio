import { Leaf } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-xl font-bold font-headline text-primary ${className}`}>
      <Leaf className="h-6 w-6 text-accent" />
      <span>
        JANConnect <span className="font-light text-foreground/80">Lite</span>
      </span>
    </div>
  );
}

import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn(
        "flex items-center gap-2 text-xl font-bold font-headline text-primary",
        className
      )}>
      <svg
        className="h-7 w-7 text-info"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
          fillOpacity="0.3"
        />
        <path d="M12 4v1.5a6.5 6.5 0 010 13V20a8 8 0 000-16zM4 12h1.5a6.5 6.5 0 0113 0H20a8 8 0 00-16 0z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
      <span>
        JanConnect
      </span>
    </div>
  );
}

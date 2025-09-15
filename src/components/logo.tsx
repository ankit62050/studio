import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn(
        "flex items-center gap-2 text-xl font-bold font-headline",
        className
      )}>
      <Image
        src="https://storage.googleapis.com/studiostoragetesting/project-logos/JanConnect/JanConnect-logo-1x.png"
        alt="JanConnect Logo"
        width={140}
        height={40}
        className="object-contain"
        priority
      />
    </div>
  );
}

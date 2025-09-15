import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn(
        "flex items-center",
        className
      )}>
      <Image
        src="https://storage.googleapis.com/maker-studio-support-images-prod/user-prompt-images/21535971-e946-4e4f-b3b4-106c64639434.gif"
        alt="JanConnect Logo"
        width={140}
        height={40}
        className="object-contain"
        priority
        unoptimized
      />
    </div>
  );
}

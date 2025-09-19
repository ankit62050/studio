"use client"
import { Hero } from "@/components/ui/hero"

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#f3f1ea] px-4 sm:px-10">
      <Hero
        eyebrow="INTRODUCING JANCONNECT LITE"
        title={
          <>
            <div className="whitespace-nowrap">
              <span className="font-instrument-serif font-normal">Your voice, </span>
              <span className="font-instrument-serif font-normal italic">seamlessly </span>
              <span className="font-instrument-serif font-normal">connected</span>
            </div>
            <div className="font-instrument-serif font-normal">
              to your government
            </div>
          </>
        }
        subtitle="JANConnect Lite brings your issues, and your community together"
        ctaText="Get Started"
        ctaLink="/submit"
        mockupImage={{
          src: "https://picsum.photos/seed/calendar-view/1274/1043",
          alt: "JANConnect App Interface",
          width: 1274,
          height: 1043
        }}
      />
    </main>
  )
}

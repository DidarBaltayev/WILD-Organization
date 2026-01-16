import BackgroundNeural from "./BackgroundNeural";
import Header from "./Header";
import Hero from "./About";
import Mission from "./Mission";
import Platform from "./WhatIsPlatform";
import ScaleSection from "./Scale";
import RankShowcase from "./RankShowcase";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen text-white">
      {/* ONE GLOBAL BACKGROUND FOR WHOLE PAGE */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <BackgroundNeural />
      </div>

      <Header />

      <div className="relative z-10">
        {/* 1) ABOUT */}
        <section id="about" className="scroll-mt-[110px]">
          <Hero />
        </section>

        {/* 2) MISSION */}
        <section id="mission" className="section scroll-mt-[110px]">
          <Mission />
        </section>

        {/* 3) PLATFORM */}
        <section id="platform" className="section scroll-mt-[110px]">
          <Platform />
        </section>

        {/* 4) ROSTERS */}
        <section id="rosters" className="section scroll-mt-[110px]">
          <RankShowcase />
        </section>

        {/* 5) SCALE */}
        <section id="scale" className="section scroll-mt-[110px]">
          <ScaleSection />
        </section>
      </div>
    </main>
  );
}

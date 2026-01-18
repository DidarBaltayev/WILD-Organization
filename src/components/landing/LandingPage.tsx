import BackgroundNeural from "./BackgroundNeural";
import FloatingNav from "./FloatingNav";
import Hero from "./About";
import Mission from "./Mission";
import Platform from "./WhatIsPlatform";
import RankShowcase from "./RankShowcase";
import ScaleSection from "./Scale";
import Partnership from "./Partnership";
import Contacts from "./Contacts";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen text-white overflow-x-hidden">
      {/* ONE GLOBAL BACKGROUND FOR WHOLE PAGE */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <BackgroundNeural />
      </div>

      <FloatingNav />

      <div className="relative z-10">
        {/* 1) ABOUT */}
        <section id="about" className="scroll-mt-[110px]">
          <div className="containerWide">
            <Hero />
          </div>
        </section>

        {/* 2) MISSION */}
        <section id="mission" className="section scroll-mt-[110px]">
          <div className="containerWide">
            <Mission />
          </div>
        </section>

        {/* 3) PLATFORM */}
        <section id="platform" className="section scroll-mt-[110px]">
          <div className="containerWide">
            <Platform />
          </div>
        </section>

        {/* 4) ROSTERS */}
        <section id="rosters" className="section scroll-mt-[110px]">
          <div className="containerXL">
            <RankShowcase />
          </div>
        </section>

        {/* 5) SCALE */}
        <section id="scale" className="section scroll-mt-[110px]">
          <div className="containerWide">
            <ScaleSection />
          </div>
        </section>

        {/* 6) PARTNERSHIP — FINAL CTA */}
        <section id="partnership" className="section scroll-mt-[110px]">
          <div className="containerWide">
            <Partnership />
          </div>
        </section>

        {/* 7) CONTACTS — FOOTER */}
        <section id="contacts" className="section scroll-mt-[110px]">
          <div className="containerWide">
            <Contacts />
          </div>

          {/* FACEIT-STYLE LEGAL LINE */}
          <div className="containerWide">
            <Footer startYear={2025} company="Rexior LLC" />
          </div>
        </section>
      </div>
    </main>
  );
}

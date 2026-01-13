import BackgroundNeural from "./BackgroundNeural";
import Header from "./Header";
import Hero from "./About";
import Mission from "./Mission";
import RankShowcase from "./RankShowcase";
import ScaleSection from "./Scale";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen text-white">
      {/* ONE GLOBAL BACKGROUND FOR WHOLE PAGE */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <BackgroundNeural />
      </div>

      <Header />

      <div className="relative z-10">
        <section id="home">
          <Hero />
        </section>

        <section id="mission" className="section">
          <Mission />
        </section>

        {/* ✅ НОВЫЙ БЛОК МАСШТАБ */}
        <section id="scale" className="section">
          <ScaleSection />
        </section>

        <section id="rank" className="section">
          <RankShowcase />
        </section>
      </div>
    </main>
  );
}

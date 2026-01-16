import BackgroundNeural from "./BackgroundNeural";
import Header from "./Header";
import Hero from "./Hero";
import Mission from "./Mission";
import RankShowcase from "./RankShowcase";

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white relative">
      <BackgroundNeural />
      <Header />

      <main className="relative z-10">
        <section id="home">
          <Hero />
        </section>

        <section id="mission" className="section">
          <Mission />
        </section>

        <section id="rank" className="section">
          <RankShowcase />
        </section>
      </main>
    </div>
  );
}

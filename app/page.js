import HeroSlider from "./components/HeroSlider";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "Hummus in 1 Minute selber machen | Hummus Hero | The Hero Levant Line",
  description: "Entdecken Sie Hummus Hero, Baba Hero und Foul Hero. Frischer, cremiger Hummus in nur 1 Minute. 100% Clean Label, ohne Zusatzstoffe. Zeit ist Hayat.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-black relative">
      <Navbar />
      <h1 className="sr-only">The Hero Levant Line - Premium Hummus Basis für Gastronomie und Zuhause</h1>
      <section>
        <h2 className="sr-only">Unsere Premium Produkte: Hummus Hero, Baba Hero & Foul Hero</h2>
        <HeroSlider />
      </section>
    </main>
  );
}

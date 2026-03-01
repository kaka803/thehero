import HeroSlider from "./components/HeroSlider";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-black relative">
      <Navbar />
      <HeroSlider />
    </main>
  );
}

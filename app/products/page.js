import Navbar from "../components/Navbar";
import Products from "../components/Products";
import Footer from "../components/Footer";

export default function ProductsPage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <Navbar />
      <div className="pt-24"> {/* Offset for fixed navbar */}
        <Products />
      </div>
      <Footer />
    </main>
  );
}

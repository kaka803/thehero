import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductDetail from "../../components/ProductDetail";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function Page({ params }) {
  const { id } = await params;
  
  await dbConnect();
  const productObj = await Product.findById(id).lean();

  if (!productObj) {
    notFound();
  }

  // Convert MongoDB object to plain JS object for client components
  const product = JSON.parse(JSON.stringify(productObj));

  return (
    <main className="min-h-screen relative overflow-hidden">
      <Navbar />
      <div className="pt-24 pb-12">
        <ProductDetail product={product} />
      </div>
      <Footer />
    </main>
  );
}

export async function generateStaticParams() {
  await dbConnect();
  const products = await Product.find({}, { _id: 1 }).lean();
  return products.map((p) => ({
    id: p._id.toString(),
  }));
}

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "The Hero Levant Line | Hummus in 1 Minute selber machen",
  description: "Entdecken Sie Hummus Hero, Baba Hero und Foul Hero. Frischer, cremiger Hummus in nur 1 Minute. 100% Clean Label, ohne Zusatzstoffe. Zeit ist Hayat.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

import { ProductProvider } from "@/context/ProductContext";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import CartDrawer from "@/app/components/CartDrawer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <ProductProvider>
            <CartProvider>
              <CartDrawer />
              {children}
            </CartProvider>
          </ProductProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

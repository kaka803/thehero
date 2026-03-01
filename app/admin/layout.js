"use client";

import Link from "next/link";
import { LayoutDashboard, Package, Settings, LogOut, Menu, X, Bell, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

import { useLanguage } from "@/context/LanguageContext";

export default function AdminLayout({ children }) {
  const { lang, switchLanguage, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    const checkAuth = async () => {
      // Skip check for login page itself
      if (isLoginPage) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/admin/auth");
        const data = await res.json();
        if (!data.authenticated) {
          router.push("/admin/login");
        } else {
          // If we are on the root admin page, redirect to products
          if (pathname === "/admin") {
            router.push("/admin/products");
          }
          setLoading(false);
        }
      } catch (error) {
        router.push("/admin/login");
      }
    };

    checkAuth();
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const menuItems = [
    { icon: Package, label: t("admin.sidebar.products"), href: "/admin/products" },
    { icon: ShoppingBag, label: t("admin.sidebar.orders"), href: "/admin/orders" },
    { icon: Settings, label: t("admin.sidebar.settings"), href: "/admin/settings" },
  ];

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-black text-white">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0e0a] text-white flex font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/5 backdrop-blur-3xl border-r border-white/10 transition-transform duration-300 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={100} height={30} className="h-8 w-auto object-contain brightness-110" />
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-all group"
              >
                <item.icon size={20} className="group-hover:text-[#d3b673] transition-colors" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all mt-auto"
          >
            <LogOut size={20} />
            <span className="font-medium">{t("admin.sidebar.logout")}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 lg:px-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/60 hover:text-white">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold tracking-tight">{t("admin.header.dashboard")}</h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Language Switcher */}
            <div className="flex bg-white/5 border border-white/10 rounded-full p-1">
               <button 
                onClick={() => switchLanguage('en')}
                className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest transition-all ${lang === 'en' ? 'bg-[#d3b673] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
               >
                EN
               </button>
               <button 
                onClick={() => switchLanguage('de')}
                className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest transition-all ${lang === 'de' ? 'bg-[#d3b673] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
               >
                DE
               </button>
            </div>
            <button className="relative text-white/60 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#d3b673] rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">Admin User</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{t("admin.header.profile")}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d3b673] to-[#83732c] border border-white/20"></div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-[#d3b673]/20 border-t-[#d3b673] rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Authenticating...</p>
            </div>
          ) : children}
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(211, 182, 115, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(211, 182, 115, 0.5);
        }
      `}</style>
    </div>
  );
}

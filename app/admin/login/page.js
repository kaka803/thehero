"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import gsap from "gsap";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const formRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    // Initial animation
    gsap.fromTo(formRef.current, 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power4.out", delay: 0.5 }
    );

    // Background movement
    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 20;
        const yPos = (clientY / window.innerHeight - 0.5) * 20;
        
        gsap.to(bgRef.current, {
            x: xPos,
            y: yPos,
            duration: 2,
            ease: "power2.out"
        });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        gsap.to(formRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.5,
          ease: "power4.in",
          onComplete: () => router.push("/admin")
        });
      } else {
        setError(data.message || "Invalid credentials");
        setLoading(false);
        // Error shake
        gsap.to(formRef.current, {
            x: 10,
            duration: 0.1,
            repeat: 5,
            yoyo: true,
            ease: "none"
        });
      }
    } catch (err) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative bg-black overflow-hidden flex items-center justify-center p-4">
      {/* Dynamic Background */}
      <div 
        ref={bgRef}
        className="absolute inset-x-[-10%] inset-y-[-10%] opacity-40 blur-[120px] pointer-events-none"
      >
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#d3b673]/20 rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#83732c]/10 rounded-full"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-20 pointer-events-none"></div>

      <div 
        ref={formRef}
        className="relative w-full max-w-[450px] z-10"
      >
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-3xl p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 rounded-3xl bg-[#d3b673]/10 border border-[#d3b673]/20 flex items-center justify-center text-[#d3b673] mb-6 shadow-[0_0_30px_rgba(211,182,115,0.1)]">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter text-center">
              The Hero Admin
            </h1>
            <p className="text-white/40 text-sm font-medium mt-2">Secure access restricted to authorized personnel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center text-white/20 group-focus-within:text-[#d3b673] transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-[#d3b673] focus:bg-white/[0.08] transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center text-white/20 group-focus-within:text-[#d3b673] transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-[#d3b673] focus:bg-white/[0.08] transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-rose-500 text-xs font-bold uppercase tracking-widest text-center animate-pulse">
                {error}
              </p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#d3b673] hover:bg-[#c4a55d] text-black font-black py-5 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(211,182,115,0.2)] mt-8"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  SIGN IN TO DASHBOARD
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-10 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
          &copy; 2024 THE HERO COLLECTION &bull; SECURED
        </p>
      </div>
    </main>
  );
}

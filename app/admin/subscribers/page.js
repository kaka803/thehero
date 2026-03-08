"use client";
import { useState, useEffect } from "react";
import { Mail, Search, AlertCircle, RefreshCw, Calendar, CheckCircle, XCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function SubscribersPage() {
  const { t } = useLanguage();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/subscribers", {
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      const data = await res.json();
      setSubscribers(data.subscribers || []);
    } catch (err) {
      console.error("Error fetching subscribers:", err);
      setError(t("admin.subscribers.error_load") || "Failed to load subscribers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 flex items-center gap-3">
            <Mail className="text-[#d3b673]" size={32} />
            {t("admin.subscribers.title") || "Newsletter Subscribers"}
          </h1>
          <p className="text-white/60 text-sm">
            {t("admin.subscribers.subtitle") || "Manage your newsletter audience"} ({subscribers.length})
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder={t("admin.subscribers.search") || "Search emails..."}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-[#d3b673]/50 transition-all font-medium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          </div>
          
          <button
            onClick={fetchSubscribers}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#d3b673]/30 text-white transition-all active:scale-95"
            title={t("admin.subscribers.refresh") || "Refresh List"}
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-[#d3b673]" : "text-white/70"} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <RefreshCw className="animate-spin text-[#d3b673]" size={32} />
            <p className="text-white/60 font-medium text-sm animate-pulse">{t("admin.subscribers.loading") || "Loading audience..."}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center px-4">
            <AlertCircle className="text-red-400" size={48} />
            <div className="space-y-1">
              <p className="text-red-400 font-bold">{error}</p>
              <button 
                onClick={fetchSubscribers} 
                className="text-white/60 hover:text-white text-sm underline"
              >
                {t("admin.subscribers.try_again") || "Try again"}
              </button>
            </div>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
              <Mail className="text-white/20" size={32} />
            </div>
            {searchTerm ? (
               <>
                  <h3 className="text-xl font-bold text-white mb-2">{t("admin.subscribers.no_results") || "No results found"}</h3>
                  <p className="text-white/50 max-w-md mx-auto">
                     {t("admin.subscribers.no_results_desc") || `No subscribers matching "${searchTerm}"`}
                  </p>
               </>
            ) : (
               <>
                  <h3 className="text-xl font-bold text-white mb-2">{t("admin.subscribers.empty") || "No subscribers yet"}</h3>
                  <p className="text-white/50 max-w-md mx-auto">
                     {t("admin.subscribers.empty_desc") || "When customers sign up for the newsletter in the footer, they will appear here."}
                  </p>
               </>
            )}
            
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="py-4 px-6 text-xs font-black tracking-widest text-[#d3b673] uppercase">{t("admin.subscribers.table.email") || "Email"}</th>
                  <th className="py-4 px-6 text-xs font-black tracking-widest text-[#d3b673] uppercase">{t("admin.subscribers.table.date") || "Date Subscribed"}</th>
                  <th className="py-4 px-6 text-xs font-black tracking-widest text-[#d3b673] uppercase">{t("admin.subscribers.table.status") || "Status"}</th>
                </tr>
              </thead>
              <tbody className="text-white/80 text-sm">
                  {filteredSubscribers.map((sub) => (
                    <tr 
                      key={sub._id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-[#d3b673] border border-white/10">
                              {sub.email.charAt(0).toUpperCase()}
                           </div>
                           <span className="font-semibold tracking-wide">{sub.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-white/50">
                        <div className="flex items-center gap-2">
                           <Calendar size={14} className="opacity-50" />
                           {new Date(sub.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {sub.status === 'subscribed' ? (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                              <CheckCircle size={12} /> {t("admin.subscribers.status.active") || "Active"}
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
                              <XCircle size={12} /> {t("admin.subscribers.status.unsubscribed") || "Unsubscribed"}
                           </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

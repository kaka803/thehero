"use client";
import { useState, useEffect } from "react";
import { Users, Search, ShoppingBag, DollarSign, Calendar, MapPin, Phone, Mail } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/admin/customers");
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${customer.firstName} ${customer.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase">Customers</h1>
          <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-medium">Manage and view customer information</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                    type="text" 
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 focus:outline-none focus:border-[#d3b673] transition-all w-64 text-sm text-white"
                />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl group hover:border-[#d3b673]/30 transition-all">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-[#d3b673]/10 rounded-2xl text-[#d3b673] group-hover:scale-110 transition-transform">
              <Users size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Total Customers</p>
              <p className="text-3xl font-black text-white">{customers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl group hover:border-[#d3b673]/30 transition-all">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-[#d3b673]/10 rounded-2xl text-[#d3b673] group-hover:scale-110 transition-transform">
              <ShoppingBag size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Total Orders</p>
              <p className="text-3xl font-black text-white">
                {customers.reduce((acc, curr) => acc + (curr.totalOrders || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl group hover:border-[#d3b673]/30 transition-all">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-[#d3b673]/10 rounded-2xl text-[#d3b673] group-hover:scale-110 transition-transform">
              <DollarSign size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Total Revenue</p>
              <p className="text-3xl font-black text-[#d3b673]">
                ${customers.reduce((acc, curr) => acc + (curr.totalSpent || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-3xl shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40">Customer</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40">Contact Info</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40 text-center">Orders</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40 text-right">Spent</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40 text-center">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5 animate-pulse">
                    <td className="px-6 py-5"><div className="h-4 bg-white/10 rounded w-32"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-white/10 rounded w-40"></div></td>
                    <td className="px-6 py-5 text-center"><div className="h-4 bg-white/10 rounded w-12 mx-auto"></div></td>
                    <td className="px-6 py-5 text-right"><div className="h-4 bg-white/10 rounded w-16 ml-auto"></div></td>
                    <td className="px-6 py-5 text-center"><div className="h-4 bg-white/10 rounded w-20 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-white/20 font-medium uppercase tracking-widest text-sm italic">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white uppercase tracking-tight">{customer.firstName} {customer.lastName}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin size={10} className="text-[#d3b673]" />
                          <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">{customer.city}, {customer.country}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-white/60">
                          <Mail size={12} className="text-[#d3b673]/50" />
                          <span className="text-xs font-medium">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/60">
                          <Phone size={12} className="text-[#d3b673]/50" />
                          <span className="text-xs font-medium">{customer.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-black text-white">{customer.totalOrders}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-black text-[#d3b673]">${customer.totalSpent?.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <Calendar size={14} className="text-white/20 mb-1" />
                        <span className="text-[10px] font-bold text-white/40 uppercase">{new Date(customer.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(211, 182, 115, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

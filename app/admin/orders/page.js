"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Search, Filter, Eye, X, Calendar, Mail, User, MapPin, Phone, CreditCard, Package } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminOrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState({
    status: "",
    trackingNumber: "",
    carrier: "DHL"
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (order) => {
    setSelectedOrder(order);
    setTrackingInfo({
      status: order.status,
      trackingNumber: order.trackingNumber || "",
      carrier: order.carrier || "DHL"
    });
    setIsModalOpen(true);
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder) return;
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trackingInfo),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => o._id === selectedOrder._id ? data.order : o));
        setSelectedOrder(data.order);
        alert("Status updated successfully!");
      }
    } catch (error) {
      console.error("Update Error:", error);
      alert("Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{t("admin.orders.title")}</h1>
          <p className="text-white/40 text-sm mt-1">{t("admin.orders.subtitle")}</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                    type="text" 
                    placeholder={t("admin.orders.search_placeholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 focus:outline-none focus:border-[#d3b673] transition-all w-64 text-sm text-white"
                />
            </div>
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/60">
                <Filter size={18} />
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#d3b673]/20 border-t-[#d3b673] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-3xl shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40">{t("admin.orders.id")}</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40">{t("admin.orders.customer")}</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40">{t("admin.orders.date")}</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40">{t("admin.orders.total")}</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40">{t("admin.orders.status")}</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40 text-center">{t("admin.orders.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-[#d3b673] uppercase tracking-tighter">{order.invoiceNumber || `#${order._id.slice(-6).toUpperCase()}`}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white uppercase tracking-tight">{order.customerInfo?.firstName} {order.customerInfo?.lastName}</span>
                        <span className="text-xs text-white/40 font-medium">{order.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                        <span className="text-xs text-white/60 font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-5">
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-[#d3b673]">${order.total.toFixed(2)}</span>
                            {order.discountAmount > 0 && (
                                <span className="text-[10px] text-[#34d399] font-bold uppercase tracking-widest">{t("admin.orders.details.discount")}</span>
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'delivered' ? 'bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20' :
                        order.status === 'pending' ? 'bg-[#d3b673]/10 text-[#d3b673] border border-[#d3b673]/20' :
                        'bg-white/5 text-white/40 border border-white/10'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                        <button 
                            onClick={() => openModal(order)}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#d3b673] hover:bg-[#d3b673] hover:text-black transition-all shadow-lg active:scale-95"
                            title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-white/20 font-medium uppercase tracking-widest text-sm italic">
                        {t("admin.orders.no_orders")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0f0e0a] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
             {/* Modal Header */}
             <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-[#d3b673]/10 flex items-center justify-center text-[#d3b673]">
                      <ShoppingBag size={24} />
                   </div>
                    <div>
                       <h2 className="text-xl font-bold uppercase tracking-tight text-white">{t("admin.orders.details.title")}</h2>
                       <p className="text-xs text-[#d3b673] font-black tracking-widest uppercase">{selectedOrder.invoiceNumber || `#${selectedOrder._id.toUpperCase()}`}</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                   <X size={20} />
                </button>
             </div>

             {/* Modal Content */}
             <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   {/* Left Column: Customer & Shipping */}
                   <div className="space-y-8">
                      <div className="space-y-4">
                         <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#d3b673] flex items-center gap-2">
                            <User size={14} /> {t("admin.orders.details.customer_info")}
                         </h3>
                         <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                            <div className="flex justify-between items-center">
                               <p className="text-white/40 text-sm">{t("admin.orders.details.full_name")}</p>
                               <p className="font-bold uppercase tracking-tight text-white">{selectedOrder.customerInfo?.firstName} {selectedOrder.customerInfo?.lastName}</p>
                            </div>
                            <div className="flex justify-between items-center">
                               <p className="text-white/40 text-sm">{t("admin.orders.details.email")}</p>
                               <p className="font-bold text-white/80">{selectedOrder.email}</p>
                            </div>
                            <div className="flex justify-between items-center">
                               <p className="text-white/40 text-sm">{t("admin.orders.details.phone")}</p>
                               <p className="font-bold text-white/80">{selectedOrder.customerInfo?.phone || "N/A"}</p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#d3b673] flex items-center gap-2">
                            <MapPin size={14} /> {t("admin.orders.details.shipping_address")}
                         </h3>
                         <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
                            <p className="text-white/80 font-medium leading-relaxed">
                               {selectedOrder.customerInfo?.address}
                               {selectedOrder.customerInfo?.apartment && <><br />{selectedOrder.customerInfo.apartment}</>}
                               <br />
                               {selectedOrder.customerInfo?.city}, {selectedOrder.customerInfo?.state} {selectedOrder.customerInfo?.zipCode}
                               <br />
                               {selectedOrder.customerInfo?.country}
                            </p>
                         </div>
                      </div>
                   </div>

                   {/* Right Column: Order Items */}
                   <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#d3b673] flex items-center gap-2">
                         <Package size={14} /> {t("admin.orders.details.order_summary")}
                      </h3>
                      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                         <div className="p-1 space-y-1">
                            {selectedOrder.items?.map((item, idx) => (
                               <div key={idx} className="flex gap-4 p-3 hover:bg-white/5 transition-all rounded-2xl border border-transparent hover:border-white/5">
                                  <div className="w-16 h-20 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center p-2 shrink-0">
                                     <Image src={item.image} alt={item.name} width={50} height={50} className="object-contain" />
                                  </div>
                                  <div className="flex-1 flex flex-col justify-center gap-1">
                                     <h4 className="font-bold text-white leading-tight uppercase tracking-tight text-sm">{item.name}</h4>
                                     <p className="text-[10px] text-[#d3b673] font-black uppercase tracking-widest">{item.variant === 'tray' ? t("cart.case") : t("cart.single")}</p>
                                     <div className="flex justify-between items-center mt-1">
                                        <p className="text-white/40 text-xs text-white/60">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                        <p className="font-black text-white text-sm">${(item.quantity * item.price).toFixed(2)}</p>
                                     </div>
                                     {item.taxAmount > 0 && (
                                        <div className="flex justify-between items-center">
                                           <p className="text-[10px] text-[#d3b673] font-bold uppercase tracking-widest">Tax</p>
                                           <p className="font-black text-[#d3b673] text-xs">${item.taxAmount.toFixed(2)}</p>
                                        </div>
                                     )}
                                  </div>
                               </div>
                            ))}
                         </div>
                         
                         {/* Totals Section */}
                         <div className="p-6 bg-white/5 border-t border-white/10 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                            <span className="text-white/40 uppercase font-black tracking-widest text-[10px]">{t("admin.orders.details.subtotal")}</span>
                            <span className="font-bold text-white">${selectedOrder.subtotal.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-white/40 uppercase font-black tracking-widest text-[10px]">{t("checkout.taxes")}</span>
                            <span className="font-bold text-white">
                              ${selectedOrder.items.reduce((acc, item) => acc + (item.taxAmount || 0), 0).toFixed(2)}
                            </span>
                         </div>
                         {selectedOrder.discountAmount > 0 && (
                            <div className="flex justify-between items-center text-sm text-[#34d399]">
                               <span className="uppercase font-black tracking-widest text-[10px]">{t("admin.orders.details.discount")}</span>
                               <span className="font-bold">-${selectedOrder.discountAmount.toFixed(2)}</span>
                            </div>
                         )}
                            <div className="flex justify-between text-xs font-bold">
                               <span className="text-white/40 uppercase tracking-widest">{t("admin.orders.details.shipping")}</span>
                               <span className={`tracking-widest uppercase ${selectedOrder.shippingFee === 0 ? 'text-[#34d399]' : 'text-white'}`}>
                                 {selectedOrder.shippingFee === 0 ? t("checkout.free") : `$${selectedOrder.shippingFee.toFixed(2)}`}
                               </span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-white/10">
                               <span className="text-sm font-black uppercase tracking-[0.2em] text-[#d3b673]">{t("admin.orders.details.total_amount")}</span>
                               <span className="text-2xl font-black text-[#d3b673]">${selectedOrder.total?.toFixed(2)}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Modal Footer */}
              <div className="p-8 border-t border-white/10 bg-white/5 space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
                   <div className="flex-1 w-full space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#d3b673]">{t("admin.orders.details.manage_status")}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] text-white/40 uppercase font-black">{t("admin.orders.status")}</label>
                            <select 
                              value={trackingInfo.status}
                              onChange={(e) => setTrackingInfo({...trackingInfo, status: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#d3b673]"
                            >
                               <option value="pending" className="bg-[#0f0e0a]">Pending</option>
                               <option value="processing" className="bg-[#0f0e0a]">Processing</option>
                               <option value="shipped" className="bg-[#0f0e0a]">Shipped</option>
                               <option value="delivered" className="bg-[#0f0e0a]">Delivered</option>
                               <option value="cancelled" className="bg-[#0f0e0a]">Cancelled</option>
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] text-white/40 uppercase font-black">Tracking Number</label>
                            <input 
                              type="text"
                              value={trackingInfo.trackingNumber}
                              onChange={(e) => setTrackingInfo({...trackingInfo, trackingNumber: e.target.value})}
                              placeholder="e.g. DHL123456"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#d3b673]"
                            />
                         </div>
                         <div className="flex items-end">
                            <button 
                              onClick={updateOrderStatus}
                              disabled={statusLoading}
                              className="w-full bg-[#d3b673] text-black font-black uppercase tracking-widest text-xs py-2.5 rounded-xl hover:bg-[#bfa35d] transition-all disabled:opacity-50"
                            >
                               {statusLoading ? "Updating..." : "Update Status"}
                            </button>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-6 border-t border-white/5">
                   <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t("admin.orders.details.invoice")}</p>
                         <span className="text-sm font-black text-[#d3b673] mt-1">{selectedOrder.invoiceNumber || "N/A"}</span>
                      </div>
                      <div className="w-px h-8 bg-white/10 hidden md:block"></div>
                      <div className="flex flex-col">
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t("admin.orders.details.order_date")}</p>
                         <p className="text-sm font-bold mt-1 text-white">{new Date(selectedOrder.createdAt).toLocaleDateString()} {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                   </div>

                   <div className="text-[#d3b673] text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                      {t("admin.orders.details.verified")}
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

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

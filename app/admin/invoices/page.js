"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FileText, Download, Search, Eye, Calendar, User, DollarSign, X, Printer, Package, MapPin, Phone, Mail } from "lucide-react";
import Image from "next/image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function InvoicesPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const invoiceRef = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.customerInfo?.firstName} ${order.customerInfo?.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const openPreview = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const downloadPDF = async () => {
    if (!invoiceRef.current || !selectedOrder) return;
    setIsDownloading(true);
    
    try {
      // Small delay to ensure modal is fully rendered/animated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const element = invoiceRef.current;
      
      // Ensure all images are loaded before capturing
      const images = element.getElementsByTagName('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if one image fails
        });
      }));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#000000",
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.invoice-content');
          if (clonedElement) {
              clonedElement.style.height = 'auto';
              clonedElement.style.overflow = 'visible';
              clonedElement.style.backgroundColor = '#000000';
              clonedElement.style.color = '#ffffff';
              // Force standard text rendering to avoid Range errors
              clonedElement.style.textRendering = 'auto';
              clonedElement.style.webkitFontSmoothing = 'antialiased';
          }
        }
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Rechnung_${selectedOrder.invoiceNumber || selectedOrder._id}.pdf`);
    } catch (error) {
      console.error("Detailed PDF Generation Error:", error);
      alert("Fehler bei der PDF-Generierung: " + (error.message || "Unbekannter Fehler"));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase">Rechnungen</h1>
          <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-medium">Verwalten und Vorschau von Bestellrechnungen</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                    type="text" 
                    placeholder="Rechnungen suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 focus:outline-none focus:border-[#d3b673] transition-all w-64 text-sm text-white"
                />
            </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-3xl shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40">Rechnungsnr.</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40">Kunde</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40">Datum</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40 text-right">Steuer</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40 text-right">Betrag</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/40 text-center">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5 animate-pulse">
                    <td className="px-6 py-5"><div className="h-4 bg-white/10 rounded w-24"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-white/10 rounded w-32"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-white/10 rounded w-20"></div></td>
                    <td className="px-6 py-5 text-right"><div className="h-4 bg-white/10 rounded w-16 ml-auto"></div></td>
                    <td className="px-6 py-5 text-center"><div className="h-4 bg-white/10 rounded w-12 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-white/20 font-medium uppercase tracking-widest text-sm italic">
                    Keine Rechnungen gefunden
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-[#d3b673] uppercase tracking-tighter">
                        {order.invoiceNumber || "N/A"}
                      </span>
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
                    <td className="px-6 py-5 text-right">
                      <span className="text-xs font-black text-white/40">${order.items?.reduce((acc, item) => acc + (item.taxAmount || 0), 0).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-black text-[#d3b673]">${order.total.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={() => openPreview(order)}
                          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-[#d3b673] hover:bg-white/10 transition-all shadow-lg active:scale-95"
                          title="Vorschau Rechnung"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setTimeout(downloadPDF, 100);
                          }}
                          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-[#d3b673] hover:bg-white/10 transition-all shadow-lg active:scale-95"
                          title="Rechnung herunterladen"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Preview Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
           <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
           
           <div className="relative w-full max-w-4xl max-h-[90vh] bg-black border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              
              {/* Modal Actions */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#d3b673]/10 rounded-xl text-[#d3b673]">
                       <FileText size={20} />
                    </div>
                    <span className="font-bold uppercase tracking-widest text-sm text-white/60">Rechnungs-Vorschau</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <button 
                      onClick={downloadPDF}
                      disabled={isDownloading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#d3b673] text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#bfa35d] transition-all disabled:opacity-50"
                    >
                       {isDownloading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> : <Download size={16} />}
                       {isDownloading ? "Wird generiert..." : "PDF Herunterladen"}
                    </button>
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    >
                       <X size={20} />
                    </button>
                 </div>
              </div>

              {/* Invoice Content (This part is captured for PDF) */}
              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-black">
                 <div className="max-w-3xl mx-auto space-y-12 invoice-content" ref={invoiceRef} style={{ backgroundColor: '#000000', color: '#ffffff', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
                    
                    {/* Header */}
                    <div className="flex justify-between items-start pb-12" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                       <div className="space-y-4">
                          <Image src="/logo.png" alt="THE HERO" width={120} height={120} className="object-contain" />
                          <div className="space-y-1">
                             <p className="text-xl font-black italic tracking-tighter" style={{ color: '#ffffff' }}>THE HERO GMBH</p>
                             <p className="text-xs leading-relaxed tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                MUSTERSTRASSE 123<br />
                                10115 BERLIN, DEUTSCHLAND<br />
                                SUPPORT@THEHERO.DE
                             </p>
                          </div>
                       </div>
                       <div className="text-right space-y-2">
                          <h2 className="text-4xl font-black tracking-tighter" style={{ color: '#d3b673' }}>RECHNUNG</h2>
                          <div className="space-y-1">
                             <p className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>RECHNUNGSNUMMER</p>
                             <p className="text-lg font-black" style={{ color: '#ffffff' }}>{selectedOrder.invoiceNumber || "N/A"}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>DATUM</p>
                             <p className="text-sm font-bold" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-12">
                       <div className="space-y-4">
                          <h3 className="text-[10px] font-black tracking-[0.3em]" style={{ color: '#d3b673' }}>RECHNUNG AN</h3>
                          <div className="space-y-1">
                             <p className="text-lg font-black" style={{ color: '#ffffff' }}>{(selectedOrder.customerInfo?.firstName + " " + selectedOrder.customerInfo?.lastName).toUpperCase()}</p>
                             <p className="text-sm leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                {selectedOrder.customerInfo?.address?.toUpperCase()}<br />
                                {selectedOrder.customerInfo?.apartment && <>{selectedOrder.customerInfo.apartment.toUpperCase()}<br /></>}
                                {selectedOrder.customerInfo?.city?.toUpperCase()}, {selectedOrder.customerInfo?.state?.toUpperCase()} {selectedOrder.customerInfo?.zipCode}<br />
                                {selectedOrder.customerInfo?.country?.toUpperCase()}
                             </p>
                          </div>
                       </div>
                       <div className="space-y-4 text-right">
                          <h3 className="text-[10px] font-black tracking-[0.3em]" style={{ color: '#d3b673' }}>KONTAKT</h3>
                          <div className="space-y-1">
                             <p className="text-sm font-bold" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{selectedOrder.email?.toUpperCase()}</p>
                             <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{selectedOrder.customerInfo?.phone || "N/A"}</p>
                          </div>
                       </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-4">
                       <table className="w-full border-collapse">
                          <thead>
                             <tr className="text-[10px] font-black tracking-widest" style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)', color: '#d3b673' }}>
                                <th className="py-4 text-left">BESCHREIBUNG</th>
                                <th className="py-4 text-center">MENGE</th>
                                <th className="py-4 text-right">PREIS</th>
                                <th className="py-4 text-right px-2">STEUER</th>
                                <th className="py-4 text-right h-full pr-4">GESAMT</th>
                             </tr>
                          </thead>
                          <tbody style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                             {selectedOrder.items?.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                   <td className="py-6">
                                      <p className="text-sm font-black tracking-tight" style={{ color: '#ffffff' }}>{item.name?.toUpperCase()}</p>
                                      <p className="text-[10px] font-bold" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>{item.variant === 'tray' ? 'KARTON (12 EINHEITEN)' : 'EINZELNE EINHEIT'}</p>
                                   </td>
                                   <td className="py-6 text-center text-sm font-bold">{item.quantity}</td>
                                   <td className="py-6 text-right text-sm font-bold">${item.price?.toFixed(2)}</td>
                                   <td className="py-6 text-right text-sm font-bold px-2" style={{ color: '#d3b673' }}>${item.taxAmount?.toFixed(2)}</td>
                                   <td className="py-6 text-right text-sm font-black pr-4" style={{ color: '#d3b673' }}>${(item.quantity * item.price + (item.taxAmount || 0)).toFixed(2)}</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end pt-8" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                       <div className="w-64 space-y-3">
                          <div className="flex justify-between items-center text-xs font-bold">
                             <span className="tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>ZWISCHENSUMME</span>
                             <span style={{ color: '#ffffff' }}>${selectedOrder.subtotal?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-bold">
                             <span className="tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>GESAMTSTEUER</span>
                             <span style={{ color: '#ffffff' }}>${selectedOrder.items?.reduce((acc, item) => acc + (item.taxAmount || 0), 0).toFixed(2)}</span>
                          </div>
                          {selectedOrder.discountAmount > 0 && (
                             <div className="flex justify-between items-center text-xs font-bold" style={{ color: '#34d399' }}>
                                <span className="tracking-widest">RABATT</span>
                                <span>-${selectedOrder.discountAmount.toFixed(2)}</span>
                             </div>
                          )}
                          <div className="flex justify-between items-center pt-4" style={{ borderTop: '1px solid rgba(211, 182, 115, 0.3)' }}>
                             <span className="text-sm font-black tracking-[0.2em]" style={{ color: '#d3b673' }}>GESAMT</span>
                             <span className="text-2xl font-black" style={{ color: '#d3b673' }}>${selectedOrder.total?.toFixed(2)}</span>
                          </div>
                       </div>
                    </div>

                    {/* Footer / Notes */}
                    <div className="pt-12 text-center" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                       <p className="text-[10px] font-black tracking-[0.3em]" style={{ color: 'rgba(255, 255, 255, 0.2)' }}>VIELEN DANK FÜR IHREN EINKAUF!</p>
                       <p className="text-[8px] mt-2 tracking-widest italic" style={{ color: 'rgba(255, 255, 255, 0.1)' }}>Dies ist eine automatisch erstellte Rechnung.</p>
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

"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Package, Search } from "lucide-react";
import Image from "next/image";
import ProductForm from "../../components/Admin/ProductForm";
import { useProducts } from "@/context/ProductContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminProductsPage() {
  const { t } = useLanguage();
  const { products, loading, refreshProducts } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (id) => {
    if (!confirm(t("admin.products.delete_confirm"))) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      refreshProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("admin.products.title")}</h1>
          <p className="text-white/40 text-sm">{t("admin.products.subtitle")}</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-[#d3b673] hover:bg-[#c4a55d] text-black px-6 py-3 rounded-xl font-bold transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>{t("admin.products.add_product")}</span>
        </button>
      </div>

      {/* Search & Stats */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder={t("admin.products.search_placeholder")} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#d3b673]/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-6 px-6 border-l border-white/10 h-10 hidden md:flex">
          <div className="text-center">
            <p className="text-lg font-bold">{products.length}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{t("admin.products.total")}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#d3b673]">{products.reduce((acc, p) => acc + (p.stock || 0), 0)}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{t("admin.products.inventory")}</p>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-5">{t("admin.products.table.product")}</th>
                <th className="px-8 py-5">{t("admin.products.table.stock")}</th>
                <th className="px-8 py-5">{t("admin.products.table.price")}</th>
                <th className="px-8 py-5">Sort</th>
                <th className="px-8 py-5">Label</th>
                <th className="px-8 py-5">Tray</th>
                <th className="px-8 py-5 text-right">{t("admin.products.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-8 py-10 text-center text-white/40">{t("admin.products.loading")}</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-10 text-center text-white/40">{t("admin.products.no_products")}</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center p-1 group-hover:bg-white/20 transition-colors">
                          <Image src={product.image} alt={product.name} width={40} height={40} className="object-contain" />
                        </div>
                        <span className="font-bold">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            product.stock <= 10 ? 'bg-red-500/10 text-red-400' : 'bg-[#34d399]/10 text-[#34d399]'
                        }`}>
                            {product.stock} {t("admin.products.in_stock")}
                        </span>
                    </td>
                    <td className="px-8 py-4 font-bold text-[#d3b673]">${product.price?.toFixed(2)}</td>
                    <td className="px-8 py-4">
                      <span className="text-white/40 text-xs font-mono">{product.sortOrder}</span>
                    </td>
                    <td className="px-8 py-4">
                      {product.specialLabel && (
                        <span className="px-2 py-1 bg-white/10 border border-white/20 rounded-md text-[9px] uppercase tracking-wider text-[#d3b673] font-bold">
                          {product.specialLabel}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-white/40 text-xs font-bold">{product.traySize || 12}</span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10' transition-all"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 size={18} />
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

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm 
          product={editingProduct} 
          onClose={() => setShowForm(false)} 
          onSuccess={() => {
            setShowForm(false);
            refreshProducts();
          }}
        />
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { X, Save, Upload, Info } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function ProductForm({ product, onClose, onSuccess }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    details: "",
    longDescription: "",
    image: "",
    color: "#d3b673",
    price: 0,
    stock: 0,
    sortOrder: 0,
    specialLabel: null,
    taxRate: 0,
    nutrition: {
      calories: "",
      fat: "",
      carbs: "",
      sugar: "",
      protein: "",
      salt: "",
      extract: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.set("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (result.url) {
        setFormData((prev) => ({ ...prev, image: result.url }));
      } else {
        alert(result.error || "Upload failed");
      }
    } catch (error) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      alert("Please upload a product image");
      return;
    }
    setLoading(true);
    try {
      const url = product ? `/api/products/${product._id}` : "/api/products";
      const method = product ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      alert("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0f0e0a]/80 backdrop-blur-xl transition-opacity animate-in fade-in" 
        onClick={onClose}
      ></div>

      {/* Form Container */}
      <div className="relative w-full max-w-4xl bg-white/5 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/10 bg-white/5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{product ? t("admin.products.form.edit") : t("admin.products.form.add")}</h2>
            <p className="text-white/40 text-sm">{t("admin.products.form.subtitle")}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Basic Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Info size={18} className="text-[#d3b673]" />
                {t("admin.products.form.basic_info")}
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">{t("admin.products.form.display_name")}</label>
                  <input 
                    name="name" value={formData.name} onChange={handleChange} required
                    placeholder="e.g. LEMON"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#d3b673]" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">{t("admin.products.form.price")}</label>
                        <input 
                            name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#d3b673]" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">{t("admin.products.form.stock")}</label>
                        <input 
                            name="stock" type="number" value={formData.stock} onChange={handleChange} required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#d3b673]" 
                        />
                    </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">{t("admin.products.form.status")}</label>
                  <select 
                    name="status" value={formData.status} onChange={handleChange} required
                    className="w-full bg-[#1a1914] border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#d3b673]"
                  >
                    <option value="live" className="bg-[#1a1914]">{t("admin.products.form.status_live")}</option>
                    <option value="coming-soon" className="bg-[#1a1914]">{t("admin.products.form.status_soon")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Tax Rate (%)</label>
                  <input 
                    name="taxRate" type="number" value={formData.taxRate} onChange={handleChange} required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#d3b673]" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Sort Order</label>
                    <input 
                        name="sortOrder" type="number" value={formData.sortOrder} onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#d3b673]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Special Label</label>
                    <select 
                      name="specialLabel" value={formData.specialLabel || ""} onChange={(e) => setFormData(prev => ({...prev, specialLabel: e.target.value || null}))}
                      className="w-full bg-[#1a1914] border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#d3b673]"
                    >
                      <option value="" className="bg-[#1a1914]">None</option>
                      <option value="hummus" className="bg-[#1a1914]">Hummus</option>
                      <option value="tahini" className="bg-[#1a1914]">Tahini</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">{t("admin.products.form.theme_color")}</label>
                  <div className="flex gap-4">
                      <input 
                        type="color" name="color" value={formData.color} onChange={handleChange}
                        className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl cursor-pointer" 
                      />
                      <input 
                        name="color" value={formData.color} onChange={handleChange}
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#d3b673] font-mono" 
                      />
                  </div>
                </div>
              </div>
            </div>

            {/* Media & Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Upload size={18} className="text-[#d3b673]" />
                {t("admin.products.form.media")}
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">{t("admin.products.form.image")}</label>
                  <div className="space-y-4">
                    <div className="relative group w-full h-40 bg-white/5 border border-dashed border-white/20 rounded-2xl flex items-center justify-center overflow-hidden transition-all hover:bg-white/10 hover:border-[#d3b673]/50">
                        {formData.image ? (
                           <div className="relative w-full h-full p-4 flex items-center justify-center">
                              <Image src={formData.image} alt="Preview" width={120} height={120} className="object-contain" />
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg font-bold text-xs uppercase">{t("admin.products.form.change_image")}</label>
                              </div>
                           </div>
                        ) : (
                           <div className="flex flex-col items-center gap-2 text-white/40">
                              <Upload size={24} />
                              <span className="text-xs font-bold uppercase tracking-widest">{t("admin.products.form.upload")}</span>
                           </div>
                        )}
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                    {formData.image && <p className="text-[10px] text-white/40 font-mono truncate">{formData.image}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">{t("admin.products.form.short_desc")}</label>
                    <textarea 
                        name="description" value={formData.description} onChange={handleChange} required
                        rows="2"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#d3b673] resize-none" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">{t("admin.products.form.long_desc")}</label>
                    <textarea 
                        name="longDescription" value={formData.longDescription} onChange={handleChange}
                        rows="3"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#d3b673] resize-none" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">{t("admin.products.form.ingredients")}</label>
                    <input 
                        name="ingredients" 
                        value={Array.isArray(formData.ingredients) ? formData.ingredients.join(", ") : formData.ingredients || ""} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({...prev, ingredients: val.split(",").map(i => i.trim())}));
                        }}
                        placeholder="e.g. Pineapple, Passion Fruit, Mango"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#d3b673]" 
                    />
                </div>
              </div>
            </div>
          </div>

          {/* Nutritional Info */}
          <div className="space-y-6 pt-6 border-t border-white/10">
            <h3 className="text-lg font-bold">{t("admin.products.form.nutrition")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Calories', name: 'nutrition.calories' },
                { label: 'Fat', name: 'nutrition.fat' },
                { label: 'Carbs', name: 'nutrition.carbs' },
                { label: 'Sugar', name: 'nutrition.sugar' },
                { label: 'Protein', name: 'nutrition.protein' },
                { label: 'Salt', name: 'nutrition.salt' },
                { label: 'Extract', name: 'nutrition.extract' },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{field.label}</label>
                  <input 
                    name={field.name} 
                    value={field.name.split('.').reduce((obj, key) => obj?.[key], formData) || ""} 
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-[#d3b673]" 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 flex justify-end gap-4">
             <button 
                type="button" 
                onClick={onClose}
                className="px-8 py-4 rounded-xl text-white font-bold hover:bg-white/5 transition-all"
             >
                {t("admin.products.form.cancel")}
             </button>
             <button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2 bg-[#d3b673] hover:bg-[#c4a55d] text-black px-10 py-4 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
             >
                {loading ? t("admin.products.form.saving") : <><Save size={20} /> {t("admin.products.form.save")}</>}
             </button>
          </div>
        </form>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

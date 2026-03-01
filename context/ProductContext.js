"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter((product) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    
    // Support both direct properties and potential nesting
    const name = product.name || "";
    const description = product.description || "";
    const details = product.details || "";
    const ingredients = product.ingredients || [];

    const nameMatch = name.toLowerCase().includes(query);
    const descMatch = description.toLowerCase().includes(query);
    const detailsMatch = details.toLowerCase().includes(query);
    const ingredientsMatch = ingredients.some(ing => 
      typeof ing === 'string' && ing.toLowerCase().includes(query)
    );

    const isMatch = nameMatch || descMatch || detailsMatch || ingredientsMatch;
    return isMatch;
  });

  // Debug log to see what's happening
  useEffect(() => {
    if (searchQuery) {
      console.log("Search Query:", searchQuery);
      console.log("Filtered Results:", filteredProducts.length);
    }
  }, [searchQuery, filteredProducts]);

  return (
    <ProductContext.Provider value={{ 
      products, 
      filteredProducts,
      searchQuery,
      setSearchQuery,
      loading, 
      error, 
      refreshProducts: fetchProducts 
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}

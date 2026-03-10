"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("thehero_cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("thehero_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity, variant, openCart = true) => {
    const qtyToAdd = Number(quantity);
    
    setCartItems((prevItems) => {
      const itemKey = `${product._id}-${variant}`;
      const existingItem = prevItems.find(item => `${item._id}-${item.variant}` === itemKey);

      if (existingItem) {
        return prevItems.map((item) => 
          `${item._id}-${item.variant}` === itemKey
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item
        );
      }
      
      return [...prevItems, { ...product, quantity: qtyToAdd, variant }];
    });
    
    if (openCart) setIsCartOpen(true);
  };

  const removeFromCart = (itemId, variant) => {
    setCartItems((prevItems) => 
      prevItems.filter(item => !(item._id === itemId && item.variant === variant))
    );
  };

  const updateQuantity = (itemId, variant, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prevItems) => 
      prevItems.map(item => 
        (item._id === itemId && item.variant === variant) 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => {
    const itemPrice = item.variant === 'tray' 
      ? (item.price) * (item.traySize || 12) * 0.85 
      : (item.price);
    return total + (itemPrice * item.quantity);
  }, 0);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      isCartOpen,
      setIsCartOpen,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}


"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, Product, Client, Supplier, Sale, Account, CartItem, Category, Method } from '@/lib/types';
import { loadState, saveState, DEFAULT_STATE } from '@/lib/storage';
import { fechaStr, horaStr, fechaISO } from '@/lib/posLogic';

interface POSContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  activeWindow: string | null;
  openWindow: (name: string) => void;
  closeWindow: () => void;
  toast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  toasts: { id: string; msg: string; type: string }[];
  
  // Logic
  addToCart: (prodId: number) => void;
  updateCartQty: (prodId: number, delta: number) => void;
  removeFromCart: (prodId: number) => void;
  clearCart: () => void;
  
  // Window specific
  editingProduct: Product | null;
  setEditingProduct: (p: Product | null) => void;
  editingClient: Client | null;
  setEditingClient: (c: Client | null) => void;
  editingSupplier: Supplier | null;
  setEditingSupplier: (s: Supplier | null) => void;
  currentSaleForTicket: Sale | null;
  setCurrentSaleForTicket: (s: Sale | null) => void;
  accountFiltroTipo: 'cobrar' | 'pagar';
  setAccountFiltroTipo: (t: 'cobrar' | 'pagar') => void;
  editingAccount: Account | null;
  setEditingAccount: (a: Account | null) => void;
  
  // Mobile
  isCartMobileOpen: boolean;
  setIsCartMobileOpen: (o: boolean) => void;
  mobileTab: string;
  setMobileTab: (t: string) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: string; msg: string; type: string }[]>([]);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [currentSaleForTicket, setCurrentSaleForTicket] = useState<Sale | null>(null);
  const [accountFiltroTipo, setAccountFiltroTipo] = useState<'cobrar' | 'pagar'>('cobrar');
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  
  const [isCartMobileOpen, setIsCartMobileOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState('productos');

  // Load from storage
  useEffect(() => {
    setState(loadState());
  }, []);

  // Sync to storage
  useEffect(() => {
    if (state !== DEFAULT_STATE) {
      saveState(state);
    }
  }, [state]);

  const openWindow = useCallback((name: string) => {
    setActiveWindow(name);
  }, []);

  const closeWindow = useCallback(() => {
    setActiveWindow(null);
  }, []);

  const toast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const addToCart = useCallback((prodId: number) => {
    const prod = state.productos.find(p => p.id === prodId);
    if (!prod) return;
    
    if (prod.categoria !== 'servicio' && prod.stock <= 0) {
      toast('Agotado', 'error');
      return;
    }

    setState(prev => {
      const existing = prev.carrito.find(c => c.prodId === prodId);
      let newCarrito;
      if (existing) {
        if (prod.categoria !== 'servicio' && existing.cantidad >= prod.stock) {
          toast('Stock insuficiente', 'error');
          return prev;
        }
        newCarrito = prev.carrito.map(c => c.prodId === prodId ? { ...c, cantidad: c.cantidad + 1 } : c);
      } else {
        newCarrito = [...prev.carrito, { prodId, cantidad: 1 }];
      }
      return { ...prev, carrito: newCarrito };
    });
    toast(prod.nombre + ' agregado', 'success');
  }, [state.productos, toast]);

  const updateCartQty = useCallback((prodId: number, delta: number) => {
    setState(prev => {
      const prod = prev.productos.find(p => p.id === prodId);
      const newCarrito = prev.carrito.map(c => {
        if (c.prodId === prodId) {
          const newQty = c.cantidad + delta;
          if (newQty <= 0) return null;
          if (prod && prod.categoria !== 'servicio' && newQty > prod.stock) {
            toast('Stock insuficiente', 'error');
            return { ...c, cantidad: prod.stock };
          }
          return { ...c, cantidad: newQty };
        }
        return c;
      }).filter(Boolean) as CartItem[];
      return { ...prev, carrito: newCarrito };
    });
  }, [toast]);

  const removeFromCart = useCallback((prodId: number) => {
    setState(prev => ({
      ...prev,
      carrito: prev.carrito.filter(c => c.prodId !== prodId)
    }));
  }, []);

  const clearCart = useCallback(() => {
    setState(prev => ({
      ...prev,
      carrito: [],
      clienteActual: ''
    }));
    toast('Carrito vaciado', 'info');
  }, [toast]);

  return (
    <POSContext.Provider value={{
      state, setState,
      activeWindow, openWindow, closeWindow,
      toast, toasts,
      addToCart, updateCartQty, removeFromCart, clearCart,
      editingProduct, setEditingProduct,
      editingClient, setEditingClient,
      editingSupplier, setEditingSupplier,
      currentSaleForTicket, setCurrentSaleForTicket,
      accountFiltroTipo, setAccountFiltroTipo,
      editingAccount, setEditingAccount,
      isCartMobileOpen, setIsCartMobileOpen,
      mobileTab, setMobileTab
    }}>
      {children}
    </POSContext.Provider>
  );
}

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) throw new Error('usePOS must be used within a POSProvider');
  return context;
};

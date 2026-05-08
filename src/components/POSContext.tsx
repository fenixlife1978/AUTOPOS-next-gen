
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  AppState, Product, Client, Supplier, Sale, CartItem, Category, Method, 
  PurchaseInvoice, PurchasePayment, AsientoContable, TasaCambio, Moneda 
} from '@/lib/types';
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
  
  // Accounting & Invoices
  registrarFactura: (data: Partial<PurchaseInvoice>) => void;
  registrarAbono: (data: { facturaId: number; montoOriginal: number; monedaAbono: Moneda; metodo: Method; tasa?: number }) => void;
  getTasaActual: (moneda: Moneda) => number;
  
  // Window specific
  editingProduct: Product | null;
  setEditingProduct: (p: Product | null) => void;
  editingClient: Client | null;
  setEditingClient: (c: Client | null) => void;
  editingSupplier: Supplier | null;
  setEditingSupplier: (s: Supplier | null) => void;
  editingInvoice: PurchaseInvoice | null;
  setEditingInvoice: (i: PurchaseInvoice | null) => void;
  currentSaleForTicket: Sale | null;
  setCurrentSaleForTicket: (s: Sale | null) => void;
  accountFiltroTipo: 'cobrar' | 'pagar';
  setAccountFiltroTipo: (t: 'cobrar' | 'pagar') => void;
  
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
  const [editingInvoice, setEditingInvoice] = useState<PurchaseInvoice | null>(null);
  const [currentSaleForTicket, setCurrentSaleForTicket] = useState<Sale | null>(null);
  const [accountFiltroTipo, setAccountFiltroTipo] = useState<'cobrar' | 'pagar'>('pagar');
  
  const [isCartMobileOpen, setIsCartMobileOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState('productos');

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    if (state !== DEFAULT_STATE) {
      saveState(state);
    }
  }, [state]);

  const openWindow = useCallback((name: string) => setActiveWindow(name), []);
  const closeWindow = useCallback(() => setActiveWindow(null), []);

  const toast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const getTasaActual = useCallback((moneda: Moneda) => {
    if (moneda === 'VES') return 1;
    const t = [...state.tasas].reverse().find(t => t.moneda_origen === moneda);
    return t ? t.tasa : 1;
  }, [state.tasas]);

  const registrarFactura = useCallback((data: Partial<PurchaseInvoice>) => {
    setState(prev => {
      const id = prev.nextCompraId;
      const factura: PurchaseInvoice = {
        id,
        proveedorId: data.proveedorId!,
        numeroFactura: data.numeroFactura!,
        fechaEmision: data.fechaEmision!,
        fechaVencimiento: data.fechaVencimiento,
        moneda_original: data.moneda_original!,
        monto_original: data.monto_original!,
        monto_bolivares: data.monto_bolivares!,
        tasa_cambio_usada: data.tasa_cambio_usada!,
        tasa_fuente: data.tasa_fuente!,
        tipoFactura: data.tipoFactura!,
        estadoPago: data.fechaVencimiento ? 'pendiente' : 'pagada',
        total_pagado_original: data.fechaVencimiento ? 0 : data.monto_original!,
        saldo_pendiente_original: data.fechaVencimiento ? data.monto_original! : 0,
        total_pagado_ves: data.fechaVencimiento ? 0 : data.monto_bolivares!,
        saldo_pendiente_ves: data.fechaVencimiento ? data.monto_bolivares! : 0,
        imagenUrl: data.imagenUrl,
        created_at: new Date().toISOString()
      };

      const asiento: AsientoContable = {
        id: prev.nextAsientoId,
        fecha: new Date().toISOString(),
        concepto: `Compra según factura ${factura.numeroFactura}`,
        referenciaId: id,
        tipo: 'COMPRA',
        lineas: [
          { cuenta: '5.1.1.01. Compras', debe: factura.monto_bolivares / 1.16, haber: 0 },
          { cuenta: '1.7.2.01. Crédito Fiscal', debe: (factura.monto_bolivares / 1.16) * 0.16, haber: 0 },
          { cuenta: factura.fechaVencimiento ? '2.1.1.01. Proveedores' : '1.1.2.01. Bancos', debe: 0, haber: factura.monto_bolivares }
        ]
      };

      return {
        ...prev,
        compras: [...prev.compras, factura],
        asientos: [...prev.asientos, asiento],
        nextCompraId: prev.nextCompraId + 1,
        nextAsientoId: prev.nextAsientoId + 1
      };
    });
    toast('Factura registrada', 'success');
  }, [toast]);

  const registrarAbono = useCallback((data: { facturaId: number; montoOriginal: number; monedaAbono: Moneda; metodo: Method; tasa?: number }) => {
    setState(prev => {
      const factura = prev.compras.find(f => f.id === data.facturaId);
      if (!factura) return prev;

      const tasaAbonoVES = data.tasa || getTasaActual(data.monedaAbono);
      const montoBs = data.montoOriginal * tasaAbonoVES;
      
      let montoEnMonedaFactura = data.montoOriginal;
      if (data.monedaAbono !== factura.moneda_original) {
        montoEnMonedaFactura = montoBs / factura.tasa_cambio_usada;
      }

      const nuevoPagadoOrig = factura.total_pagado_original + montoEnMonedaFactura;
      const nuevoSaldoOrig = Math.max(0, factura.monto_original - nuevoPagadoOrig);
      const nuevoPagadoVES = factura.total_pagado_ves + montoBs;
      const nuevoSaldoVES = Math.max(0, factura.monto_bolivares - nuevoPagadoVES);
      
      const difCambio = montoBs - (montoEnMonedaFactura * factura.tasa_cambio_usada);

      const abono: PurchasePayment = {
        id: Math.random().toString(36).substring(2, 9),
        facturaId: data.facturaId,
        moneda_abono: data.monedaAbono,
        monto_original: data.montoOriginal,
        monto_bolivares: montoBs,
        tasa_cambio_aplicada: tasaAbonoVES,
        fechaAbono: new Date().toISOString(),
        metodoPago: data.metodo,
      };

      const asiento: AsientoContable = {
        id: prev.nextAsientoId,
        fecha: new Date().toISOString(),
        concepto: `Abono a factura ${factura.numeroFactura}`,
        referenciaId: abono.id,
        tipo: 'ABONO',
        lineas: [
          { cuenta: '2.1.1.01. Proveedores', debe: montoEnMonedaFactura * factura.tasa_cambio_usada, haber: 0 },
          { cuenta: difCambio > 0 ? '8.3.1.01. Pérdida Cambiaria' : '7.3.1.01. Ganancia Cambiaria', debe: difCambio > 0 ? difCambio : 0, haber: difCambio < 0 ? Math.abs(difCambio) : 0 },
          { cuenta: '1.1.2.01. Bancos', debe: 0, haber: montoBs }
        ]
      };

      return {
        ...prev,
        compras: prev.compras.map(f => f.id === data.facturaId ? {
          ...f, 
          total_pagado_original: nuevoPagadoOrig, 
          saldo_pendiente_original: nuevoSaldoOrig,
          total_pagado_ves: nuevoPagadoVES,
          saldo_pendiente_ves: nuevoSaldoVES,
          estadoPago: nuevoSaldoOrig <= 0 ? 'pagada' : 'parcial'
        } : f),
        abonos: [...prev.abonos, abono],
        asientos: [...prev.asientos, asiento],
        nextAsientoId: prev.nextAsientoId + 1
      };
    });
    toast('Abono registrado', 'success');
  }, [getTasaActual, toast]);

  const addToCart = useCallback((prodId: number) => {
    const prod = state.productos.find(p => p.id === prodId);
    if (!prod) return;
    if (prod.categoria !== 'servicio' && prod.stock <= 0) {
      toast('Agotado', 'error');
      return;
    }
    setState(prev => {
      const existing = prev.carrito.find(c => c.prodId === prodId);
      if (existing) {
        if (prod.categoria !== 'servicio' && existing.cantidad >= prod.stock) {
          toast('Stock insuficiente', 'error');
          return prev;
        }
        return { ...prev, carrito: prev.carrito.map(c => c.prodId === prodId ? { ...c, cantidad: c.cantidad + 1 } : c) };
      }
      return { ...prev, carrito: [...prev.carrito, { prodId, cantidad: 1 }] };
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
      }).filter(Boolean) as any[];
      return { ...prev, carrito: newCarrito };
    });
  }, [toast]);

  const removeFromCart = useCallback((prodId: number) => {
    setState(prev => ({ ...prev, carrito: prev.carrito.filter(c => c.prodId !== prodId) }));
  }, []);

  const clearCart = useCallback(() => {
    setState(prev => ({ ...prev, carrito: [], clienteActual: '' }));
    toast('Carrito vaciado', 'info');
  }, [toast]);

  return (
    <POSContext.Provider value={{
      state, setState,
      activeWindow, openWindow, closeWindow,
      toast, toasts,
      addToCart, updateCartQty, removeFromCart, clearCart,
      registrarFactura, registrarAbono, getTasaActual,
      editingProduct, setEditingProduct,
      editingClient, setEditingClient,
      editingSupplier, setEditingSupplier,
      editingInvoice, setEditingInvoice,
      currentSaleForTicket, setCurrentSaleForTicket,
      accountFiltroTipo, setAccountFiltroTipo,
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

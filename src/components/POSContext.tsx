
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  AppState, Product, Client, Supplier, Sale, CartItem, Category, Method, 
  PurchaseInvoice, PurchasePayment, AsientoContable, TasaCambio, Moneda, CuentaContable, BoxSession
} from '@/lib/types';
import { loadState, saveState, DEFAULT_STATE } from '@/lib/storage';
import { fechaStr, horaStr } from '@/lib/posLogic';
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

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
  
  // Sales
  processSale: (sale: Sale) => Promise<void>;
  deleteSale: (saleId: string) => Promise<void>;
  
  // Accounting
  addAccountingEntry: (entry: Omit<AsientoContable, 'id' | 'created_at'>) => Promise<void>;
  deleteAccountingEntry: (entryId: string) => Promise<void>;
  addCuenta: (cuenta: Omit<CuentaContable, 'id' | 'nivel' | 'codigo'>) => void;
  updateCuenta: (id: string, data: Partial<CuentaContable>) => void;
  deleteCuenta: (id: string) => void;
  closeMonth: (yearMonth: string) => Promise<void>;
  reopenMonth: (yearMonth: string) => Promise<void>;
  
  // Cash Box
  openBox: (monto: number) => void;
  closeBox: () => void;
  
  // Invoices & Abonos
  registrarFactura: (data: Partial<PurchaseInvoice>) => void;
  registrarAbono: (data: { facturaId: number; montoOriginal: number; monedaAbono: Moneda; metodo: Method; tasa?: number }) => void;
  getTasaActual: (moneda: Moneda) => number;
  
  // Categories
  addCustomCategory: (name: string) => void;
  
  // Window specific
  editingProduct: Product | null;
  setEditingProduct: (p: Product | null) => void;
  editingClient: Client | null;
  setEditingClient: (c: Client | null) => void;
  editingSupplier: Supplier | null;
  setEditingSupplier: (s: Supplier | null) => void;
  editingInvoice: PurchaseInvoice | null;
  setEditingInvoice: (i: PurchaseInvoice | null) => void;
  editingCuenta: CuentaContable | null;
  setEditingCuenta: (acc: CuentaContable | null) => void;
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
  const [editingCuenta, setEditingCuenta] = useState<CuentaContable | null>(null);
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

  const openBox = (monto: number) => {
    const newSession: BoxSession = {
      id: Math.random().toString(36).substring(7),
      fechaApertura: new Date().toISOString(),
      montoAperturaVES: monto,
      vendedor: 'Administrador',
      estado: 'abierta'
    };
    setState(prev => ({ ...prev, boxSession: newSession }));
    toast('Caja abierta correctamente', 'success');
  };

  const closeBox = () => {
    setState(prev => ({ ...prev, boxSession: { ...prev.boxSession!, estado: 'cerrada', fechaCierre: new Date().toISOString() } }));
    // No reseteamos inmediatamente para que el componente CajaWindow pueda mostrar el reporte final antes de que el usuario lo cierre
  };

  const addCuenta = (cuentaData: Omit<CuentaContable, 'id' | 'nivel' | 'codigo'>) => {
    const baseCodeMap: Record<string, string> = {
      'ACTIVO CORRIENTE': '1.1',
      'ACTIVO NO CORRIENTE': '1.2',
      'PASIVO CORRIENTE': '2.1',
      'PASIVO NO CORRIENTE': '2.2',
      'PATRIMONIO': '3.1',
      'INGRESOS OPERACIONALES': '4.1',
      'INGRESOS NO OPERACIONALES': '4.2',
      'COSTOS DE VENTAS': '5.1',
      'GASTOS ADMINISTRATIVOS': '6.1',
      'GASTOS DE VENTAS': '6.2',
      'GASTOS FINANCIEROS': '6.3',
      'OTROS INGRESOS': '7.1',
      'OTROS GASTOS': '8.1',
      'CUENTAS DE ORDEN': '9.1',
      'RESERVAS': '3.2'
    };

    const prefix = baseCodeMap[cuentaData.tipo] || '0.0';
    const siblings = state.cuentas.filter(c => c.codigo.startsWith(prefix));
    const nextIdx = siblings.length + 1;
    const finalCode = `${prefix}.${String(nextIdx).padStart(2, '0')}`;

    const newCuenta: CuentaContable = {
      ...cuentaData,
      id: Math.random().toString(36).substring(7),
      codigo: finalCode,
      nivel: finalCode.split('.').length,
      editable: true
    };

    setState(prev => ({ ...prev, cuentas: [...prev.cuentas, newCuenta] }));
    toast(`Cuenta ${finalCode} creada`, 'success');
  };

  const updateCuenta = (id: string, data: Partial<CuentaContable>) => {
    setState(prev => ({
      ...prev,
      cuentas: prev.cuentas.map(c => c.id === id ? { ...c, ...data } : c)
    }));
    toast('Cuenta actualizada', 'success');
  };

  const deleteCuenta = (id: string) => {
    if (!confirm('¿Desea eliminar esta cuenta? Esta acción no se puede deshacer si tiene asientos vinculados.')) return;
    setState(prev => ({ ...prev, cuentas: prev.cuentas.filter(c => c.id !== id) }));
    toast('Cuenta eliminada', 'info');
  };

  const closeMonth = async (yearMonth: string) => {
    toast(`Mes ${yearMonth} cerrado con éxito`, 'success');
    setState(prev => ({
      ...prev,
      cuentas: prev.cuentas.map(c => ({ ...c, mesCerrado: yearMonth }))
    }));
  };

  const reopenMonth = async (yearMonth: string) => {
    toast(`Mes ${yearMonth} reabierto para correcciones`, 'info');
    setState(prev => ({
      ...prev,
      cuentas: prev.cuentas.map(c => c.mesCerrado === yearMonth ? { ...c, mesCerrado: undefined } : c)
    }));
  };

  const addAccountingEntry = async (entry: Omit<AsientoContable, 'id' | 'created_at'>) => {
    try {
      const { firestore } = initializeFirebase();
      const docRef = await addDoc(collection(firestore, 'asientos_contables'), {
        ...entry,
        created_at: serverTimestamp(),
        fecha: Timestamp.fromDate(new Date(entry.fecha))
      });
      const newEntry = { ...entry, id: docRef.id, created_at: new Date() } as AsientoContable;
      setState(prev => ({ ...prev, asientos: [newEntry, ...prev.asientos] }));
    } catch (e) {
      console.error(e);
      toast('Error al guardar asiento', 'error');
    }
  };

  const deleteAccountingEntry = async (entryId: string) => {
    try {
      const { firestore } = initializeFirebase();
      await deleteDoc(doc(firestore, 'asientos_contables', entryId));
      setState(prev => ({ ...prev, asientos: prev.asientos.filter(a => a.id !== entryId) }));
      toast('Asiento eliminado', 'info');
    } catch (e) {
      console.error(e);
      toast('Error al eliminar asiento', 'error');
    }
  };

  const processSale = async (sale: Sale) => {
    try {
      const { firestore } = initializeFirebase();
      const saleData = {
        ...sale,
        boxSessionId: state.boxSession?.id || null,
        created_at: serverTimestamp()
      };
      const saleRef = await addDoc(collection(firestore, 'ventas'), saleData);
      const saleWithId = { ...sale, id: saleRef.id, boxSessionId: state.boxSession?.id };

      await addAccountingEntry({
        fecha: new Date(),
        descripcion: `Venta POS #${saleWithId.id.substring(0, 5)} - ${sale.cliente?.nombre || 'General'}`,
        tipo: 'VENTA',
        referencia: saleWithId.id,
        modulo: 'VENTAS',
        lineas: [
          { cuentaId: '1.1.01.01', nombreCuenta: 'Caja Principal', debe: sale.total, haber: 0, moneda: 'VES' },
          { cuentaId: '4.1.01.01', nombreCuenta: 'Ingresos por Ventas', debe: 0, haber: sale.total / 1.16, moneda: 'VES' },
          { cuentaId: '2.1.02.01', nombreCuenta: 'Débito Fiscal IVA', debe: 0, haber: (sale.total / 1.16) * 0.16, moneda: 'VES' }
        ]
      });

      setState(prev => ({ ...prev, ventas: [saleWithId, ...prev.ventas], carrito: [], clienteActual: '' }));
      setCurrentSaleForTicket(saleWithId);
      toast('Venta procesada con éxito', 'success');
    } catch (e) {
      console.error(e);
      toast('Error procesando venta', 'error');
    }
  };

  const deleteSale = async (saleId: string) => {
    if (!confirm('¿Seguro que desea eliminar esta venta? Esto también eliminará el asiento contable asociado.')) return;
    try {
      const { firestore } = initializeFirebase();
      await deleteDoc(doc(firestore, 'ventas', saleId));
      
      const asientoAsociado = state.asientos.find(a => a.referencia === saleId);
      if (asientoAsociado) {
        await deleteAccountingEntry(asientoAsociado.id);
      }

      setState(prev => ({ ...prev, ventas: prev.ventas.filter(v => v.id !== saleId) }));
      toast('Venta y asiento contable eliminados', 'info');
    } catch (e) {
      console.error(e);
      toast('Error al eliminar venta', 'error');
    }
  };

  const getTasaActual = useCallback((moneda: Moneda) => {
    if (moneda === 'VES') return 1;
    const t = [...state.tasas].reverse().find(t => t.monedaOrigen === moneda);
    return t ? t.tasa : 45;
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
        created_at: new Date().toISOString()
      };
      return {
        ...prev,
        compras: [...prev.compras, factura],
        nextCompraId: prev.nextCompraId + 1
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
        abonos: [...prev.abonos, abono]
      };
    });
    toast('Abono registrado', 'success');
  }, [getTasaActual, toast]);

  const addToCart = useCallback((prodId: number) => {
    if (!state.boxSession || state.boxSession.estado === 'cerrada') {
      toast('Debe abrir la caja primero', 'error');
      return;
    }
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
  }, [state.productos, state.boxSession, toast]);

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

  const addCustomCategory = (name: string) => {
    if (state.customCategories.includes(name)) return;
    setState(prev => ({
      ...prev,
      customCategories: [...prev.customCategories, name]
    }));
    toast(`Categoría "${name}" añadida`, 'success');
  };

  return (
    <POSContext.Provider value={{
      state, setState,
      activeWindow, openWindow, closeWindow,
      toast, toasts,
      addToCart, updateCartQty, removeFromCart, clearCart,
      processSale, deleteSale,
      addAccountingEntry, deleteAccountingEntry, addCuenta, updateCuenta, deleteCuenta, closeMonth, reopenMonth,
      openBox, closeBox,
      registrarFactura, registrarAbono, getTasaActual,
      addCustomCategory,
      editingProduct, setEditingProduct,
      editingClient, setEditingClient,
      editingSupplier, setEditingSupplier,
      editingInvoice, setEditingInvoice,
      editingCuenta, setEditingCuenta,
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

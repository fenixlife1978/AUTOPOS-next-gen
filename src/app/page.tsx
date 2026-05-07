
"use client";

import React, { useEffect } from 'react';
import { POSProvider, usePOS } from '@/components/POSContext';
import MenuBar from '@/components/MenuBar';
import Toolbar from '@/components/Toolbar';
import ProductsPanel from '@/components/ProductsPanel';
import CartPanel from '@/components/CartPanel';
import StatusBar from '@/components/StatusBar';
import ToastContainer from '@/components/ToastContainer';
import WindowOverlay from '@/components/Windows/WindowOverlay';

// Windows
import InventoryWindow from '@/components/Windows/InventoryWindow';
import AddProductWindow from '@/components/Windows/AddProductWindow';
import CobrarWindow from '@/components/Windows/CobrarWindow';
import HistoryWindow from '@/components/Windows/HistoryWindow';
import TicketWindow from '@/components/Windows/TicketWindow';
import ClientsWindow from '@/components/Windows/ClientsWindow';
import AddClientWindow from '@/components/Windows/AddClientWindow';

function MainLayout() {
  const { clearCart, openWindow, closeWindow, activeWindow, setIsCartMobileOpen, mobileTab, setMobileTab } = usePOS();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      
      if (e.key === 'Escape') {
        if (activeWindow) closeWindow();
        setIsCartMobileOpen(false);
      }
      if (e.key === 'F2' && !isInput) {
        e.preventDefault();
        if (confirm('¿Iniciar nueva venta?')) clearCart();
      }
      if (e.key === 'F6' && !isInput) {
        e.preventDefault();
        openWindow('inventario');
      }
      if (e.key === 'F7' && !isInput) {
        e.preventDefault();
        openWindow('clientes');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeWindow, closeWindow, clearCart, openWindow, setIsCartMobileOpen]);

  return (
    <>
      <MenuBar />
      <Toolbar />
      
      <div className="mobile-tabs">
        <div className={`mobile-tab ${mobileTab === 'productos' ? 'active' : ''}`} onClick={() => { setMobileTab('productos'); setIsCartMobileOpen(false); }}>
          <i className="fas fa-box"></i> Productos
        </div>
        <div className={`mobile-tab ${mobileTab === 'carrito' ? 'active' : ''}`} onClick={() => { setMobileTab('carrito'); setIsCartMobileOpen(true); }}>
          <i className="fas fa-cart-shopping"></i> Carrito
        </div>
      </div>

      <div className="main-area">
        <ProductsPanel />
        <CartPanel />
      </div>

      <button className="mobile-cart-toggle" onClick={() => setIsCartMobileOpen(prev => !prev)}>
        <i className="fas fa-cart-shopping"></i>
      </button>

      <StatusBar />
      <ToastContainer />
      <WindowOverlay />
      
      {/* All windows rendered here, they handle their own internal 'isOpen' state via Context */}
      <InventoryWindow />
      <AddProductWindow />
      <CobrarWindow />
      <HistoryWindow />
      <TicketWindow />
      <ClientsWindow />
      <AddClientWindow />
      
      {/* Note: In a full implementation, Suppliers, Accounts, Reports etc would be here too */}
    </>
  );
}

export default function Home() {
  return (
    <POSProvider>
      <MainLayout />
    </POSProvider>
  );
}

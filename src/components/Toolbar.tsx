
"use client";

import React from 'react';
import { usePOS } from './POSContext';
import { LayoutDashboard, Users, Truck, Wallet, FileText, BarChart3, BookOpen, Plus } from 'lucide-react';

export default function Toolbar() {
  const { openWindow, clearCart, setAccountFiltroTipo } = usePOS();

  return (
    <div className="toolbar">
      <div className="tool-btn active" onClick={clearCart} title="F2 - Limpiar carrito e iniciar una nueva venta desde cero">
        <Plus size={16} /> Nueva Venta
      </div>
      <div className="tool-sep"></div>
      
      <div className="tool-btn" onClick={() => openWindow('inventario')} title="F6 - Gestionar productos, servicios y control de stock real">
        <LayoutDashboard size={16} /> Inventario
      </div>
      
      <div className="tool-btn" onClick={() => openWindow('clientes')} title="F7 - Directorio de clientes, historial de vehículos y placas">
        <Users size={16} /> Clientes
      </div>
      
      <div className="tool-btn" onClick={() => openWindow('proveedores')} title="Administrar catálogo de proveedores y facturas de compra">
        <Truck size={16} /> Proveedores
      </div>
      
      <div className="tool-sep"></div>
      
      <div className="tool-btn" onClick={() => openWindow('cobranzas')} title="Módulo CxC: Gestión de créditos otorgados a clientes y cobranzas pendientes">
        <Wallet size={16} /> CxC
      </div>
      
      <div className="tool-btn" onClick={() => { setAccountFiltroTipo('pagar'); openWindow('cuentas'); }} title="Módulo CxP: Control de deudas con proveedores y pagos realizados">
        <FileText size={16} /> CxP
      </div>
      
      <div className="tool-btn" onClick={() => openWindow('contabilidad')} title="Módulo de Contabilidad: Libro Diario, Mayor, Balances y Conciliación Bancaria">
        <BookOpen size={16} /> Contabilidad
      </div>
      
      <div className="tool-btn" onClick={() => openWindow('reportes')} title="Visualizar estadísticas de ventas, ganancias e informes administrativos">
        <BarChart3 size={16} /> Reportes
      </div>
      
      <div style={{ flex: 1 }}></div>
      
      <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 10px' }} title="Usuario con permisos totales de administración">
        <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-black flex items-center justify-center font-bold text-[10px]">AD</div>
        Administrador
      </div>
    </div>
  );
}

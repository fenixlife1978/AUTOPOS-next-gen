
"use client";

import React from 'react';
import { usePOS } from './POSContext';

export default function Toolbar() {
  const { openWindow, clearCart, setAccountFiltroTipo } = usePOS();

  return (
    <div className="toolbar">
      <div className="tool-btn active" onClick={clearCart} title="F2"><i className="fas fa-plus"></i>Nueva Venta</div>
      <div className="tool-sep"></div>
      <div className="tool-btn" onClick={() => openWindow('inventario')} title="F6"><i className="fas fa-boxes-stacked"></i>Inventario</div>
      <div className="tool-btn" onClick={() => openWindow('clientes')} title="F7"><i className="fas fa-users"></i>Clientes</div>
      <div className="tool-btn" onClick={() => openWindow('proveedores')}><i className="fas fa-truck"></i>Proveedores</div>
      <div className="tool-sep"></div>
      <div className="tool-btn" onClick={() => openWindow('cobranzas')}><i className="fas fa-hand-holding-dollar"></i>CxC</div>
      <div className="tool-btn" onClick={() => { setAccountFiltroTipo('pagar'); openWindow('cuentas'); }}><i className="fas fa-file-invoice-dollar"></i>CxP</div>
      <div className="tool-btn" onClick={() => openWindow('contabilidad')}><i className="fas fa-book"></i>Libro Diario</div>
      <div className="tool-btn" onClick={() => openWindow('reportes')}><i className="fas fa-chart-bar"></i>Reportes</div>
      <div style={{ flex: 1 }}></div>
      <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <i className="fas fa-user-circle"></i>Administrador
      </div>
    </div>
  );
}

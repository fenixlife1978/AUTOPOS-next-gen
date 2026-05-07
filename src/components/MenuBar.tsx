
"use client";

import React, { useState } from 'react';
import { usePOS } from './POSContext';

export default function MenuBar() {
  const { openWindow, clearCart, state } = usePOS();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleMenuClick = (menu: string) => {
    setActiveMenu(prev => prev === menu ? null : menu);
  };

  const closeMenu = () => setActiveMenu(null);

  const exportData = () => {
    closeMenu();
    const data = {
      ...state,
      exportado: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autopos_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="menu-bar" onMouseLeave={closeMenu}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingRight: '12px', borderRight: '1px solid var(--border)', marginRight: '4px' }}>
        <i className="fas fa-oil-can" style={{ color: 'var(--accent)', fontSize: '14px' }}></i>
        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '13px', color: 'var(--fg)' }}>AutoPOS</span>
      </div>
      
      {/* Archivo */}
      <div className={`menu-item ${activeMenu === 'archivo' ? 'active' : ''}`} onClick={() => handleMenuClick('archivo')}>
        Archivo
        <div className="menu-dropdown">
          <div className="menu-dropdown-item" onClick={() => { clearCart(); closeMenu(); }}><i className="fas fa-plus"></i>Nueva venta<span className="menu-shortcut">F2</span></div>
          <div className="menu-dropdown-item" onClick={() => { openWindow('historial'); closeMenu(); }}><i className="fas fa-clock-rotate-left"></i>Historial<span className="menu-shortcut">F3</span></div>
          <div className="menu-sep"></div>
          <div className="menu-dropdown-item" onClick={exportData}><i className="fas fa-download"></i>Exportar datos</div>
        </div>
      </div>

      {/* Ventas */}
      <div className={`menu-item ${activeMenu === 'ventas' ? 'active' : ''}`} onClick={() => handleMenuClick('ventas')}>
        Ventas
        <div className="menu-dropdown">
          <div className="menu-dropdown-item" onClick={() => { openWindow('cobrar'); closeMenu(); }}><i className="fas fa-cash-register"></i>Cobrar<span className="menu-shortcut">F4</span></div>
          <div className="menu-dropdown-item" onClick={() => { openWindow('historial'); closeMenu(); }}><i className="fas fa-receipt"></i>Ver ventas</div>
          <div className="menu-dropdown-item" onClick={() => { openWindow('reportes'); closeMenu(); }}><i className="fas fa-chart-bar"></i>Reportes<span className="menu-shortcut">F5</span></div>
        </div>
      </div>

      {/* Inventario */}
      <div className={`menu-item ${activeMenu === 'inventario' ? 'active' : ''}`} onClick={() => handleMenuClick('inventario')}>
        Inventario
        <div className="menu-dropdown">
          <div className="menu-dropdown-item" onClick={() => { openWindow('inventario'); closeMenu(); }}><i className="fas fa-boxes-stacked"></i>Productos<span className="menu-shortcut">F6</span></div>
          <div className="menu-dropdown-item" onClick={() => { openWindow('agregarProducto'); closeMenu(); }}><i className="fas fa-plus-circle"></i>Agregar producto</div>
        </div>
      </div>

      {/* Clientes */}
      <div className={`menu-item ${activeMenu === 'clientes' ? 'active' : ''}`} onClick={() => handleMenuClick('clientes')}>
        Clientes
        <div className="menu-dropdown">
          <div className="menu-dropdown-item" onClick={() => { openWindow('clientes'); closeMenu(); }}><i className="fas fa-users"></i>Ver clientes<span className="menu-shortcut">F7</span></div>
          <div className="menu-dropdown-item" onClick={() => { openWindow('agregarCliente'); closeMenu(); }}><i className="fas fa-user-plus"></i>Agregar cliente</div>
        </div>
      </div>
    </div>
  );
}

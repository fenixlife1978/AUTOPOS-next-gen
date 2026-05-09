
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
        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '13px', color: 'var(--fg)' }}>AutoPOS Professional</span>
      </div>
      
      {/* Archivo */}
      <div className={`menu-item ${activeMenu === 'archivo' ? 'active' : ''}`} onClick={() => handleMenuClick('archivo')}>
        Archivo
        <div className="menu-dropdown">
          <div className="menu-dropdown-item" onClick={() => { clearCart(); closeMenu(); }}><i className="fas fa-plus"></i>Nueva venta<span className="menu-shortcut">F2</span></div>
          <div className="menu-dropdown-item" onClick={() => { openWindow('historial'); closeMenu(); }}><i className="fas fa-clock-rotate-left"></i>Historial<span className="menu-shortcut">F3</span></div>
          <div className="menu-sep"></div>
          <div className="menu-dropdown-item" onClick={() => { openWindow('configuracion'); closeMenu(); }}><i className="fas fa-gears"></i>Configuración de Negocio</div>
          <div className="menu-sep"></div>
          <div className="menu-dropdown-item" onClick={exportData}><i className="fas fa-download"></i>Exportar datos (Backup)</div>
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { fmt } from '@/lib/posLogic';

export default function InvoicesWindow() {
  const { state, activeWindow, closeWindow, openWindow, setEditingInvoice } = usePOS();
  const [q, setQ] = useState('');

  const filtered = state.compras.filter(i => {
    const prov = state.proveedores.find(p => p.id === i.proveedorId);
    return !q || i.numeroFactura.toLowerCase().includes(q.toLowerCase()) || (prov?.nombre || '').toLowerCase().includes(q.toLowerCase());
  }).reverse();

  return (
    <BaseWindow 
      id="facturas" 
      title="Gestión de Compras (Facturas)" 
      icon="fa-file-invoice-dollar" 
      width="850px"
      isOpen={activeWindow === 'facturas'}
      onClose={closeWindow}
      footer={<button className="btn btn-secondary" onClick={closeWindow}>Cerrar</button>}
    >
      <div style={{ padding: '10px', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <div className="search-wrap" style={{ flex: 1 }}>
          <i className="fas fa-search"></i>
          <input type="text" className="search-input" placeholder="Buscar por factura o proveedor..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditingInvoice(null); openWindow('agregarFactura'); }}>
          <i className="fas fa-plus"></i>Nueva Factura
        </button>
      </div>
      <div style={{ overflowY: 'auto', maxHeight: '450px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>N° Factura</th>
              <th>Proveedor</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Total Bs.</th>
              <th>Saldo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => {
              const prov = state.proveedores.find(p => p.id === i.proveedorId);
              return (
                <tr key={i.id}>
                  <td style={{ fontFamily: 'monospace' }}>{i.numeroFactura}</td>
                  <td>{prov?.nombre || 'Desconocido'}</td>
                  <td>{new Date(i.fechaEmision).toLocaleDateString()}</td>
                  <td><span className={`badge badge-${i.tipoFactura.toLowerCase()}`}>{i.tipoFactura === 'FISCAL_SENIAT' ? 'Fiscal' : 'Nota'}</span></td>
                  <td style={{ fontWeight: 600 }}>{fmt(i.montoBolivares)}</td>
                  <td style={{ color: i.saldoPendiente > 0 ? 'var(--danger)' : 'var(--success)' }}>{fmt(i.saldoPendiente)}</td>
                  <td><span className={`badge badge-${i.estadoPago}`}>{i.estadoPago}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </BaseWindow>
  );
}

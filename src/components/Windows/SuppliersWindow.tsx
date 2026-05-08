
"use client";

import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';

export default function SuppliersWindow() {
  const { state, setState, activeWindow, closeWindow, openWindow, setEditingSupplier, toast } = usePOS();
  const [q, setQ] = useState('');

  const filtered = state.proveedores.filter(p => 
    !q || p.nombre.toLowerCase().includes(q.toLowerCase()) || (p.rif || '').toLowerCase().includes(q.toLowerCase())
  );

  const handleEdit = (p: any) => {
    setEditingSupplier(p);
    openWindow('agregarProveedor');
  };

  const handleDelete = (id: number) => {
    if (!confirm('¿Eliminar proveedor?')) return;
    setState(prev => ({
      ...prev,
      proveedores: prev.proveedores.filter(p => p.id !== id)
    }));
    toast('Eliminado', 'info');
  };

  return (
    <BaseWindow 
      id="proveedores" 
      title="Catálogo de Proveedores" 
      icon="fa-truck" 
      width="780px"
      isOpen={activeWindow === 'proveedores'}
      onClose={closeWindow}
      footer={<button className="btn btn-secondary" onClick={closeWindow}>Cerrar</button>}
    >
      <div style={{ padding: '10px', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <div className="search-wrap" style={{ flex: 1 }}>
          <i className="fas fa-search"></i>
          <input type="text" className="search-input" placeholder="Buscar por RIF o nombre..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditingSupplier(null); openWindow('agregarProveedor'); }}>
          <i className="fas fa-plus"></i>Agregar
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => openWindow('facturas')}>
          <i className="fas fa-file-invoice-dollar"></i>Facturas de Compra
        </button>
      </div>
      <div style={{ overflowY: 'auto', maxHeight: '450px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Razón Social</th>
              <th>RIF</th>
              <th>Cat.</th>
              <th>Teléfono</th>
              <th>Contacto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                <td style={{ fontFamily: 'monospace' }}>{p.rif || '--'}</td>
                <td><span className={`badge badge-${p.categoria}`}>{p.categoria}</span></td>
                <td>{p.telefono || '--'}</td>
                <td>{p.contacto || '--'}</td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(p)}><i className="fas fa-pen"></i></button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BaseWindow>
  );
}

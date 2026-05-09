
"use client";

import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { LogOut } from 'lucide-react';

export default function ClientsWindow() {
  const { state, setState, activeWindow, closeWindow, openWindow, setEditingClient, toast, lockModule } = usePOS();
  const [q, setQ] = useState('');

  const filtered = state.clientes.filter(c => 
    !q || c.nombre.toLowerCase().includes(q.toLowerCase()) || (c.placa || '').toLowerCase().includes(q.toLowerCase())
  );

  const handleEdit = (c: any) => {
    setEditingClient(c);
    openWindow('agregarCliente');
  };

  const handleDelete = (id: number) => {
    if (!confirm('¿Eliminar cliente?')) return;
    setState(prev => ({
      ...prev,
      clientes: prev.clientes.filter(c => c.id !== id)
    }));
    toast('Eliminado', 'info');
  };

  return (
    <BaseWindow 
      id="clientes" 
      title="Clientes" 
      icon="fa-users" 
      width="700px"
      isOpen={activeWindow === 'clientes'}
      onClose={closeWindow}
      footer={
        <div className="flex justify-between w-full">
          <button className="btn btn-danger btn-sm gap-2" onClick={() => lockModule('clientes')}>
            <LogOut size={14} /> SALIR Y BLOQUEAR
          </button>
          <button className="btn btn-secondary" onClick={closeWindow}>Cerrar</button>
        </div>
      }
    >
      <div style={{ padding: '10px', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <div className="search-wrap" style={{ flex: 1 }}>
          <i className="fas fa-search"></i>
          <input type="text" className="search-input" placeholder="Buscar cliente..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditingClient(null); openWindow('agregarCliente'); }}>
          <i className="fas fa-plus"></i>Agregar
        </button>
      </div>
      <div style={{ overflowY: 'auto', maxHeight: '450px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Vehículo</th>
              <th>Placa</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 500 }}>{c.nombre}</td>
                <td style={{ color: 'var(--muted)' }}>{c.telefono || '--'}</td>
                <td style={{ color: 'var(--muted)', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.vehiculo || '--'}</td>
                <td><span style={{ fontFamily: 'monospace', background: 'var(--bg)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>{c.placa || '--'}</span></td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(c)}><i className="fas fa-pen"></i></button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BaseWindow>
  );
}

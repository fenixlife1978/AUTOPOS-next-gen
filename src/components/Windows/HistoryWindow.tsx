
"use client";

import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { fmt, fechaISO } from '@/lib/posLogic';
import { Method } from '@/lib/types';

const METHOD_LABELS: Record<Method, string> = {
  efectivo_bs: 'Efec. Bs.',
  efectivo_usd: 'Efec. USD',
  pago_movil: 'P. Móvil',
  biopago: 'BioPago',
  transferencia: 'Transf.',
  tarjeta: 'Tarjeta',
  zelle: 'Zelle'
};

export default function HistoryWindow() {
  const { state, activeWindow, closeWindow } = usePOS();
  const [fechaFiltro, setFechaFiltro] = useState(fechaISO());
  const [q, setQ] = useState('');

  const filtered = state.ventas.filter(v => {
    const matchFecha = !fechaFiltro || v.fecha.startsWith(fechaFiltro);
    const matchQ = !q || (v.cliente?.nombre.toLowerCase().includes(q.toLowerCase())) || String(v.id).includes(q);
    return matchFecha && matchQ;
  }).reverse();

  return (
    <BaseWindow 
      id="historial" 
      title="Historial de Ventas" 
      icon="fa-clock-rotate-left" 
      width="780px"
      isOpen={activeWindow === 'historial'}
      onClose={closeWindow}
      footer={<button className="btn btn-secondary" onClick={closeWindow}>Cerrar</button>}
    >
      <div style={{ padding: '10px', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <input type="date" className="form-input" style={{ width: 'auto' }} value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)} />
        <div className="search-wrap" style={{ flex: 1, minWidth: '150px' }}>
          <i className="fas fa-search"></i>
          <input type="text" className="search-input" placeholder="Buscar por cliente o folio..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div style={{ overflowY: 'auto', maxHeight: '450px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>Sin ventas</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Método</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--muted)' }}>#{String(v.id).padStart(5, '0')}</td>
                  <td>{v.fechaStr}</td>
                  <td>{v.cliente ? v.cliente.nombre : 'General'}</td>
                  <td><span className={`badge badge-${v.metodo}`}>{METHOD_LABELS[v.metodo]}</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmt(v.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </BaseWindow>
  );
}

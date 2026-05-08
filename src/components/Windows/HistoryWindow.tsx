
"use client";

import React, { useState, useEffect } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { fmt, fechaISO } from '@/lib/posLogic';
import { Method, Sale } from '@/lib/types';
import { collection, query, orderBy, onSnapshot, where, limit } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const METHOD_LABELS: Record<Method, string> = {
  efectivo_bs: 'Efec. Bs.',
  efectivo_usd: 'Efec. USD',
  pago_movil: 'P. Móvil',
  biopago: 'BioPago',
  transferencia: 'Transf.',
  tarjeta: 'Tarjeta',
  zelle: 'Zelle',
  cheque: 'Cheque'
};

export default function HistoryWindow() {
  const { activeWindow, closeWindow, deleteSale } = usePOS();
  const [fechaFiltro, setFechaFiltro] = useState(fechaISO());
  const [q, setQ] = useState('');
  const [ventas, setVentas] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeWindow === 'historial') {
      const { firestore } = initializeFirebase();
      setLoading(true);
      const q = query(collection(firestore, 'ventas'), orderBy('created_at', 'desc'), limit(50));
      
      const unsub = onSnapshot(q, (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));
        setVentas(data);
        setLoading(false);
      });

      return () => unsub();
    }
  }, [activeWindow]);

  const filtered = ventas.filter(v => {
    const matchFecha = !fechaFiltro || v.fecha.startsWith(fechaFiltro);
    const matchQ = !q || (v.cliente?.nombre.toLowerCase().includes(q.toLowerCase())) || String(v.id).toLowerCase().includes(q.toLowerCase());
    return matchFecha && matchQ;
  });

  return (
    <BaseWindow 
      id="historial" 
      title="Historial de Ventas (Tiempo Real)" 
      icon="fa-clock-rotate-left" 
      width="850px"
      isOpen={activeWindow === 'historial'}
      onClose={closeWindow}
      footer={<button className="btn btn-secondary" onClick={closeWindow}>Cerrar</button>}
    >
      <div style={{ padding: '10px', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <input type="date" className="form-input" style={{ width: 'auto' }} value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)} />
        <div className="search-wrap" style={{ flex: 1, minWidth: '150px' }}>
          <i className="fas fa-search"></i>
          <input type="text" className="search-input" placeholder="Buscar por cliente o ID..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div style={{ overflowY: 'auto', maxHeight: '450px' }}>
        {loading ? (
          <div className="text-center p-10">Cargando ventas...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>Sin ventas registradas</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha/Hora</th>
                <th>Cliente</th>
                <th>Método</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--muted)', fontSize: '10px' }}>{v.id.substring(0, 8)}...</td>
                  <td>{v.fechaStr} {v.horaStr}</td>
                  <td>{v.cliente ? v.cliente.nombre : 'General'}</td>
                  <td><span className={`badge badge-${v.metodo}`}>{METHOD_LABELS[v.metodo]}</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmt(v.total)}</td>
                  <td>
                    <button className="text-red-400 hover:text-red-500 px-2" onClick={() => deleteSale(v.id)} title="Eliminar Venta">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </BaseWindow>
  );
}

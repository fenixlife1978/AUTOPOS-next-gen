
'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { usePOS } from '../POSContext';

interface Proveedor {
  id: string;
  nombre: string;
  rif: string;
  telefono?: string;
}

export function BuscadorInteligente({ onSelectProveedor }: { onSelectProveedor: (proveedor: Proveedor) => void }) {
  const { state } = usePOS();
  const [termino, setTermino] = useState('');
  const [filtros, setFiltros] = useState({
    tieneDeudas: false,
    comprasRecientes: false
  });

  const resultados = useMemo(() => {
    if (termino.length < 2 && !filtros.tieneDeudas && !filtros.comprasRecientes) return [];

    return state.proveedores.filter(p => {
      const matchesQ = !termino || 
        p.nombre.toLowerCase().includes(termino.toLowerCase()) || 
        (p.rif || '').toLowerCase().includes(termino.toLowerCase());
      
      if (!matchesQ) return false;

      const comprasProv = state.compras.filter(c => c.proveedorId === p.id);
      
      if (filtros.tieneDeudas) {
        const tieneDeuda = comprasProv.some(c => c.saldoPendiente > 0);
        if (!tieneDeuda) return false;
      }

      if (filtros.comprasRecientes) {
        const treintaDias = 30 * 24 * 60 * 60 * 1000;
        const hoy = new Date().getTime();
        const reciente = comprasProv.some(c => {
          const fecha = new Date(c.fechaEmision).getTime();
          return (hoy - fecha) <= treintaDias;
        });
        if (!reciente) return false;
      }

      return true;
    });
  }, [state.proveedores, state.compras, termino, filtros]);

  return (
    <div className="space-y-4">
      <div className="relative search-wrap">
        <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}></i>
        <input
          type="text"
          placeholder="Buscar proveedor por nombre o RIF..."
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          className="search-input w-full"
          style={{ paddingLeft: '36px' }}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFiltros({ ...filtros, tieneDeudas: !filtros.tieneDeudas })}
          className={`badge ${filtros.tieneDeudas ? 'badge-vencida' : 'badge-general'}`}
          style={{ cursor: 'pointer', border: 'none' }}
        >
          Deudas pendientes
        </button>
        <button
          onClick={() => setFiltros({ ...filtros, comprasRecientes: !filtros.comprasRecientes })}
          className={`badge ${filtros.comprasRecientes ? 'badge-pago_movil' : 'badge-general'}`}
          style={{ cursor: 'pointer', border: 'none' }}
        >
          Compras recientes (30d)
        </button>
      </div>

      {resultados.length > 0 && (
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginTop: '10px' }}>
          {resultados.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProveedor(p as any)}
              style={{ padding: '10px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
              className="hover:bg-[var(--bg4)]"
            >
              <div style={{ fontWeight: 600, fontSize: '13px' }}>{p.nombre}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>RIF: {p.rif}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

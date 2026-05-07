
"use client";

import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { fmt } from '@/lib/posLogic';
import { optimizedInventorySuggestions } from '@/ai/flows/optimized-inventory-suggestions-flow';

export default function InventoryWindow() {
  const { state, setState, activeWindow, closeWindow, openWindow, setEditingProduct, toast } = usePOS();
  const [q, setQ] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const filtered = state.productos.filter(p => 
    !q || p.nombre.toLowerCase().includes(q.toLowerCase()) || p.codigo.toLowerCase().includes(q.toLowerCase())
  );

  const handleEdit = (p: any) => {
    setEditingProduct(p);
    openWindow('agregarProducto');
  };

  const handleDelete = (id: number) => {
    if (!confirm('¿Eliminar producto?')) return;
    setState(prev => ({
      ...prev,
      productos: prev.productos.filter(p => p.id !== id)
    }));
    toast('Eliminado', 'info');
  };

  const handleAiSuggestions = async () => {
    setIsAiLoading(true);
    try {
      const suggestions = await optimizedInventorySuggestions({
        products: state.productos,
        sales: state.ventas
      });
      
      // We'll show a simple prompt with the suggestions for now as per requirements
      let msg = "Sugerencias de Reabastecimiento:\n";
      suggestions.reorderSuggestions.filter(s => s.suggestedReorderQuantity > 0).forEach(s => {
        msg += `- ${s.productName}: Reordenar ${s.suggestedReorderQuantity} (${s.reason})\n`;
      });
      
      if (suggestions.reorderSuggestions.filter(s => s.suggestedReorderQuantity > 0).length === 0) {
        msg = "No se requieren reabastecimientos según las ventas actuales.";
      }

      alert(msg);
    } catch (e) {
      toast('Error al generar sugerencias AI', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <BaseWindow 
      id="inventario" 
      title="Inventario" 
      icon="fa-boxes-stacked" 
      width="850px"
      isOpen={activeWindow === 'inventario'}
      onClose={closeWindow}
      footer={<button className="btn btn-secondary" onClick={closeWindow}>Cerrar</button>}
    >
      <div style={{ padding: '10px', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <div className="search-wrap" style={{ flex: 1 }}>
          <i className="fas fa-search"></i>
          <input type="text" className="search-input" placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditingProduct(null); openWindow('agregarProducto'); }}>
          <i className="fas fa-plus"></i>Agregar
        </button>
        <button className="btn btn-secondary btn-sm" onClick={handleAiSuggestions} disabled={isAiLoading}>
          <i className="fas fa-robot"></i> {isAiLoading ? 'Analizando...' : 'Sugerencias AI'}
        </button>
      </div>
      <div style={{ overflowY: 'auto', maxHeight: '450px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Cat.</th>
              <th>Costo</th>
              <th>%Gan</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acc.</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--muted)' }}>{p.codigo}</td>
                <td style={{ fontWeight: 500, maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nombre}</td>
                <td><span className={`badge badge-${p.categoria}`}>{p.categoria}</span></td>
                <td style={{ color: 'var(--muted)' }}>{fmt(p.costo)}</td>
                <td style={{ color: 'var(--muted)' }}>{p.porcentajeGanancia || 0}%</td>
                <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{fmt(p.precio)}</td>
                <td>{p.categoria === 'servicio' ? '--' : p.stock}</td>
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

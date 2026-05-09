
"use client";

import React, { useState } from 'react';
import { usePOS } from './POSContext';
import { Category } from '@/lib/types';
import { fmt } from '@/lib/posLogic';

const CATEGORIAS = [
  { id: 'todos', label: 'Todos', icon: 'fa-border-all' },
  { id: 'lubricante', label: 'Lubricantes', icon: 'fa-bottle-droplet' },
  { id: 'repuesto', label: 'Repuestos', icon: 'fa-gear' },
  { id: 'servicio', label: 'Servicios', icon: 'fa-wrench' }
];

export default function ProductsPanel() {
  const { state, addToCart } = usePOS();
  const [q, setQ] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<Category | 'todos'>('todos');

  const filteredProducts = state.productos.filter(p => {
    // Lógica de filtrado inteligente: 
    // Si seleccionamos "Repuestos", mostramos todo lo que NO sea lubricante o servicio
    let matchCat = categoriaFiltro === 'todos';
    if (!matchCat) {
      if (categoriaFiltro === 'repuesto') {
        const esExcluido = p.categoria === 'lubricante' || p.categoria === 'servicio';
        matchCat = !esExcluido;
      } else {
        matchCat = p.categoria === categoriaFiltro;
      }
    }

    const matchQ = !q || 
      p.nombre.toLowerCase().includes(q.toLowerCase()) || 
      p.codigo.toLowerCase().includes(q.toLowerCase()) ||
      (p.marca || '').toLowerCase().includes(q.toLowerCase());

    return matchCat && matchQ;
  });

  return (
    <div className="products-panel">
      <div className="search-bar">
        <div className="search-wrap">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscar por nombre, código o marca..." 
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      
      <div className="categories-bar">
        {CATEGORIAS.map((cat) => (
          <div 
            key={cat.id}
            className={`cat-btn ${categoriaFiltro === cat.id ? 'active' : ''}`} 
            onClick={() => setCategoriaFiltro(cat.id as Category | 'todos')}
          >
            <i className={`fas ${cat.icon}`} style={{ marginRight: '4px' }}></i>
            {cat.label}
          </div>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
            <i className="fas fa-box-open mb-2 block text-2xl opacity-20"></i>
            Sin resultados para esta categoría
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isService = p.categoria === 'servicio';
            const isLowStock = !isService && p.stock <= 5;
            const isOutOfStock = !isService && p.stock <= 0;
            const stockText = isService ? 'Servicio' : (isOutOfStock ? 'Agotado' : `Stock: ${p.stock}`);

            return (
              <div 
                key={p.id} 
                className="prod-card" 
                onClick={() => addToCart(p.id)}
                style={isOutOfStock ? { opacity: 0.4, pointerEvents: 'none' } : {}}
              >
                <div className="prod-icon">
                  <i className={`fas ${p.icon || 'fa-box'}`}></i>
                </div>
                <div className="prod-name">{p.nombre}</div>
                <div className="prod-price">{p.precio === 0 ? 'Gratis' : fmt(p.precio)}</div>
                <div className={`prod-stock ${isLowStock ? 'low' : ''}`}>{stockText}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

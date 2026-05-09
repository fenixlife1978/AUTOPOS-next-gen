
"use client";

import React, { useState, useMemo } from 'react';
import { usePOS } from './POSContext';
import { Category } from '@/lib/types';
import { fmt } from '@/lib/posLogic';

// Mapa de iconos y etiquetas para categorías conocidas
const CATEGORY_CONFIG: Record<string, { label: string; icon: string }> = {
  todos: { label: 'Todos', icon: 'fa-border-all' },
  lubricante: { label: 'Lubricantes', icon: 'fa-bottle-droplet' },
  repuesto: { label: 'Repuestos', icon: 'fa-gear' },
  servicio: { label: 'Servicios', icon: 'fa-wrench' },
  motor: { label: 'Motor', icon: 'fa-cog' },
  transmision: { label: 'Transmisión', icon: 'fa-circle-dot' },
  frenos: { label: 'Frenos', icon: 'fa-disc-brake' },
  suspension: { label: 'Suspensión', icon: 'fa-arrows-up-down' },
  electrico: { label: 'Eléctrico', icon: 'fa-bolt' },
  refrigeracion: { label: 'Refrigeración', icon: 'fa-snowflake' },
  general: { label: 'General', icon: 'fa-box' }
};

export default function ProductsPanel() {
  const { state, addToCart } = usePOS();
  const [q, setQ] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');

  // Generamos dinámicamente las categorías basadas en los productos existentes
  const dynamicCategories = useMemo(() => {
    const catsInInventory = new Set<string>();
    state.productos.forEach(p => {
      if (p.categoria) catsInInventory.add(p.categoria);
    });

    const items = [{ id: 'todos', label: 'Todos', icon: 'fa-border-all' }];
    
    // Ordenamos y agregamos las categorías encontradas
    Array.from(catsInInventory).sort().forEach(catId => {
      const config = CATEGORY_CONFIG[catId] || { 
        label: catId.charAt(0).toUpperCase() + catId.slice(1), 
        icon: 'fa-box' 
      };
      items.push({ id: catId, ...config });
    });

    return items;
  }, [state.productos]);

  const filteredProducts = state.productos.filter(p => {
    // Coincidencia exacta de categoría o "todos"
    const matchCat = categoriaFiltro === 'todos' || p.categoria === categoriaFiltro;

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
        {dynamicCategories.map((cat) => (
          <div 
            key={cat.id}
            className={`cat-btn ${categoriaFiltro === cat.id ? 'active' : ''}`} 
            onClick={() => setCategoriaFiltro(cat.id)}
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
            {state.productos.length === 0 
              ? 'No hay productos en inventario. Crea uno en Inventario (F6)' 
              : 'Sin resultados para esta búsqueda/categoría'}
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
                <div className="prod-name" title={p.nombre}>{p.nombre}</div>
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

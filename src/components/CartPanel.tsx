
"use client";

import React from 'react';
import { usePOS } from './POSContext';
import { fmt } from '@/lib/posLogic';

export default function CartPanel() {
  const { 
    state, setState, 
    updateCartQty, removeFromCart, clearCart, openWindow, 
    isCartMobileOpen 
  } = usePOS();

  const cartItems = state.carrito.map(c => {
    const p = state.productos.find(pr => pr.id === c.prodId);
    return p ? { ...p, cantidad: c.cantidad, subtotal: p.precio * c.cantidad } : null;
  }).filter(Boolean);

  const subtotal = cartItems.reduce((s, i) => s + (i?.subtotal || 0), 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  const totalItemsCount = cartItems.reduce((s, i) => s + (i?.cantidad || 0), 0);

  return (
    <div className={`cart-panel ${isCartMobileOpen ? 'mobile-open' : ''}`}>
      <div className="cart-header">
        <h3><i className="fas fa-cart-shopping" style={{ color: 'var(--accent)', marginRight: '6px' }}></i>Venta Actual</h3>
        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{totalItemsCount} items</span>
      </div>

      <div className="cart-items">
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <i className="fas fa-cart-shopping"></i>
            <span>Agrega productos al carrito</span>
          </div>
        ) : (
          cartItems.map((item) => item && (
            <div key={item.id} className="cart-item">
              <div className="cart-item-info">
                <div className="cart-item-name">{item.nombre}</div>
                <div className="cart-item-unit">{fmt(item.precio)} / {item.unidad}</div>
              </div>
              <div className="cart-qty">
                <button onClick={() => updateCartQty(item.id, -1)}><i className="fas fa-minus" style={{ fontSize: '10px' }}></i></button>
                <span>{item.cantidad}</span>
                <button onClick={() => updateCartQty(item.id, 1)}><i className="fas fa-plus" style={{ fontSize: '10px' }}></i></button>
              </div>
              <div className="cart-item-sub">{fmt(item.subtotal)}</div>
              <button className="cart-item-del" onClick={() => removeFromCart(item.id)}><i className="fas fa-xmark"></i></button>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="cart-footer">
          <select 
            className="cart-client-select" 
            value={state.clienteActual}
            onChange={(e) => setState(prev => ({ ...prev, clienteActual: e.target.value }))}
          >
            <option value="">Cliente general</option>
            {state.clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre} {c.vehiculo ? `- ${c.vehiculo}` : ''}</option>
            ))}
          </select>

          <div className="cart-totals">
            <div className="cart-total-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="cart-total-row"><span>IVA (16%)</span><span>{fmt(iva)}</span></div>
            <div className="cart-total-row grand"><span>Total</span><span>{fmt(total)}</span></div>
          </div>

          <div className="cart-actions">
            <button className="btn-clear" onClick={clearCart}><i className="fas fa-trash"></i></button>
            <button className="btn-cobrar" onClick={() => openWindow('cobrar')}><i className="fas fa-cash-register"></i>Cobrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

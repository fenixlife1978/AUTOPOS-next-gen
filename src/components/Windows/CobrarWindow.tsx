
"use client";

import React, { useState, useEffect } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { fmt, fechaStr, horaStr } from '@/lib/posLogic';
import { Method, Sale, SaleItem } from '@/lib/types';

export default function CobrarWindow() {
  const { state, setState, activeWindow, closeWindow, openWindow, setCurrentSaleForTicket, toast } = usePOS();
  const [metodo, setMetodo] = useState<Method>('efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [nota, setNota] = useState('');

  const cartItems = state.carrito.map(c => {
    const p = state.productos.find(pr => pr.id === c.prodId);
    return p ? { ...p, cantidad: c.cantidad, subtotal: p.precio * c.cantidad } : null;
  }).filter(Boolean);

  const subtotal = cartItems.reduce((s, i) => s + (i?.subtotal || 0), 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const recibidoNum = parseFloat(montoRecibido) || 0;
  const cambio = Math.max(0, recibidoNum - total);
  const canProcess = metodo !== 'efectivo' || recibidoNum >= total;

  const numpadInput = (val: string) => {
    if (val === 'del') setMontoRecibido(prev => prev.slice(0, -1));
    else if (val === 'exact') setMontoRecibido(total.toFixed(2));
    else if (val === '.' && montoRecibido.indexOf('.') === -1) setMontoRecibido(prev => prev + '.');
    else {
      if (montoRecibido.indexOf('.') !== -1 && montoRecibido.split('.')[1].length >= 2) return;
      setMontoRecibido(prev => prev + val);
    }
  };

  const handleProcess = () => {
    if (!cartItems.length) return;
    
    // Update stocks
    setState(prev => {
      const newProductos = prev.productos.map(p => {
        const itemInCart = cartItems.find(i => i?.id === p.id);
        if (itemInCart && p.categoria !== 'servicio') {
          return { ...p, stock: Math.max(0, p.stock - itemInCart.cantidad) };
        }
        return p;
      });

      const cliObj = prev.clienteActual ? prev.clientes.find(c => String(c.id) === String(prev.clienteActual)) : null;
      const venta: Sale = {
        id: prev.nextVentaId,
        fecha: new Date().toISOString(),
        fechaStr: fechaStr(),
        horaStr: horaStr(),
        cliente: cliObj || null,
        clienteId: prev.clienteActual ? parseInt(prev.clienteActual) : null,
        items: cartItems.map(i => ({
          id: i!.id,
          nombre: i!.nombre,
          cantidad: i!.cantidad,
          precio: i!.precio,
          subtotal: i!.subtotal,
          unidad: i!.unidad,
          categoria: i!.categoria
        })),
        subtotal,
        iva,
        total,
        metodo,
        recibido: metodo === 'efectivo' ? recibidoNum : total,
        cambio: metodo === 'efectivo' ? cambio : 0,
        nota
      };

      setCurrentSaleForTicket(venta);
      return {
        ...prev,
        productos: newProductos,
        ventas: [...prev.ventas, venta],
        nextVentaId: prev.nextVentaId + 1,
        carrito: [],
        clienteActual: ''
      };
    });

    closeWindow();
    openWindow('ticket');
    toast('Venta procesada', 'success');
  };

  return (
    <BaseWindow 
      id="cobrar" 
      title="Cobrar" 
      icon="fa-cash-register" 
      isOpen={activeWindow === 'cobrar'}
      onClose={closeWindow}
      footer={
        <>
          <button className="btn btn-secondary" onClick={closeWindow}>Cancelar</button>
          <button className="btn btn-success" disabled={!canProcess} onClick={handleProcess}>
            <i className="fas fa-check"></i>Procesar Pago
          </button>
        </>
      }
    >
      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
        <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total a cobrar</div>
        <div style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'Space Grotesk', color: 'var(--accent)' }}>{fmt(total)}</div>
      </div>
      
      <div className="form-group">
        <label className="form-label">Metodo de pago</label>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className={`btn ${metodo === 'efectivo' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMetodo('efectivo')}><i className="fas fa-money-bill"></i> Efectivo</button>
          <button className={`btn ${metodo === 'tarjeta' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMetodo('tarjeta')}><i className="fas fa-credit-card"></i> Tarjeta</button>
          <button className={`btn ${metodo === 'transferencia' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMetodo('transferencia')}><i className="fas fa-building-columns"></i> Transfer.</button>
        </div>
      </div>

      {metodo === 'efectivo' && (
        <div id="efectivoPanel">
          <div className="form-group">
            <label className="form-label">Monto recibido</label>
            <input 
              type="text" 
              className="form-input" 
              value={montoRecibido}
              style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Space Grotesk', textAlign: 'center' }}
              readOnly
              placeholder="$0.00" 
            />
          </div>
          <div className="numpad" style={{ marginBottom: '12px' }}>
            {['7','8','9','4','5','6','1','2','3','0','00','.'].map(v => (
              <button key={v} onClick={() => numpadInput(v)}>{v}</button>
            ))}
            <button onClick={() => numpadInput('del')} style={{ gridColumn: 'span 2' }}><i className="fas fa-delete-left"></i></button>
            <button className="accent" onClick={() => numpadInput('exact')}>Exacto</button>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', background: 'var(--bg)', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Cambio</div>
            <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Space Grotesk', color: cambio > 0 ? 'var(--success)' : 'var(--fg)' }}>{fmt(cambio)}</div>
          </div>
        </div>
      )}

      <div className="form-group" style={{ marginTop: '10px' }}>
        <label className="form-label">Nota (opcional)</label>
        <input type="text" className="form-input" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Referencia..." />
      </div>
    </BaseWindow>
  );
}

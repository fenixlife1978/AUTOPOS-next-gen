
"use client";

import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { fmt, fechaStr, horaStr } from '@/lib/posLogic';
import { Method, Sale } from '@/lib/types';

const PAYMENT_METHODS: { id: Method; label: string; icon: string }[] = [
  { id: 'efectivo_bs', label: 'Efectivo Bs.', icon: 'fa-money-bill-1' },
  { id: 'pago_movil', label: 'Pago Móvil', icon: 'fa-mobile-screen-button' },
  { id: 'biopago', label: 'BioPago', icon: 'fa-fingerprint' },
  { id: 'transferencia', label: 'Transferencia', icon: 'fa-building-columns' },
  { id: 'efectivo_usd', label: 'Efectivo USD', icon: 'fa-dollar-sign' },
  { id: 'tarjeta', label: 'Tarjeta', icon: 'fa-credit-card' },
  { id: 'zelle', label: 'Zelle', icon: 'fa-z' },
];

export default function CobrarWindow() {
  const { state, setState, activeWindow, closeWindow, openWindow, setCurrentSaleForTicket, toast } = usePOS();
  const [metodo, setMetodo] = useState<Method>('efectivo_bs');
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
  
  // Show numpad only for cash methods
  const isCash = metodo === 'efectivo_bs' || metodo === 'efectivo_usd';
  const canProcess = !isCash || recibidoNum >= total;

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
        recibido: isCash ? recibidoNum : total,
        cambio: isCash ? cambio : 0,
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
      width="480px"
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
        <label className="form-label">Método de pago</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {PAYMENT_METHODS.map((m) => (
            <button 
              key={m.id}
              className={`btn ${metodo === m.id ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => {
                setMetodo(m.id);
                if (m.id !== 'efectivo_bs' && m.id !== 'efectivo_usd') setMontoRecibido('');
              }}
              style={{ justifyContent: 'flex-start' }}
            >
              <i className={`fas ${m.icon}`} style={{ width: '16px' }}></i> {m.label}
            </button>
          ))}
        </div>
      </div>

      {isCash && (
        <div id="efectivoPanel" style={{ marginTop: '16px', padding: '12px', background: 'var(--bg3)', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div className="form-group">
            <label className="form-label">Monto recibido ({metodo === 'efectivo_bs' ? 'Bs.' : '$'})</label>
            <input 
              type="text" 
              className="form-input" 
              value={montoRecibido}
              style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Space Grotesk', textAlign: 'center', background: 'var(--bg)' }}
              readOnly
              placeholder="0.00" 
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

      <div className="form-group" style={{ marginTop: '16px' }}>
        <label className="form-label">Nota / Referencia (opcional)</label>
        <input type="text" className="form-input" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej. Número de confirmación..." />
      </div>
    </BaseWindow>
  );
}

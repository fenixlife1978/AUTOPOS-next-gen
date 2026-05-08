
"use client";

import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { fmt } from '@/lib/posLogic';
import { Method } from '@/lib/types';

export default function AccountsPayableWindow() {
  const { state, setState, activeWindow, closeWindow, toast } = usePOS();
  const [abonoModal, setAbonoModal] = useState<{ open: boolean; facturaId: string | null }>({ open: false, facturaId: null });
  const [montoAbono, setMontoAbono] = useState('');
  const [metodoPago, setMetodoPago] = useState<Method>('efectivo_bs');

  const deudas = state.compras.filter(i => i.saldoPendiente > 0);
  const totalDeuda = deudas.reduce((s, i) => s + i.saldoPendiente, 0);

  const registrarAbono = () => {
    if (!abonoModal.facturaId || !montoAbono) return;
    const monto = parseFloat(montoAbono);
    const factId = abonoModal.facturaId;

    setState(prev => {
      const factura = prev.compras.find(f => f.id === factId);
      if (!factura) return prev;

      const nuevoTotalPagado = factura.totalPagado + monto;
      const nuevoSaldo = Math.max(0, factura.saldoPendiente - monto);
      const nuevoEstado = nuevoSaldo <= 0 ? 'pagada' : 'parcial';

      const nuevoAbono = {
        id: Math.random().toString(36).substring(2, 9),
        facturaId: factId,
        montoBolivares: monto,
        fechaAbono: new Date().toISOString(),
        metodoPago: metodoPago
      };

      return {
        ...prev,
        compras: prev.compras.map(f => f.id === factId ? { ...f, totalPagado: nuevoTotalPagado, saldoPendiente: nuevoSaldo, estadoPago: nuevoEstado as any } : f),
        abonos: [...prev.abonos, nuevoAbono],
      };
    });

    toast('Abono registrado', 'success');
    setAbonoModal({ open: false, facturaId: null });
    setMontoAbono('');
  };

  return (
    <BaseWindow 
      id="cuentas" 
      title="Cuentas por Pagar (CxP)" 
      icon="fa-hand-holding-dollar" 
      width="750px"
      isOpen={activeWindow === 'cuentas'}
      onClose={closeWindow}
      footer={<button className="btn btn-secondary" onClick={closeWindow}>Cerrar</button>}
    >
      <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', padding: '20px', borderRadius: '10px', marginBottom: '20px', color: '#fff' }}>
        <div style={{ fontSize: '13px', opacity: 0.8 }}>Total por Pagar</div>
        <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>{fmt(totalDeuda)}</div>
      </div>

      <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
        {deudas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No hay deudas pendientes</div>
        ) : (
          deudas.map(i => {
            const prov = state.proveedores.find(p => p.id === i.proveedorId);
            const historial = state.abonos.filter(a => a.facturaId === i.id);

            return (
              <div key={i.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{prov?.nombre}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Factura: {i.numeroFactura} | Vence: {i.fechaVencimiento ? new Date(i.fechaVencimiento).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--danger)', fontWeight: 800, fontSize: '18px' }}>{fmt(i.saldoPendiente)}</div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Total: {fmt(i.montoBolivares)}</div>
                  </div>
                </div>
                
                {historial.length > 0 && (
                  <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '8px', marginTop: '8px', fontSize: '11px' }}>
                    <div style={{ color: 'var(--muted)', marginBottom: '4px' }}>Historial de abonos:</div>
                    {historial.map(a => (
                      <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                        <span>{new Date(a.fechaAbono).toLocaleDateString()} ({a.metodoPago})</span>
                        <span>{fmt(a.montoBolivares)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ textAlign: 'right', marginTop: '10px' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setAbonoModal({ open: true, facturaId: i.id })}>
                    <i className="fas fa-plus"></i>Abonar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {abonoModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg2)', padding: '20px', borderRadius: '12px', width: '320px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>Registrar Abono</h3>
            <div className="form-group">
              <label className="form-label">Monto Bs.</label>
              <input type="number" className="form-input" value={montoAbono} onChange={e => setMontoAbono(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Método</label>
              <select className="form-select" value={metodoPago} onChange={e => setMetodoPago(e.target.value as Method)}>
                <option value="efectivo_bs">Efectivo Bs.</option>
                <option value="pago_movil">Pago Móvil</option>
                <option value="biopago">BioPago</option>
                <option value="transferencia">Transferencia</option>
                <option value="efectivo_usd">Efectivo USD</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="zelle">Zelle</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setAbonoModal({ open: false, facturaId: null })}>Cerrar</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={registrarAbono}>Abonar</button>
            </div>
          </div>
        </div>
      )}
    </BaseWindow>
  );
}

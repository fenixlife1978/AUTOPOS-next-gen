
"use client";

import React, { useState, useMemo } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { fmt, getAgingCategory } from '@/lib/posLogic';
import { Method, Moneda } from '@/lib/types';

export default function AccountsPayableWindow() {
  const { state, registrarAbono, activeWindow, closeWindow, getTasaActual } = usePOS();
  const [abonoModal, setAbonoModal] = useState<{ open: boolean; facturaId: number | null }>({ open: false, facturaId: null });
  const [montoAbono, setMontoAbono] = useState('');
  const [monedaAbono, setMonedaAbono] = useState<Moneda>('VES');
  const [metodoPago, setMetodoPago] = useState<Method>('efectivo_bs');
  const [tasaManual, setTasaManual] = useState('');

  const deudas = useMemo(() => state.compras.filter(i => i.saldo_pendiente_original > 0), [state.compras]);
  const totalVES = useMemo(() => deudas.reduce((s, i) => s + i.saldo_pendiente_ves, 0), [deudas]);
  const tasaActualUSD = getTasaActual('USD');
  const totalUSD_Equiv = totalVES / tasaActualUSD;

  const handleAbonar = () => {
    if (abonoModal.facturaId === null || !montoAbono) return;
    
    registrarAbono({
      facturaId: abonoModal.facturaId,
      montoOriginal: parseFloat(montoAbono),
      monedaAbono,
      metodo: metodoPago,
      tasa: tasaManual ? parseFloat(tasaManual) : undefined
    });

    setAbonoModal({ open: false, facturaId: null });
    setMontoAbono('');
    setTasaManual('');
  };

  return (
    <BaseWindow 
      id="cuentas" 
      title="Dashboard de Cuentas por Pagar (CxP)" 
      icon="fa-hand-holding-dollar" 
      width="850px"
      isOpen={activeWindow === 'cuentas'}
      onClose={closeWindow}
      footer={<button className="btn btn-secondary" onClick={closeWindow}>Cerrar</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', padding: '15px', borderRadius: '12px', color: '#fff' }}>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Total Deuda (Bolívares)</div>
          <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>{fmt(totalVES, 'VES')}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)', padding: '15px', borderRadius: '12px', color: '#fff' }}>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Equiv. USD (Tasa Actual: {tasaActualUSD})</div>
          <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>{fmt(totalUSD_Equiv, 'USD')}</div>
        </div>
      </div>

      <div style={{ spaceY: '10px' }}>
        {deudas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No hay deudas activas</div>
        ) : (
          deudas.map(f => {
            const prov = state.proveedores.find(p => p.id === f.proveedorId);
            const aging = f.fechaVencimiento ? getAgingCategory(f.fechaVencimiento) : 'N/A';
            const abonos = state.abonos.filter(a => a.facturaId === f.id);

            return (
              <div key={f.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '15px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--accent)' }}>{prov?.nombre}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Factura: {f.numeroFactura} | Vence: {f.fechaVencimiento ? new Date(f.fechaVencimiento).toLocaleDateString() : 'Inmediato'}</div>
                    <div style={{ marginTop: '4px' }}>
                      <span className={`badge ${aging === 'Vigente' ? 'badge-pagada' : 'badge-vencida'}`} style={{ fontSize: '10px' }}>{aging}</span>
                      <span className="badge badge-general" style={{ marginLeft: '5px', fontSize: '10px' }}>{f.moneda_original}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444' }}>{fmt(f.saldo_pendiente_original, f.moneda_original)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>VES: {fmt(f.saldo_pendiente_ves, 'VES')}</div>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: '8px' }} onClick={() => setAbonoModal({ open: true, facturaId: f.id })}>
                      <i className="fas fa-plus"></i>Abonar
                    </button>
                  </div>
                </div>

                {abonos.length > 0 && (
                  <div style={{ marginTop: '12px', borderTop: '1px dashed var(--border)', paddingTop: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '5px' }}>Historial de Abonos:</div>
                    <table style={{ width: '100%', fontSize: '11px' }}>
                      <tbody>
                        {abonos.map(a => (
                          <tr key={a.id}>
                            <td style={{ padding: '2px 0' }}>{new Date(a.fechaAbono).toLocaleDateString()}</td>
                            <td>{a.metodoPago}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(a.monto_original, a.moneda_abono)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {abonoModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg2)', padding: '20px', borderRadius: '12px', width: '350px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '16px', fontWeight: 700, fontFamily: 'Space Grotesk' }}>Registrar Abono</h3>
            
            <div className="form-group">
              <label className="form-label">Monto</label>
              <div style={{ display: 'flex', gap: '5px' }}>
                <select className="form-select" style={{ width: '80px' }} value={monedaAbono} onChange={e => setMonedaAbono(e.target.value as Moneda)}>
                  <option value="VES">VES</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
                <input type="number" className="form-input" value={montoAbono} onChange={e => setMontoAbono(e.target.value)} placeholder="0.00" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tasa de Cambio (opcional)</label>
              <input type="number" className="form-input" value={tasaManual} onChange={e => setTasaManual(e.target.value)} placeholder="Usar actual si vacío" />
            </div>

            <div className="form-group">
              <label className="form-label">Método</label>
              <select className="form-select" value={metodoPago} onChange={e => setMetodoPago(e.target.value as Method)}>
                <option value="efectivo_bs">Efectivo Bs.</option>
                <option value="pago_movil">Pago Móvil</option>
                <option value="biopago">BioPago</option>
                <option value="transferencia">Transferencia</option>
                <option value="efectivo_usd">Efectivo USD</option>
                <option value="zelle">Zelle</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setAbonoModal({ open: false, facturaId: null })}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAbonar}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </BaseWindow>
  );
}

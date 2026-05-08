
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { fmt } from '@/lib/posLogic';
import { SalesInvoice, Moneda, Method } from '@/lib/types';
import { registrarCobro, obtenerUltimaTasa } from '@/lib/firebase/cxc';

export default function CollectionsWindow() {
  const { state, activeWindow, closeWindow, toast } = usePOS();
  const [loading, setLoading] = useState(false);
  const [facturas, setFacturas] = useState<SalesInvoice[]>([]);
  const [selectedFactura, setSelectedFactura] = useState<SalesInvoice | null>(null);
  const [showCobroModal, setShowCobroModal] = useState(false);
  
  const [monto, setMonto] = useState('');
  const [moneda, setMoneda] = useState<Moneda>('USD');
  const [metodo, setMetodo] = useState<Method>('efectivo_usd');
  const [tasa, setTasa] = useState('');

  useEffect(() => {
    if (activeWindow === 'cobranzas') {
      fetchFacturas();
    }
  }, [activeWindow]);

  const fetchFacturas = async () => {
    setLoading(true);
    try {
      const { firestore } = initializeFirebase();
      const q = query(
        collection(firestore, 'facturas_venta'),
        where('estado', 'in', ['PENDIENTE', 'PARCIAL', 'VENCIDO']),
        orderBy('fechaEmision', 'desc')
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SalesInvoice[];
      setFacturas(data);
    } catch (e) {
      console.error(e);
      toast('Error al cargar facturas', 'error');
    }
    setLoading(false);
  };

  const handleOpenCobro = async (f: SalesInvoice) => {
    setSelectedFactura(f);
    setMonto(f.saldoPendienteOriginal?.toString() || '');
    setMoneda(f.monedaOriginal);
    
    const tData = await obtenerUltimaTasa(f.monedaOriginal);
    if (tData) setTasa(tData.tasa.toString());
    
    setShowCobroModal(true);
  };

  const procesarPago = async () => {
    if (!selectedFactura || !monto || !tasa) return;
    
    setLoading(true);
    try {
      await registrarCobro({
        factura: selectedFactura,
        montoCobroOriginal: parseFloat(monto),
        monedaCobro: moneda,
        tasaCobroDia: parseFloat(tasa),
        metodoPago: metodo,
        fecha: new Date()
      });
      toast('Cobro registrado exitosamente', 'success');
      setShowCobroModal(false);
      fetchFacturas();
    } catch (e: any) {
      toast(e.message || 'Error al procesar cobro', 'error');
    }
    setLoading(false);
  };

  const totalVes = useMemo(() => facturas.reduce((s, f) => s + (f.saldoPendienteVes || 0), 0), [facturas]);

  return (
    <BaseWindow 
      id="cobranzas" 
      title="Gestión de Cobranzas" 
      icon="fa-hand-holding-dollar" 
      width="900px"
      isOpen={activeWindow === 'cobranzas'}
      onClose={closeWindow}
      footer={<button className="btn btn-secondary" onClick={closeWindow}>Cerrar</button>}
    >
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30">
          <p className="text-xs text-blue-400 uppercase font-bold mb-1">Total Cuentas por Cobrar (VES)</p>
          <p className="text-3xl font-black text-white font-headline">{fmt(totalVes, 'VES')}</p>
        </div>
        <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30">
          <p className="text-xs text-emerald-400 uppercase font-bold mb-1">Equivalente USD (Estimado)</p>
          <p className="text-3xl font-black text-white font-headline">{fmt(totalVes / 45, 'USD')}</p>
        </div>
      </div>

      <div className="bg-[var(--bg3)] rounded-lg overflow-hidden border border-[var(--border)]">
        <table className="data-table">
          <thead>
            <tr>
              <th>N° Factura</th>
              <th>Cliente</th>
              <th>Vencimiento</th>
              <th>Monto Orig.</th>
              <th>Saldo Pend.</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center p-10">Cargando cobranzas...</td></tr>
            ) : facturas.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-10 text-muted">No hay cuentas pendientes</td></tr>
            ) : facturas.map(f => (
              <tr key={f.id}>
                <td className="font-mono">{f.numeroFactura}</td>
                <td>{state.clientes.find(c => c.id === f.clienteId)?.nombre || 'Cliente'}</td>
                <td className={new Date() > (f.fechaVencimiento?.toDate?.() || new Date()) ? 'text-red-400 font-bold' : ''}>
                  {f.fechaVencimiento?.toDate?.()?.toLocaleDateString() || 'N/A'}
                </td>
                <td>{fmt(f.montoOriginal, f.monedaOriginal)}</td>
                <td className="text-[var(--accent)] font-bold">{fmt(f.saldoPendienteOriginal, f.monedaOriginal)}</td>
                <td><span className={`badge badge-${f.estado?.toLowerCase()}`}>{f.estado}</span></td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={() => handleOpenCobro(f)}>Cobrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCobroModal && selectedFactura && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[var(--border)] bg-[var(--bg3)] flex justify-between items-center">
              <h3 className="font-bold font-headline">Registrar Cobro - {selectedFactura.numeroFactura}</h3>
              <button onClick={() => setShowCobroModal(false)} className="text-muted"><i className="fas fa-times"></i></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-[var(--bg)] p-4 rounded-lg text-center">
                <p className="text-xs text-muted mb-1">Saldo Pendiente</p>
                <p className="text-2xl font-bold text-[var(--accent)]">{fmt(selectedFactura.saldoPendienteOriginal, selectedFactura.monedaOriginal)}</p>
              </div>

              <div className="form-group">
                <label className="form-label">Monto a Cobrar</label>
                <div className="flex gap-2">
                  <select className="form-select w-24" value={moneda} onChange={e => setMoneda(e.target.value as Moneda)}>
                    <option value="VES">VES</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <input type="number" className="form-input flex-1" value={monto} onChange={e => setMonto(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tasa de Cambio (VES)</label>
                <input type="number" className="form-input" value={tasa} onChange={e => setTasa(e.target.value)} placeholder="Tasa del día" />
              </div>

              <div className="form-group">
                <label className="form-label">Método de Pago</label>
                <select className="form-select" value={metodo} onChange={e => setMetodo(e.target.value as Method)}>
                  <option value="efectivo_usd">Efectivo USD</option>
                  <option value="efectivo_bs">Efectivo Bs.</option>
                  <option value="pago_movil">Pago Móvil</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="zelle">Zelle</option>
                  <option value="biopago">BioPago</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button className="btn btn-secondary flex-1" onClick={() => setShowCobroModal(false)}>Cancelar</button>
                <button className="btn btn-success flex-1" onClick={procesarPago} disabled={loading}>
                  {loading ? 'Procesando...' : 'Confirmar Cobro'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </BaseWindow>
  );
}

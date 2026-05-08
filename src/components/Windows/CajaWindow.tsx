
"use client";

import React, { useState, useMemo } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { fmt } from '@/lib/posLogic';
import { Monitor, Unlock, Lock, Calculator, Printer, Receipt, FileText } from 'lucide-react';

export default function CajaWindow() {
  const { state, openBox, closeBox, activeWindow, closeWindow, toast } = usePOS();
  const [montoApertura, setMontoApertura] = useState('');

  const sessionSales = useMemo(() => {
    if (!state.boxSession) return [];
    return state.ventas.filter(v => v.boxSessionId === state.boxSession?.id);
  }, [state.ventas, state.boxSession]);

  const stats = useMemo(() => {
    const methods = {
      efectivo_bs: 0,
      pago_movil: 0,
      biopago: 0,
      transferencia: 0,
      tarjeta: 0,
      efectivo_usd: 0,
      zelle: 0,
      totalVES: 0,
      totalUSD: 0
    };

    sessionSales.forEach(v => {
      // Clasificación de totales
      const vesMethods = ['efectivo_bs', 'pago_movil', 'biopago', 'transferencia', 'tarjeta'];
      const usdMethods = ['efectivo_usd', 'zelle'];

      if (v.metodo in methods) {
        (methods as any)[v.metodo] += v.total;
      }

      if (vesMethods.includes(v.metodo)) {
        methods.totalVES += v.total;
      } else if (usdMethods.includes(v.metodo)) {
        methods.totalUSD += v.total;
      }
    });

    return methods;
  }, [sessionSales]);

  const handleOpen = () => {
    const monto = parseFloat(montoApertura) || 0;
    openBox(monto);
  };

  const handleClose = () => {
    if (confirm('¿Está seguro de cerrar el turno de caja? Se generará el resumen final.')) {
      closeBox();
      toast('Caja cerrada con éxito. El reporte final está listo.', 'success');
    }
  };

  const isClosed = state.boxSession?.estado === 'cerrada';

  return (
    <BaseWindow 
      id="caja" 
      title="Control de Caja (Turnos)" 
      icon="fa-desktop" 
      width="500px"
      isOpen={activeWindow === 'caja'}
      onClose={closeWindow}
      footer={<button className="btn btn-secondary" onClick={closeWindow}>Cerrar</button>}
    >
      {!state.boxSession ? (
        <div className="flex flex-col items-center p-6 text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
            <Lock size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Caja Cerrada</h3>
          <p className="text-xs text-muted mb-6">Inicie un nuevo turno para comenzar a procesar ventas.</p>
          
          <div className="w-full bg-[var(--bg3)] p-6 rounded-xl border border-[var(--border)] shadow-inner">
            <div className="form-group text-left">
              <label className="form-label">Fondo de Apertura (VES)</label>
              <input 
                type="number" 
                className="form-input text-xl font-bold text-center" 
                value={montoApertura} 
                onChange={e => setMontoApertura(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
            </div>
            <button className="btn btn-primary w-full mt-4 h-12 gap-2" onClick={handleOpen}>
              <Unlock size={18} /> ABRIR CAJA AHORA
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`${isClosed ? 'bg-red-500/10 border-red-500/30' : 'bg-success/10 border-success/30'} border p-4 rounded-xl flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${isClosed ? 'bg-red-500/20 text-red-500' : 'bg-success/20 text-success'} rounded-full flex items-center justify-center`}>
                {isClosed ? <Lock size={20} /> : <Unlock size={20} />}
              </div>
              <div>
                <p className={`text-[10px] ${isClosed ? 'text-red-500' : 'text-success'} font-bold uppercase tracking-tighter`}>
                  {isClosed ? 'Turno Cerrado' : 'Turno Activo'}
                </p>
                <p className="text-xs font-mono">
                  {isClosed ? `Cerrado: ${new Date(state.boxSession.fechaCierre!).toLocaleString()}` : `Desde: ${new Date(state.boxSession.fechaApertura).toLocaleString()}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted">Apertura</p>
              <p className={`font-bold ${isClosed ? 'text-red-500' : 'text-success'}`}>{fmt(state.boxSession.montoAperturaVES, 'VES')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--bg3)] p-4 rounded-xl border border-[var(--border)]">
              <p className="text-[10px] text-muted uppercase font-bold mb-1">Total Ventas Bs.</p>
              <p className="text-2xl font-black text-[var(--accent)]">{fmt(stats.totalVES, 'VES')}</p>
            </div>
            <div className="bg-[var(--bg3)] p-4 rounded-xl border border-[var(--border)]">
              <p className="text-[10px] text-muted uppercase font-bold mb-1">Total Ventas USD</p>
              <p className="text-2xl font-black text-emerald-400">{fmt(stats.totalUSD, 'USD')}</p>
            </div>
          </div>

          <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="bg-[var(--bg4)] p-2 px-4 border-b border-[var(--border)] flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase text-muted">Resumen por Método</span>
              <Receipt size={14} className="text-muted" />
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between text-xs"><span>Efectivo Bs.</span><span className="font-mono">{fmt(stats.efectivo_bs, 'VES')}</span></div>
              <div className="flex justify-between text-xs"><span>Pago Móvil</span><span className="font-mono">{fmt(stats.pago_movil, 'VES')}</span></div>
              <div className="flex justify-between text-xs"><span>BioPago</span><span className="font-mono">{fmt(stats.biopago, 'VES')}</span></div>
              <div className="flex justify-between text-xs"><span>Tarjeta</span><span className="font-mono">{fmt(stats.tarjeta, 'VES')}</span></div>
              <div className="flex justify-between text-xs"><span>Transferencia</span><span className="font-mono">{fmt(stats.transferencia, 'VES')}</span></div>
              <div className="h-px bg-[var(--border)] my-1"></div>
              <div className="flex justify-between text-xs font-bold text-emerald-400"><span>Efectivo USD</span><span className="font-mono">{fmt(stats.efectivo_usd, 'USD')}</span></div>
              <div className="flex justify-between text-xs font-bold text-emerald-400"><span>Zelle</span><span className="font-mono">{fmt(stats.zelle, 'USD')}</span></div>
            </div>
          </div>

          {!isClosed && (
            <div className="flex gap-2 no-print">
              <button className="btn btn-secondary flex-1 h-11 gap-2" onClick={() => window.print()}>
                <Printer size={16} /> Imprimir Resumen
              </button>
              <button className="btn btn-primary flex-1 h-11 gap-2 bg-red-600 hover:bg-red-700 text-white border-none" onClick={handleClose}>
                <Lock size={16} /> CERRAR CAJA
              </button>
            </div>
          )}
          
          {isClosed && (
            <div className="text-center p-4">
              <p className="text-muted text-xs mb-3 italic">Turno finalizado. Registre la entrada de efectivo y valores según corresponda.</p>
              <button className="btn btn-secondary w-full" onClick={() => window.print()}>
                <FileText size={16} /> Descargar Reporte de Cierre
              </button>
            </div>
          )}
        </div>
      )}
    </BaseWindow>
  );
}

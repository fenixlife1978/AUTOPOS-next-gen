
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, limit, Timestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { fmt } from '@/lib/posLogic';
import { AsientoContable, CuentaContable, AccountType, Moneda } from '@/lib/types';
import { FileText, Plus, Book, PieChart, Landmark, ArrowLeftRight, Download, Share2, RefreshCw, Pen, Trash } from 'lucide-react';

export default function AccountingWindow() {
  const { state, activeWindow, closeWindow, toast, addCuenta, updateCuenta, deleteCuenta, reopenMonth, closeMonth, editingCuenta, setEditingCuenta } = usePOS();
  const [tab, setTab] = useState<'diario' | 'mayor' | 'balances' | 'catalogo' | 'conciliacion'>('diario');
  const [asientos, setAsientos] = useState<AsientoContable[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showAddAcc, setShowAddAcc] = useState(false);
  const [newAcc, setNewAcc] = useState({ 
    nombre: '', 
    tipo: 'ACTIVO CORRIENTE' as AccountType,
    saldoInicial: 0,
    moneda: 'VES' as Moneda
  });

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    if (activeWindow === 'contabilidad') {
      const { firestore } = initializeFirebase();
      const q = query(collection(firestore, 'asientos_contables'), orderBy('fecha', 'desc'), limit(500));
      
      setLoading(true);
      const unsub = onSnapshot(q, (snap) => {
        const data = snap.docs.map(doc => {
          const d = doc.data();
          return { 
            id: doc.id, 
            ...d, 
            fecha: d.fecha instanceof Timestamp ? d.fecha.toDate() : new Date(d.fecha)
          } as AsientoContable;
        });
        setAsientos(data);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });

      return () => unsub();
    }
  }, [activeWindow]);

  const isMonthClosed = useMemo(() => {
    return state.cuentas.some(c => c.mesCerrado === selectedMonth);
  }, [state.cuentas, selectedMonth]);

  const handleSaveAccount = () => {
    if (!newAcc.nombre) return toast('Complete el nombre de la cuenta', 'error');
    
    if (editingCuenta) {
      updateCuenta(editingCuenta.id, {
        nombre: newAcc.nombre,
        tipo: newAcc.tipo,
        saldoInicial: Number(newAcc.saldoInicial),
        monedaSaldoInicial: newAcc.moneda
      });
    } else {
      addCuenta({
        nombre: newAcc.nombre,
        tipo: newAcc.tipo,
        saldoInicial: Number(newAcc.saldoInicial),
        monedaSaldoInicial: newAcc.moneda,
        editable: true
      });
    }
    
    setShowAddAcc(false);
    setEditingCuenta(null);
    setNewAcc({ nombre: '', tipo: 'ACTIVO CORRIENTE', saldoInicial: 0, moneda: 'VES' });
  };

  const handleEditAcc = (acc: CuentaContable) => {
    setEditingCuenta(acc);
    setNewAcc({
      nombre: acc.nombre,
      tipo: acc.tipo,
      saldoInicial: acc.saldoInicial,
      moneda: acc.monedaSaldoInicial
    });
    setShowAddAcc(true);
  };

  const handleSharePDF = () => {
    const originalTitle = document.title;
    document.title = `REPORTE_CONTABLE_${tab.toUpperCase()}_${selectedMonth}`;
    window.print();
    document.title = originalTitle;
    toast('Generando PDF del reporte...', 'info');
  };

  const handleExportCSV = (data: any[], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + data.map(row => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    toast('Exportando reporte a Excel/CSV...', 'success');
  };

  const filteredDiario = useMemo(() => {
    return asientos.filter(a => {
      const date = a.fecha instanceof Date ? a.fecha : new Date(a.fecha);
      return date.toISOString().startsWith(selectedMonth);
    });
  }, [asientos, selectedMonth]);

  const ACCOUNT_TYPES: AccountType[] = [
    'ACTIVO CORRIENTE', 'ACTIVO NO CORRIENTE', 'PASIVO CORRIENTE', 'PASIVO NO CORRIENTE',
    'PATRIMONIO', 'INGRESOS OPERACIONALES', 'INGRESOS NO OPERACIONALES', 'COSTOS DE VENTAS',
    'GASTOS ADMINISTRATIVOS', 'GASTOS DE VENTAS', 'GASTOS FINANCIEROS', 'OTROS INGRESOS',
    'OTROS GASTOS', 'CUENTAS DE ORDEN', 'RESERVAS'
  ];

  return (
    <BaseWindow 
      id="contabilidad" 
      title="Módulo de Contabilidad Profesional" 
      icon="fa-book-bookmark" 
      width="1000px"
      isOpen={activeWindow === 'contabilidad'}
      onClose={closeWindow}
      footer={<button className="btn btn-secondary" onClick={closeWindow}>Cerrar</button>}
    >
      <div className="flex flex-wrap gap-2 mb-4 border-b border-[var(--border)] overflow-x-auto no-print">
        <button className={`pb-2 px-3 flex items-center gap-2 text-xs font-bold transition-all ${tab === 'diario' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-muted'}`} onClick={() => setTab('diario')} title="Libro Diario: Ver todos los registros cronológicos del mes">
          <Book size={14} /> DIARIO
        </button>
        <button className={`pb-2 px-3 flex items-center gap-2 text-xs font-bold transition-all ${tab === 'mayor' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-muted'}`} onClick={() => setTab('mayor')} title="Libro Mayor: Ver movimientos agrupados por cada cuenta individual">
          <Landmark size={14} /> MAYOR
        </button>
        <button className={`pb-2 px-3 flex items-center gap-2 text-xs font-bold transition-all ${tab === 'balances' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-muted'}`} onClick={() => setTab('balances')} title="Estados Financieros: P&L, Comprobación e Ingresos/Egresos">
          <PieChart size={14} /> BALANCES
        </button>
        <button className={`pb-2 px-3 flex items-center gap-2 text-xs font-bold transition-all ${tab === 'catalogo' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-muted'}`} onClick={() => setTab('catalogo')} title="Catálogo de Cuentas: Administrar plan contable y códigos correlativos">
          <FileText size={14} /> CATÁLOGO
        </button>
        <button className={`pb-2 px-3 flex items-center gap-2 text-xs font-bold transition-all ${tab === 'conciliacion' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-muted'}`} onClick={() => setTab('conciliacion')} title="Conciliación Bancaria: Cotejar saldos bancarios vs registros internos">
          <ArrowLeftRight size={14} /> CONCILIACIÓN
        </button>
      </div>

      <div className="mb-4 flex items-center gap-4 bg-[var(--bg3)] p-3 rounded-lg border border-[var(--border)] no-print">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-muted font-bold">PERIODO DE CONSULTA</label>
          <input type="month" className="form-input text-xs h-8 py-0" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
        </div>
        <div className="flex gap-2 ml-auto">
          <button className="btn btn-secondary btn-sm" onClick={() => handleExportCSV(filteredDiario, `diario_${selectedMonth}`)} title="Exportar reporte actual a formato Excel/CSV">
            <Download size={14} /> Excel
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleSharePDF} title="Guardar o compartir reporte actual en formato PDF profesional">
            <Share2 size={14} /> PDF
          </button>
          
          {isMonthClosed ? (
            <button className="btn btn-secondary btn-sm border-blue-500 text-blue-400" onClick={() => reopenMonth(selectedMonth)} title="Reabrir Mes: Permite corregir o añadir asientos en un mes ya finalizado">
              <RefreshCw size={14} /> Reabrir Mes
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => closeMonth(selectedMonth)} title="Cerrar Mes: Finaliza el periodo y bloquea modificaciones posteriores">
              Cerrar Mes
            </button>
          )}
        </div>
      </div>

      <div className="min-h-[400px] print-area">
        {tab === 'diario' && (
          <div className="space-y-3">
            <div className="print-only mb-6 text-center">
              <h1 className="text-xl font-bold">LIBRO DIARIO GENERAL</h1>
              <p>Periodo: {selectedMonth}</p>
            </div>
            {loading ? (
              <div className="flex justify-center p-20"><Landmark className="animate-spin text-muted" /></div>
            ) : filteredDiario.length === 0 ? (
              <div className="text-center p-20 text-muted italic">No hay registros para este periodo</div>
            ) : filteredDiario.map(entry => (
              <div key={entry.id} className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm group page-break">
                <div className="bg-[var(--bg4)] p-2 px-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="badge badge-primary text-[10px]">{entry.tipo}</span>
                    <span className="text-[11px] font-mono text-muted">{entry.fecha.toLocaleString()}</span>
                    <span className="text-xs font-bold">{entry.descripcion}</span>
                  </div>
                </div>
                <div className="p-3">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted border-b border-[var(--border)] uppercase text-[10px]">
                        <th className="text-left py-1">Código / Cuenta</th>
                        <th className="text-right py-1">Debe (VES)</th>
                        <th className="text-right py-1">Haber (VES)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.lineas.map((line, idx) => (
                        <tr key={idx} className="border-b border-[var(--border)]/20 hover:bg-[var(--bg3)]">
                          <td className={`py-1.5 ${line.haber > 0 ? 'pl-8' : ''}`}>
                            <span className="text-muted mr-2">{line.cuentaId}</span>
                            <span className={line.haber > 0 ? 'italic' : 'font-medium'}>{line.nombreCuenta}</span>
                          </td>
                          <td className="text-right py-1.5 font-mono">{line.debe > 0 ? fmt(line.debe, 'VES') : '--'}</td>
                          <td className="text-right py-1.5 font-mono">{line.haber > 0 ? fmt(line.haber, 'VES') : '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'catalogo' && (
          <div>
            <div className="flex justify-between items-center mb-4 no-print">
              <h3 className="text-sm font-bold flex items-center gap-2"><Book size={16} /> Plan Único de Cuentas (PUC)</h3>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditingCuenta(null); setNewAcc({ nombre: '', tipo: 'ACTIVO CORRIENTE', saldoInicial: 0, moneda: 'VES' }); setShowAddAcc(true); }} title="Nueva Cuenta: Permite crear cajas, bancos o subcuentas con código automático">
                <Plus size={14} /> Crear Cuenta
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Código</th><th>Nombre de Cuenta</th><th>Clasificación</th><th>Saldo Apertura</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {state.cuentas.sort((a,b) => a.codigo.localeCompare(b.codigo)).map(acc => (
                  <tr key={acc.id}>
                    <td className="font-mono text-xs">{acc.codigo}</td>
                    <td style={{ paddingLeft: `${(acc.nivel - 1) * 20}px` }} className={acc.nivel <= 2 ? 'font-bold' : ''}>{acc.nombre}</td>
                    <td><span className="badge badge-general text-[9px]">{acc.tipo}</span></td>
                    <td className="text-right font-mono">{fmt(acc.saldoInicial, acc.monedaSaldoInicial)}</td>
                    <td className="no-print">
                      <div className="flex gap-2">
                        <button className="text-blue-400 btn btn-sm" onClick={() => handleEditAcc(acc)} title="Editar cuenta">
                          <Pen size={12} />
                        </button>
                        {acc.editable && (
                          <button className="text-red-400 btn btn-sm" onClick={() => deleteCuenta(acc.id)} title="Eliminar cuenta del catálogo">
                            <Trash size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddAcc && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 no-print">
          <div className="bg-[var(--bg2)] p-6 rounded-2xl border border-[var(--border)] w-full max-w-md shadow-2xl">
            <h4 className="font-bold mb-4 flex items-center gap-2 text-lg"><Landmark size={20} className="text-[var(--accent)]" /> {editingCuenta ? 'Editar Cuenta' : 'Configuración de Cuenta'}</h4>
            <div className="space-y-3">
              <div className="form-group">
                <label className="form-label">Nombre de Cuenta</label>
                <input className="form-input" value={newAcc.nombre} onChange={e => setNewAcc({...newAcc, nombre: e.target.value})} placeholder="Ej: Banesco Corriente 0102" />
              </div>
              <div className="form-group">
                <label className="form-label">Clasificación Contable</label>
                <select className="form-select text-xs" value={newAcc.tipo} onChange={e => setNewAcc({...newAcc, tipo: e.target.value as AccountType})}>
                  {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Moneda Inicial</label>
                  <select className="form-select" value={newAcc.moneda} onChange={e => setNewAcc({...newAcc, moneda: e.target.value as Moneda})}>
                    <option value="VES">VES</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Saldo Inicial</label>
                  <input type="number" className="form-input" value={newAcc.saldoInicial} onChange={e => setNewAcc({...newAcc, saldoInicial: Number(e.target.value)})} placeholder="0.00" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button className="btn btn-secondary flex-1" onClick={() => { setShowAddAcc(false); setEditingCuenta(null); }}>Cancelar</button>
              <button className="btn btn-primary flex-1" onClick={handleSaveAccount}>Guardar en PUC</button>
            </div>
          </div>
        </div>
      )}
    </BaseWindow>
  );
}

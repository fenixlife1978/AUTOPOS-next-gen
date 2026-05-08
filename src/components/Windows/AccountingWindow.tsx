
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, limit, Timestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { fmt } from '@/lib/posLogic';
import { AsientoContable, CuentaContable, AccountType, Moneda } from '@/lib/types';
import { FileText, Plus, Book, PieChart, Landmark, ArrowLeftRight, Download, Printer, Share2 } from 'lucide-react';

export default function AccountingWindow() {
  const { state, activeWindow, closeWindow, toast, addCuenta, deleteCuenta, deleteAccountingEntry, closeMonth } = usePOS();
  const [tab, setTab] = useState<'diario' | 'mayor' | 'balances' | 'catalogo' | 'conciliacion'>('diario');
  const [asientos, setAsientos] = useState<AsientoContable[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Account Form
  const [showAddAcc, setShowAddAcc] = useState(false);
  const [newAcc, setNewAcc] = useState({ 
    nombre: '', 
    tipo: 'ACTIVO CORRIENTE' as AccountType,
    saldoInicial: 0,
    moneda: 'VES' as Moneda
  });

  // Filter for reports
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportType, setReportType] = useState<'pl' | 'comprobacion' | 'ingresos_egresos'>('comprobacion');

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
      });

      return () => unsub();
    }
  }, [activeWindow]);

  const handleAddAccount = () => {
    if (!newAcc.nombre) return toast('Complete el nombre de la cuenta', 'error');
    addCuenta({
      nombre: newAcc.nombre,
      tipo: newAcc.tipo,
      saldoInicial: Number(newAcc.saldoInicial),
      monedaSaldoInicial: newAcc.moneda,
      editable: true
    });
    setShowAddAcc(false);
    setNewAcc({ nombre: '', tipo: 'ACTIVO CORRIENTE', saldoInicial: 0, moneda: 'VES' });
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
      <div className="flex flex-wrap gap-2 mb-4 border-b border-[var(--border)] overflow-x-auto">
        <button className={`pb-2 px-3 flex items-center gap-2 text-xs font-bold transition-all ${tab === 'diario' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-muted'}`} onClick={() => setTab('diario')} title="Ver Libro Diario de todas las cuentas">
          <Book size={14} /> DIARIO
        </button>
        <button className={`pb-2 px-3 flex items-center gap-2 text-xs font-bold transition-all ${tab === 'mayor' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-muted'}`} onClick={() => setTab('mayor')} title="Ver resumen de cada cuenta">
          <Landmark size={14} /> MAYOR
        </button>
        <button className={`pb-2 px-3 flex items-center gap-2 text-xs font-bold transition-all ${tab === 'balances' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-muted'}`} onClick={() => setTab('balances')} title="Balances de P&L y Comprobación">
          <PieChart size={14} /> BALANCES
        </button>
        <button className={`pb-2 px-3 flex items-center gap-2 text-xs font-bold transition-all ${tab === 'catalogo' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-muted'}`} onClick={() => setTab('catalogo')} title="Gestionar Plan Único de Cuentas">
          <FileText size={14} /> CATÁLOGO
        </button>
        <button className={`pb-2 px-3 flex items-center gap-2 text-xs font-bold transition-all ${tab === 'conciliacion' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-muted'}`} onClick={() => setTab('conciliacion')} title="Conciliación bancaria manual">
          <ArrowLeftRight size={14} /> CONCILIACIÓN
        </button>
      </div>

      <div className="mb-4 flex items-center gap-4 bg-[var(--bg3)] p-3 rounded-lg border border-[var(--border)]">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-muted font-bold">PERIODO SELECCIONADO</label>
          <input type="month" className="form-input text-xs h-8 py-0" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
        </div>
        <div className="flex gap-2 ml-auto">
          <button className="btn btn-secondary btn-sm" onClick={() => handleExportCSV(filteredDiario, `diario_${selectedMonth}`)} title="Exportar este periodo a CSV">
            <Download size={14} />
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()} title="Imprimir reporte actual">
            <Printer size={14} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => closeMonth(selectedMonth)} title="Cerrar este mes para bloquear modificaciones">
            Cerrar Mes
          </button>
        </div>
      </div>

      <div className="min-h-[400px]">
        {tab === 'diario' && (
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center p-20"><Landmark className="animate-spin text-muted" /></div>
            ) : filteredDiario.length === 0 ? (
              <div className="text-center p-20 text-muted italic">No hay registros para este periodo</div>
            ) : filteredDiario.map(entry => (
              <div key={entry.id} className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm group">
                <div className="bg-[var(--bg4)] p-2 px-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="badge badge-primary text-[10px]">{entry.tipo}</span>
                    <span className="text-[11px] font-mono text-muted">{entry.fecha.toLocaleString()}</span>
                    <span className="text-xs font-bold">{entry.descripcion}</span>
                  </div>
                  <button className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteAccountingEntry(entry.id)} title="Eliminar asiento de forma permanente">
                    <Printer size={12} />
                  </button>
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

        {tab === 'mayor' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.cuentas.map(acc => {
              const movements = asientos.flatMap(a => a.lineas.filter(l => l.cuentaId === acc.codigo));
              const totalDebe = movements.reduce((s, m) => s + m.debe, 0);
              const totalHaber = movements.reduce((s, m) => s + m.haber, 0);
              const saldoFinal = acc.tipo.includes('ACTIVO') || acc.tipo.includes('COSTOS') || acc.tipo.includes('GASTOS')
                ? (acc.saldoInicial + totalDebe - totalHaber)
                : (acc.saldoInicial + totalHaber - totalDebe);

              return (
                <div key={acc.id} className="bg-[var(--bg3)] border border-[var(--border)] rounded-lg p-3">
                  <div className="flex justify-between border-b border-[var(--border)] pb-1 mb-2">
                    <span className="text-xs font-bold text-[var(--accent)]">{acc.codigo} - {acc.nombre}</span>
                    <span className={`text-xs font-bold ${saldoFinal >= 0 ? 'text-success' : 'text-danger'}`}>{fmt(saldoFinal, 'VES')}</span>
                  </div>
                  <div className="text-[10px] space-y-1">
                    <div className="flex justify-between"><span>Saldo Inicial:</span><span>{fmt(acc.saldoInicial, 'VES')}</span></div>
                    <div className="flex justify-between text-success"><span>Débitos (+) :</span><span>{fmt(totalDebe, 'VES')}</span></div>
                    <div className="flex justify-between text-danger"><span>Créditos (-) :</span><span>{fmt(totalHaber, 'VES')}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'catalogo' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2"><Book size={16} /> Plan Único de Cuentas</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddAcc(true)} title="Crear una nueva cuenta contable con código correlativo automático">
                <Plus size={14} /> Nueva Cuenta
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Código</th><th>Nombre de Cuenta</th><th>Tipo de Cuenta</th><th>Saldo Inicial</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {state.cuentas.sort((a,b) => a.codigo.localeCompare(b.codigo)).map(acc => (
                  <tr key={acc.id}>
                    <td className="font-mono text-xs">{acc.codigo}</td>
                    <td style={{ paddingLeft: `${(acc.nivel - 1) * 20}px` }} className={acc.nivel <= 2 ? 'font-bold' : ''}>{acc.nombre}</td>
                    <td><span className="badge badge-general text-[9px]">{acc.tipo}</span></td>
                    <td className="text-right font-mono">{fmt(acc.saldoInicial, acc.monedaSaldoInicial)}</td>
                    <td>
                      {acc.editable && (
                        <button className="text-red-400 btn btn-sm" onClick={() => deleteCuenta(acc.id)} title="Eliminar cuenta">
                          <Printer size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'balances' && (
          <div className="space-y-6">
            <div className="flex gap-2 mb-4">
              <button className={`btn btn-sm ${reportType === 'comprobacion' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setReportType('comprobacion')}>Balance de Comprobación</button>
              <button className={`btn btn-sm ${reportType === 'pl' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setReportType('pl')}>Ganancias y Pérdidas (P&L)</button>
              <button className={`btn btn-sm ${reportType === 'ingresos_egresos' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setReportType('ingresos_egresos')}>Ingresos vs Egresos</button>
            </div>
            <div className="bg-[var(--bg2)] p-6 rounded-2xl border border-[var(--border)] shadow-xl">
              <h2 className="text-center font-bold text-lg mb-1">REPORTE CONTABLE - AUTOPOS</h2>
              <p className="text-center text-xs text-muted mb-6">PERIODO: {selectedMonth}</p>
              
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-[var(--border)] text-left">
                    <th className="py-2">CUENTA / CONCEPTO</th>
                    <th className="py-2 text-right">DEBE</th>
                    <th className="py-2 text-right">HABER</th>
                    <th className="py-2 text-right">SALDO</th>
                  </tr>
                </thead>
                <tbody>
                  {state.cuentas.map(acc => {
                    const movements = asientos.flatMap(a => a.lineas.filter(l => l.cuentaId === acc.codigo));
                    const d = movements.reduce((s, m) => s + m.debe, 0);
                    const h = movements.reduce((s, m) => s + m.haber, 0);
                    const s = d - h;
                    return (
                      <tr key={acc.id} className="border-b border-[var(--border)]/20">
                        <td className="py-2 text-xs">{acc.nombre}</td>
                        <td className="py-2 text-right font-mono">{fmt(d)}</td>
                        <td className="py-2 text-right font-mono">{fmt(h)}</td>
                        <td className="py-2 text-right font-mono font-bold">{fmt(s)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'conciliacion' && (
          <div className="bg-[var(--bg2)] p-6 rounded-xl border border-[var(--border)]">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-full text-blue-400"><Landmark size={24} /></div>
              <div>
                <h3 className="font-bold text-lg">Conciliación Bancaria Manual</h3>
                <p className="text-xs text-muted">Sincroniza tus registros internos con tus estados de cuenta bancarios.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">Instrucciones de Uso</h4>
                <ul className="text-xs space-y-2 text-muted list-disc pl-4">
                  <li>Selecciona la cuenta bancaria a conciliar en el catálogo.</li>
                  <li>Ingresa el saldo final que indica tu estado de cuenta físico/digital.</li>
                  <li>Marca los movimientos (Depósitos o Retiros) que coincidan.</li>
                  <li>El sistema calculará la diferencia automáticamente.</li>
                  <li>Al llegar a CERO de diferencia, pulsa "Conciliar Periodo".</li>
                </ul>
              </div>
              <div className="bg-[var(--bg3)] p-4 rounded-lg border border-[var(--border)]">
                <div className="form-group">
                  <label className="form-label">Cuenta a Conciliar</label>
                  <select className="form-select">
                    <option>Seleccionar banco...</option>
                    {state.cuentas.filter(c => c.tipo.includes('ACTIVO')).map(c => <option key={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group mt-3">
                  <label className="form-label">Saldo según Banco (VES)</label>
                  <input type="number" className="form-input" placeholder="0.00" />
                </div>
                <button className="btn btn-primary w-full mt-4">Iniciar Cotejo</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddAcc && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[var(--bg2)] p-6 rounded-2xl border border-[var(--border)] w-[450px] shadow-2xl">
            <h4 className="font-bold mb-4 flex items-center gap-2 text-lg"><Landmark size={20} className="text-[var(--accent)]" /> Configuración de Nueva Cuenta</h4>
            <div className="space-y-3">
              <div className="form-group">
                <label className="form-label">Nombre de la Cuenta (Ej: Banesco 1234)</label>
                <input className="form-input" value={newAcc.nombre} onChange={e => setNewAcc({...newAcc, nombre: e.target.value})} placeholder="Ej: Caja Chica Taller" />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo de Cuenta (Clasificación NIC)</label>
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
                  <label className="form-label">Saldo de Apertura</label>
                  <input type="number" className="form-input" value={newAcc.saldoInicial} onChange={e => setNewAcc({...newAcc, saldoInicial: Number(e.target.value)})} placeholder="0.00" />
                </div>
              </div>
              <p className="text-[10px] text-muted italic">* El código contable correlativo se generará automáticamente según el tipo de cuenta seleccionado.</p>
            </div>
            <div className="flex gap-2 mt-6">
              <button className="btn btn-secondary flex-1" onClick={() => setShowAddAcc(false)}>Cancelar</button>
              <button className="btn btn-primary flex-1" onClick={handleAddAccount}>Guardar Cuenta</button>
            </div>
          </div>
        </div>
      )}
    </BaseWindow>
  );
}

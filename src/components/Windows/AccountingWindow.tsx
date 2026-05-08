
"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { fmt } from '@/lib/posLogic';
import { AsientoContable, CuentaContable, AccountType } from '@/lib/types';

export default function AccountingWindow() {
  const { state, activeWindow, closeWindow, toast, addCuenta, deleteCuenta, deleteAccountingEntry } = usePOS();
  const [tab, setTab] = useState<'diario' | 'catalogo'>('diario');
  const [asientos, setAsientos] = useState<AsientoContable[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Account Form
  const [showAddAcc, setShowAddAcc] = useState(false);
  const [newAcc, setNewAcc] = useState({ codigo: '', nombre: '', tipo: 'ACTIVO' as AccountType });

  useEffect(() => {
    if (activeWindow === 'contabilidad') {
      const { firestore } = initializeFirebase();
      const q = query(collection(firestore, 'asientos_contables'), orderBy('fecha', 'desc'), limit(100));
      
      setLoading(true);
      const unsub = onSnapshot(q, (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AsientoContable));
        setAsientos(data);
        setLoading(false);
      });

      return () => unsub();
    }
  }, [activeWindow]);

  const handleAddAccount = () => {
    if (!newAcc.codigo || !newAcc.nombre) return toast('Complete los campos', 'error');
    addCuenta({
      id: newAcc.codigo,
      codigo: newAcc.codigo,
      nombre: newAcc.nombre,
      tipo: newAcc.tipo,
      nivel: newAcc.codigo.split('.').length,
      editable: true
    });
    setShowAddAcc(false);
    setNewAcc({ codigo: '', nombre: '', tipo: 'ACTIVO' });
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('¿Desea eliminar este asiento contable?')) {
      deleteAccountingEntry(id);
    }
  };

  return (
    <BaseWindow 
      id="contabilidad" 
      title="Gestión Contable" 
      icon="fa-book" 
      width="900px"
      isOpen={activeWindow === 'contabilidad'}
      onClose={closeWindow}
      footer={<button className="btn btn-secondary" onClick={closeWindow}>Cerrar</button>}
    >
      <div className="flex gap-4 mb-4 border-b border-[var(--border)]">
        <button 
          className={`pb-2 px-2 text-sm font-bold ${tab === 'diario' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-muted'}`}
          onClick={() => setTab('diario')}
        >
          LIBRO DIARIO
        </button>
        <button 
          className={`pb-2 px-2 text-sm font-bold ${tab === 'catalogo' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-muted'}`}
          onClick={() => setTab('catalogo')}
        >
          CATÁLOGO DE CUENTAS
        </button>
      </div>

      {tab === 'diario' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center p-10">Cargando diario...</div>
          ) : asientos.length === 0 ? (
            <div className="text-center p-10 text-muted">No hay asientos contables registrados</div>
          ) : asientos.map(entry => (
            <div key={entry.id} className="bg-[var(--bg3)] border border-[var(--border)] rounded-lg overflow-hidden mb-4 group">
              <div className="bg-[var(--bg4)] p-2 px-4 flex justify-between items-center text-xs">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-[var(--accent)]">{entry.tipo}</span>
                  <span className="text-muted">{entry.fecha?.toDate ? entry.fecha.toDate().toLocaleString() : new Date(entry.fecha).toLocaleString()}</span>
                </div>
                <button 
                  className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteEntry(entry.id)}
                  title="Eliminar asiento"
                >
                  <i className="fas fa-trash-can"></i>
                </button>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium mb-2">{entry.descripcion}</p>
                <table className="w-full text-xs">
                  <thead className="text-muted border-b border-[var(--border)]">
                    <tr>
                      <th className="text-left p-1">Cuenta</th>
                      <th className="text-right p-1">Debe</th>
                      <th className="text-right p-1">Haber</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.lineas.map((linea, idx) => (
                      <tr key={idx} className="border-b border-[var(--border)]/30">
                        <td className={`p-1 ${linea.haber > 0 ? 'pl-6' : ''}`}>{linea.nombreCuenta}</td>
                        <td className="text-right p-1 font-mono">{linea.debe > 0 ? fmt(linea.debe, 'VES') : ''}</td>
                        <td className="text-right p-1 font-mono">{linea.haber > 0 ? fmt(linea.haber, 'VES') : ''}</td>
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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Plan de Cuentas</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddAcc(true)}>
              <i className="fas fa-plus"></i> Nueva Cuenta
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {state.cuentas.sort((a,b) => a.codigo.localeCompare(b.codigo)).map(acc => (
                <tr key={acc.id}>
                  <td className="font-mono">{acc.codigo}</td>
                  <td style={{ paddingLeft: `${(acc.nivel - 1) * 20}px` }} className={acc.nivel === 1 ? 'font-bold' : ''}>
                    {acc.nombre}
                  </td>
                  <td><span className="badge badge-general">{acc.tipo}</span></td>
                  <td>
                    {acc.editable && (
                      <button className="text-red-400 hover:text-red-500" onClick={() => deleteCuenta(acc.id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddAcc && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg2)] p-6 rounded-xl border border-[var(--border)] w-[400px]">
            <h4 className="font-bold mb-4">Nueva Cuenta Bancaria/Caja</h4>
            <div className="space-y-3">
              <div className="form-group">
                <label className="form-label">Código (ej: 1.1.2.05)</label>
                <input className="form-input" value={newAcc.codigo} onChange={e => setNewAcc({...newAcc, codigo: e.target.value})} placeholder="X.X.X.XX" />
              </div>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input className="form-input" value={newAcc.nombre} onChange={e => setNewAcc({...newAcc, nombre: e.target.value})} placeholder="Nombre de banco o caja" />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select className="form-select" value={newAcc.tipo} onChange={e => setNewAcc({...newAcc, tipo: e.target.value as AccountType})}>
                  <option value="ACTIVO">Activo</option>
                  <option value="PASIVO">Pasivo</option>
                  <option value="PATRIMONIO">Patrimonio</option>
                  <option value="INGRESO">Ingreso</option>
                  <option value="GASTO">Gasto</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button className="btn btn-secondary flex-1" onClick={() => setShowAddAcc(false)}>Cancelar</button>
              <button className="btn btn-primary flex-1" onClick={handleAddAccount}>Crear Cuenta</button>
            </div>
          </div>
        </div>
      )}
    </BaseWindow>
  );
}

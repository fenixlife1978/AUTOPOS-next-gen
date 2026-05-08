
"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { fmt } from '@/lib/posLogic';
import { AccountingEntry } from '@/lib/types';

export default function AccountingWindow() {
  const { activeWindow, closeWindow, toast } = usePOS();
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<AccountingEntry[]>([]);

  useEffect(() => {
    if (activeWindow === 'contabilidad') {
      fetchEntries();
    }
  }, [activeWindow]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const { firestore } = initializeFirebase();
      const q = query(
        collection(firestore, 'asientos_contables'),
        orderBy('fecha', 'desc'),
        limit(50)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setEntries(data);
    } catch (e) {
      console.error(e);
      toast('Error al cargar diario', 'error');
    }
    setLoading(false);
  };

  return (
    <BaseWindow 
      id="contabilidad" 
      title="Libro Diario Contable" 
      icon="fa-book" 
      width="800px"
      isOpen={activeWindow === 'contabilidad'}
      onClose={closeWindow}
      footer={<button className="btn btn-secondary" onClick={closeWindow}>Cerrar</button>}
    >
      <div className="space-y-4">
        {loading ? (
          <div className="text-center p-10">Cargando libro diario...</div>
        ) : entries.length === 0 ? (
          <div className="text-center p-10 text-muted">No hay asientos contables registrados</div>
        ) : entries.map(entry => (
          <div key={entry.id} className="bg-[var(--bg3)] border border-[var(--border)] rounded-lg overflow-hidden mb-4">
            <div className="bg-[var(--bg4)] p-2 px-4 flex justify-between items-center text-xs">
              <span className="font-bold text-[var(--accent)]">{entry.tipo}</span>
              <span className="text-muted">{entry.fecha?.toDate?.()?.toLocaleDateString()} {entry.fecha?.toDate?.()?.toLocaleTimeString()}</span>
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
    </BaseWindow>
  );
}

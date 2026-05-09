
"use client";

import React, { useState, useEffect } from 'react';
import { usePOS } from './POSContext';
import { fechaStr, horaStr, fmt, fechaISO } from '@/lib/posLogic';
import { Loader2 } from 'lucide-react';

export default function StatusBar() {
  const { state, catalogProgress, isCatalogReady } = usePOS();
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState({ date: '', time: '' });

  useEffect(() => {
    setMounted(true);
    const updateTime = () => setTime({ date: fechaStr(), time: horaStr() });
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const hoy = fechaISO();
  const ventasHoy = state.ventas.filter(v => v.fecha && v.fecha.startsWith(hoy));
  const ingresosHoy = ventasHoy.reduce((s, v) => s + v.total, 0);

  return (
    <div className="status-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span><span className="status-dot"></span>Conectado</span>
        <span>{mounted ? `${time.date} ${time.time}` : 'Cargando...'}</span>
        
        {!isCatalogReady && (
          <div className="flex items-center gap-2 ml-4 px-2 py-1 bg-[var(--bg3)] rounded border border-[var(--border)]">
            <Loader2 size={12} className="animate-spin text-[var(--accent)]" />
            <span className="text-[10px] text-muted uppercase font-bold tracking-tighter">
              Cargando Catálogo Maestro: {catalogProgress}%
            </span>
            <div className="w-16 h-1.5 bg-[var(--bg)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--accent)] transition-all duration-300" 
                style={{ width: `${catalogProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span>Ventas hoy: {ventasHoy.length}</span>
        <span>Ingresos: {fmt(ingresosHoy)}</span>
      </div>
    </div>
  );
}

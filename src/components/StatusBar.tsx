
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
      <div className="flex items-center gap-4 overflow-hidden">
        <span className="whitespace-nowrap flex items-center shrink-0">
          <span className="status-dot"></span>Conectado
        </span>
        <span className="whitespace-nowrap shrink-0">{mounted ? `${time.date} ${time.time}` : 'Cargando...'}</span>
        
        {!isCatalogReady && (
          <div className="flex items-center gap-2 px-3 py-0.5 bg-[var(--accent-glow)] rounded-full border border-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)] animate-pulse">
            <Loader2 size={12} className="animate-spin text-[var(--accent)]" />
            <span className="text-[9px] text-[var(--accent)] uppercase font-black tracking-tight whitespace-nowrap">
              Sincronizando Catálogo Maestro: {catalogProgress}%
            </span>
            <div className="w-20 h-1.5 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)] shrink-0">
              <div 
                className="h-full bg-[var(--accent)] transition-all duration-500 ease-out" 
                style={{ width: `${catalogProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4 shrink-0">
        <span className="hidden sm:inline">Ventas hoy: {ventasHoy.length}</span>
        <span className="font-bold text-[var(--accent)]">Ingresos: {fmt(ingresosHoy)}</span>
      </div>
    </div>
  );
}

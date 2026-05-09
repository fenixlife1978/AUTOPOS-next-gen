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
    <div className="status-bar" style={{ minWidth: 'fit-content' }}>
      <div className="flex items-center gap-4 flex-1">
        <span className="flex items-center gap-2 shrink-0">
          <span className="status-dot"></span>
          <span className="font-bold text-[10px] tracking-widest text-[var(--accent)] uppercase">AutoPOS v1 next-gen</span>
        </span>
        
        <span className="shrink-0 hidden md:inline opacity-70">
          {mounted ? `${time.date} ${time.time}` : '...'}
        </span>
        
        {!isCatalogReady && (
          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg3)] rounded-lg border border-[var(--accent)]/30 animate-pulse ml-2 overflow-hidden max-w-[300px]">
            <Loader2 size={12} className="animate-spin text-[var(--accent)] shrink-0" />
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[8px] text-[var(--accent)] uppercase font-black tracking-tighter truncate">
                Sincronizando Catálogo Maestro: {catalogProgress}%
              </span>
              <div className="w-24 h-1 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
                <div 
                  className="h-full bg-[var(--accent)] transition-all duration-500 ease-out" 
                  style={{ width: `${catalogProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4 shrink-0">
        <span className="hidden sm:inline opacity-70">Ventas hoy: {ventasHoy.length}</span>
        <div className="bg-[var(--bg)] px-3 py-1 rounded border border-[var(--border)]">
          <span className="font-bold text-[var(--accent)] text-xs">{fmt(ingresosHoy)}</span>
        </div>
      </div>
    </div>
  );
}

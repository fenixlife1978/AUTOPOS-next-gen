
"use client";

import React, { useState, useEffect } from 'react';
import { usePOS } from './POSContext';
import { fechaStr, horaStr, fmt, fechaISO } from '@/lib/posLogic';

export default function StatusBar() {
  const { state } = usePOS();
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
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span>Ventas hoy: {ventasHoy.length}</span>
        <span>Ingresos: {fmt(ingresosHoy)}</span>
      </div>
    </div>
  );
}

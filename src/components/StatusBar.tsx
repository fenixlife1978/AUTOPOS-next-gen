
"use client";

import React, { useState, useEffect } from 'react';
import { usePOS } from './POSContext';
import { fechaStr, horaStr, fmt, fechaISO } from '@/lib/posLogic';

export default function StatusBar() {
  const { state } = usePOS();
  const [time, setTime] = useState({ date: fechaStr(), time: horaStr() });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime({ date: fechaStr(), time: horaStr() });
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const hoy = fechaISO();
  const ventasHoy = state.ventas.filter(v => v.fecha && v.fecha.startsWith(hoy));
  const ingresosHoy = ventasHoy.reduce((s, v) => s + v.total, 0);

  return (
    <div className="status-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span><span className="status-dot"></span>Conectado</span>
        <span>{time.date} {time.time}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span>Ventas hoy: {ventasHoy.length}</span>
        <span>Ingresos: {fmt(ingresosHoy)}</span>
      </div>
    </div>
  );
}

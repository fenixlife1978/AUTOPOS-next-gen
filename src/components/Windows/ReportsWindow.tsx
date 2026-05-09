
"use client";

import React, { useState, useMemo } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { fmt } from '@/lib/posLogic';
import { BarChart3, TrendingUp, TrendingDown, Package, FileText, Calendar, Download, Printer, Share2, FileDown, LogOut } from 'lucide-react';

type ReportTab = 'ventas' | 'compras' | 'inventario' | 'flujo';

export default function ReportsWindow() {
  const { state, activeWindow, closeWindow, toast, lockModule } = usePOS();
  const [tab, setTab] = useState<ReportTab>('ventas');
  const [filter, setFilter] = useState({
    day: new Date().toISOString().split('T')[0],
    month: new Date().toISOString().slice(0, 7),
    year: new Date().getFullYear().toString(),
    periodType: 'day' as 'day' | 'month' | 'year'
  });

  const filteredVentas = useMemo(() => {
    return state.ventas.filter(v => {
      const date = v.fecha.split('T')[0];
      if (filter.periodType === 'day') return date === filter.day;
      if (filter.periodType === 'month') return date.startsWith(filter.month);
      if (filter.periodType === 'year') return date.startsWith(filter.year);
      return true;
    });
  }, [state.ventas, filter]);

  const filteredCompras = useMemo(() => {
    return state.compras.filter(c => {
      const date = c.fechaEmision;
      if (filter.periodType === 'day') return date === filter.day;
      if (filter.periodType === 'month') return date.startsWith(filter.month);
      if (filter.periodType === 'year') return date.startsWith(filter.year);
      return true;
    });
  }, [state.compras, filter]);

  const statsVentas = useMemo(() => {
    const totalUSD = filteredVentas.reduce((s, v) => s + v.total, 0);
    const totalVES = filteredVentas.reduce((s, v) => s + v.totalVES, 0);
    return { totalUSD, totalVES };
  }, [filteredVentas]);

  const statsCompras = useMemo(() => {
    const totalUSD = filteredCompras.reduce((s, c) => s + c.monto_original, 0);
    const totalVES = filteredCompras.reduce((s, c) => s + c.monto_bolivares, 0);
    return { totalUSD, totalVES };
  }, [filteredCompras]);

  const handlePrint = () => {
    window.print();
    toast('Preparando documento PDF...', 'info');
  };

  const handleExportPDF = () => {
    toast('Generando reporte PDF para descarga...', 'success');
    window.print();
  };

  const handleSharePDF = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reporte AutoPOS - ${tab.toUpperCase()}`,
          text: `Adjunto reporte de ${tab} generado el ${new Date().toLocaleString()}`,
          url: window.location.href,
        });
        toast('Enlace de reporte compartido', 'success');
      } catch (err) {
        handlePrint();
      }
    } else {
      handlePrint();
    }
  };

  const handleExportExcel = () => {
    toast('Exportando reporte a Excel...', 'success');
  };

  return (
    <BaseWindow 
      id="reportes" 
      title="Centro de Reportes y Estadísticas Profesionales" 
      icon="fa-chart-line" 
      width="950px"
      isOpen={activeWindow === 'reportes'}
      onClose={closeWindow}
      footer={
        <div className="flex justify-between w-full">
          <button className="btn btn-danger btn-sm gap-2" onClick={() => lockModule('reportes')}>
            <LogOut size={14} /> SALIR Y BLOQUEAR
          </button>
          <button className="btn btn-secondary no-print" onClick={closeWindow}>Cerrar</button>
        </div>
      }
    >
      <div className="flex flex-wrap gap-2 mb-4 border-b border-[var(--border)] no-print">
        <button className={`pb-2 px-3 flex items-center gap-2 text-xs font-bold transition-all ${tab === 'ventas' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-muted'}`} onClick={() => setTab('ventas')}>
          <TrendingUp size={14} /> VENTAS
        </button>
        <button className={`pb-2 px-3 flex items-center gap-2 text-xs font-bold transition-all ${tab === 'compras' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-muted'}`} onClick={() => setTab('compras')}>
          <TrendingDown size={14} /> COMPRAS
        </button>
        <button className={`pb-2 px-3 flex items-center gap-2 text-xs font-bold transition-all ${tab === 'inventario' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-muted'}`} onClick={() => setTab('inventario')}>
          <Package size={14} /> INVENTARIO REAL
        </button>
        <button className={`pb-2 px-3 flex items-center gap-2 text-xs font-bold transition-all ${tab === 'flujo' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-muted'}`} onClick={() => setTab('flujo')}>
          <BarChart3 size={14} /> FLUJO CAJA
        </button>
      </div>

      <div className="bg-[var(--bg3)] p-4 rounded-xl border border-[var(--border)] mb-6 flex items-center gap-4 flex-wrap no-print">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-muted font-bold">TIPO PERIODO</label>
          <select className="form-select h-8 py-0 text-xs" value={filter.periodType} onChange={e => setFilter({...filter, periodType: e.target.value as any})}>
            <option value="day">Día Específico</option>
            <option value="month">Mes Completo</option>
            <option value="year">Año Completo</option>
          </select>
        </div>

        {filter.periodType === 'day' && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-muted font-bold">SELECCIONAR DÍA</label>
            <input type="date" className="form-input h-8 py-0 text-xs" value={filter.day} onChange={e => setFilter({...filter, day: e.target.value})} />
          </div>
        )}

        {filter.periodType === 'month' && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-muted font-bold">SELECCIONAR MES</label>
            <input type="month" className="form-input h-8 py-0 text-xs" value={filter.month} onChange={e => setFilter({...filter, month: e.target.value})} />
          </div>
        )}

        <div className="ml-auto flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={handleExportExcel} title="Exportar a Excel">
            <Download size={14} /> Excel
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleExportPDF} title="Exportar reporte a PDF">
            <FileDown size={14} /> Exportar PDF
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleSharePDF} title="Compartir reporte por correo o aplicaciones">
            <Share2 size={14} /> Compartir PDF
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint} title="Imprimir reporte actual">
            <Printer size={14} /> Imprimir
          </button>
        </div>
      </div>

      <div className="print-area min-h-[400px]">
        {/* Cabecera solo para impresión */}
        <div className="print-only hidden mb-8 text-center border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-widest">AutoPOS Professional</h1>
          <p className="text-sm">Sistema de Gestión Automotriz</p>
          <div className="mt-4 flex justify-between text-[10px] uppercase font-bold">
            <span>Reporte: {tab.toUpperCase()}</span>
            <span>Periodo: {filter.periodType === 'day' ? filter.day : filter.periodType === 'month' ? filter.month : filter.year}</span>
            <span>Fecha Emisión: {new Date().toLocaleString()}</span>
          </div>
        </div>

        {tab === 'ventas' && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-xl">
                <p className="text-[10px] text-emerald-500 font-bold uppercase">Total Ventas (USD)</p>
                <p className="text-2xl font-black text-white">{fmt(statsVentas.totalUSD, 'USD')}</p>
              </div>
              <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-xl">
                <p className="text-[10px] text-emerald-500 font-bold uppercase">Total Ventas (VES)</p>
                <p className="text-2xl font-black text-white">{fmt(statsVentas.totalVES, 'VES')}</p>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>ID Venta</th><th>Fecha</th><th>Cliente</th><th>Método</th><th>Total USD</th><th>Total VES</th></tr>
              </thead>
              <tbody>
                {filteredVentas.map(v => (
                  <tr key={v.id}>
                    <td className="font-mono text-[10px]">{v.id.substring(0,8)}</td>
                    <td>{v.fechaStr}</td>
                    <td>{v.cliente?.nombre || 'General'}</td>
                    <td><span className={`badge badge-${v.metodo}`}>{v.metodo.toUpperCase()}</span></td>
                    <td className="font-bold">{fmt(v.total, 'USD')}</td>
                    <td className="text-muted">{fmt(v.totalVES, 'VES')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'compras' && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl">
                <p className="text-[10px] text-red-500 font-bold uppercase">Total Compras (USD)</p>
                <p className="text-2xl font-black text-white">{fmt(statsCompras.totalUSD, 'USD')}</p>
              </div>
              <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl">
                <p className="text-[10px] text-red-500 font-bold uppercase">Total Compras (VES)</p>
                <p className="text-2xl font-black text-white">{fmt(statsCompras.totalVES, 'VES')}</p>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>N° Factura</th><th>Proveedor</th><th>Fecha</th><th>Tipo</th><th>Moneda</th><th>Total Original</th><th>Total VES</th></tr>
              </thead>
              <tbody>
                {filteredCompras.map(c => {
                  const prov = state.proveedores.find(p => p.id === c.proveedorId);
                  return (
                    <tr key={c.id}>
                      <td className="font-mono">{c.numeroFactura}</td>
                      <td>{prov?.nombre || '--'}</td>
                      <td>{c.fechaEmision}</td>
                      <td><span className="badge badge-general text-[9px]">{c.tipoFactura.replace('_', ' ')}</span></td>
                      <td>{c.moneda_original}</td>
                      <td className="font-bold">{fmt(c.monto_original, c.moneda_original)}</td>
                      <td className="text-muted">{fmt(c.monto_bolivares, 'VES')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'inventario' && (
          <div>
            <div className="mb-4 bg-[var(--bg3)] p-3 rounded-lg border border-[var(--border)] no-print">
              <p className="text-xs text-muted font-medium italic">Mostrando solo productos creados manualmente en el inventario real (excluyendo catálogo maestro).</p>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Código</th><th>Producto</th><th>Marca</th><th>Categoría</th><th>Costo ($)</th><th>Precio ($)</th><th>Stock</th><th>Valor Total ($)</th></tr>
              </thead>
              <tbody>
                {state.productos.map(p => (
                  <tr key={p.id}>
                    <td className="font-mono text-xs">{p.codigo}</td>
                    <td className="font-bold">{p.nombre}</td>
                    <td>{p.marca || '--'}</td>
                    <td><span className={`badge badge-${p.categoria}`}>{p.categoria}</span></td>
                    <td>{fmt(p.costo, 'USD')}</td>
                    <td className="text-[var(--accent)] font-bold">{fmt(p.precio, 'USD')}</td>
                    <td className={p.stock <= 5 ? 'text-red-500 font-bold' : ''}>{p.categoria === 'servicio' ? '--' : p.stock}</td>
                    <td className="font-mono">{p.categoria === 'servicio' ? '--' : fmt(p.costo * p.stock, 'USD')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'flujo' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[var(--bg3)] p-4 rounded-xl border border-[var(--border)]">
                <p className="text-[10px] text-muted uppercase font-bold">Ingresos VES</p>
                <p className="text-xl font-bold text-success">{fmt(statsVentas.totalVES, 'VES')}</p>
              </div>
              <div className="bg-[var(--bg3)] p-4 rounded-xl border border-[var(--border)]">
                <p className="text-[10px] text-muted uppercase font-bold">Ingresos USD</p>
                <p className="text-xl font-bold text-success">{fmt(statsVentas.totalUSD, 'USD')}</p>
              </div>
              <div className="bg-[var(--bg3)] p-4 rounded-xl border border-[var(--border)]">
                <p className="text-[10px] text-muted uppercase font-bold">Egresos VES</p>
                <p className="text-xl font-bold text-danger">{fmt(statsCompras.totalVES, 'VES')}</p>
              </div>
              <div className="bg-[var(--bg3)] p-4 rounded-xl border border-[var(--border)]">
                <p className="text-[10px] text-muted uppercase font-bold">Egresos USD</p>
                <p className="text-xl font-bold text-danger">{fmt(statsCompras.totalUSD, 'USD')}</p>
              </div>
            </div>

            <div className="bg-[var(--bg3)] rounded-xl border border-[var(--border)] p-6 text-center">
              <h3 className="text-lg font-bold mb-2">Balance Neto del Periodo</h3>
              <div className="flex justify-center gap-10">
                <div>
                  <p className="text-[10px] text-muted uppercase">Diferencia VES</p>
                  <p className={`text-3xl font-black ${statsVentas.totalVES - statsCompras.totalVES >= 0 ? 'text-success' : 'text-danger'}`}>
                    {fmt(statsVentas.totalVES - statsCompras.totalVES, 'VES')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted uppercase">Diferencia USD</p>
                  <p className={`text-3xl font-black ${statsVentas.totalUSD - statsCompras.totalUSD >= 0 ? 'text-success' : 'text-danger'}`}>
                    {fmt(statsVentas.totalUSD - statsCompras.totalUSD, 'USD')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseWindow>
  );
}

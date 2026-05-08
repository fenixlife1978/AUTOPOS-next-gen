
"use client";

import React, { useState, useEffect } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';

export default function AddInvoiceWindow() {
  const { state, setState, activeWindow, closeWindow, toast } = usePOS();
  
  const [formData, setFormData] = useState({
    proveedorId: '',
    numeroFactura: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    montoDolares: '',
    montoBolivares: '',
    tasaBCV: '40.00', // Ejemplo tasa
    tipoFactura: 'FISCAL_SENIAT' as any,
    esCredito: false
  });

  const handleSave = () => {
    if (!formData.proveedorId || !formData.numeroFactura || !formData.montoBolivares) {
      toast('Proveedor, factura y monto obligatorios', 'error');
      return;
    }

    const montoBs = parseFloat(formData.montoBolivares);
    
    const newInvoice = {
      id: state.nextCompraId,
      proveedorId: parseInt(formData.proveedorId),
      numeroFactura: formData.numeroFactura,
      fechaEmision: formData.fechaEmision,
      fechaVencimiento: formData.esCredito ? formData.fechaVencimiento : undefined,
      montoDolares: formData.montoDolares ? parseFloat(formData.montoDolares) : undefined,
      montoBolivares: montoBs,
      tasaBCV: formData.tasaBCV ? parseFloat(formData.tasaBCV) : undefined,
      tipoFactura: formData.tipoFactura,
      estadoPago: formData.esCredito ? 'pendiente' : 'pagada',
      totalPagado: formData.esCredito ? 0 : montoBs,
      saldoPendiente: formData.esCredito ? montoBs : 0,
      created_at: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      compras: [...prev.compras, newInvoice as any],
      nextCompraId: prev.nextCompraId + 1
    }));

    toast('Compra registrada', 'success');
    closeWindow();
  };

  return (
    <BaseWindow 
      id="agregarFactura" 
      title="Registrar Compra" 
      icon="fa-file-invoice" 
      width="480px"
      isOpen={activeWindow === 'agregarFactura'}
      onClose={closeWindow}
      footer={
        <>
          <button className="btn btn-secondary" onClick={closeWindow}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}><i className="fas fa-save"></i>Registrar</button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Proveedor *</label>
        <select className="form-select" value={formData.proveedorId} onChange={e => setFormData({...formData, proveedorId: e.target.value})}>
          <option value="">Seleccionar proveedor...</option>
          {state.proveedores.map(p => (
            <option key={p.id} value={p.id}>{p.nombre} ({p.rif})</option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">N° Factura *</label>
          <input type="text" className="form-input" value={formData.numeroFactura} onChange={e => setFormData({...formData, numeroFactura: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">Fecha Emisión *</label>
          <input type="date" className="form-input" value={formData.fechaEmision} onChange={e => setFormData({...formData, fechaEmision: e.target.value})} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Tipo de Documento</label>
        <select className="form-select" value={formData.tipoFactura} onChange={e => setFormData({...formData, tipoFactura: e.target.value as any})}>
          <option value="FISCAL_SENIAT">Fiscal SENIAT</option>
          <option value="NOTA_ENTREGA">Nota de Entrega</option>
        </select>
      </div>
      <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--border)' }}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Monto USD</label>
            <input type="number" className="form-input" value={formData.montoDolares} onChange={e => {
              const val = e.target.value;
              const bs = parseFloat(val) * parseFloat(formData.tasaBCV || '0');
              setFormData({...formData, montoDolares: val, montoBolivares: bs.toFixed(2)});
            }} />
          </div>
          <div className="form-group">
            <label className="form-label">Tasa BCV</label>
            <input type="number" className="form-input" value={formData.tasaBCV} onChange={e => setFormData({...formData, tasaBCV: e.target.value})} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Total en Bolívares *</label>
          <input type="number" className="form-input" value={formData.montoBolivares} onChange={e => setFormData({...formData, montoBolivares: e.target.value})} style={{ background: 'var(--bg2)', fontWeight: 700, color: 'var(--accent)' }} />
        </div>
      </div>
      <div className="form-group">
        <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
          <input type="checkbox" checked={formData.esCredito} onChange={e => setFormData({...formData, esCredito: e.target.checked})} />
          <span className="text-sm font-medium">¿Compra a Crédito?</span>
        </label>
      </div>
      {formData.esCredito && (
        <div className="form-group">
          <label className="form-label">Fecha de Vencimiento</label>
          <input type="date" className="form-input" value={formData.fechaVencimiento} onChange={e => setFormData({...formData, fechaVencimiento: e.target.value})} />
        </div>
      )}
    </BaseWindow>
  );
}

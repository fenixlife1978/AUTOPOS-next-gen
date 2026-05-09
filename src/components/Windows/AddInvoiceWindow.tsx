
"use client";

import React, { useState, useEffect } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import Image from 'next/image';
import { Moneda, FacturaTipo } from '@/lib/types';

export default function AddInvoiceWindow() {
  const { state, registrarFactura, activeWindow, closeWindow, toast, getTasaActual } = usePOS();
  
  const [formData, setFormData] = useState({
    proveedorId: '',
    numeroFactura: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    moneda_original: 'USD' as Moneda,
    monto_original: '',
    tasa_cambio: '',
    tasa_fuente: 'BCV',
    tipoFactura: 'FISCAL_SENIAT' as FacturaTipo,
    esCredito: false
  });

  const [imagenPreview, setImagenPreview] = useState<string | null>(null);

  useEffect(() => {
    if (formData.moneda_original !== 'VES') {
      const t = getTasaActual(formData.moneda_original);
      setFormData(prev => ({ ...prev, tasa_cambio: t.toString() }));
    } else {
      setFormData(prev => ({ ...prev, tasa_cambio: '1' }));
    }
  }, [formData.moneda_original, getTasaActual]);

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const reader = new FileReader();
      reader.onloadend = () => setImagenPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.proveedorId || !formData.numeroFactura || !formData.monto_original) {
      toast('Campos obligatorios incompletos', 'error');
      return;
    }

    const montoOrig = parseFloat(formData.monto_original);
    const tasa = parseFloat(formData.tasa_cambio) || 1;
    const montoVES = montoOrig * tasa;

    registrarFactura({
      proveedorId: parseInt(formData.proveedorId),
      numeroFactura: formData.numeroFactura,
      fechaEmision: formData.fechaEmision,
      fechaVencimiento: formData.esCredito ? formData.fechaVencimiento : undefined,
      moneda_original: formData.moneda_original,
      monto_original: montoOrig,
      monto_bolivares: montoVES,
      tasa_cambio_usada: tasa,
      tasa_fuente: formData.tasa_fuente,
      tipoFactura: formData.tipoFactura,
      imagenUrl: imagenPreview || undefined
    });

    closeWindow();
  };

  return (
    <BaseWindow 
      id="agregarFactura" 
      title="Registrar Factura de Compra" 
      icon="fa-file-invoice" 
      width="520px"
      isOpen={activeWindow === 'agregarFactura'}
      onClose={closeWindow}
      footer={
        <>
          <button className="btn btn-secondary" onClick={closeWindow}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}><i className="fas fa-save"></i>Guardar Factura</button>
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
        <label className="form-label">Tipo de Comprobante</label>
        <select className="form-select" value={formData.tipoFactura} onChange={e => setFormData({...formData, tipoFactura: e.target.value as FacturaTipo})}>
          <option value="FISCAL_SENIAT">Factura Fiscal (SENIAT)</option>
          <option value="FACTURA_SIMPLE">Factura Simple</option>
          <option value="NOTA_ENTREGA">Nota de Entrega</option>
          <option value="RECIBO">Recibo</option>
        </select>
      </div>

      <div style={{ background: 'var(--bg)', padding: '15px', borderRadius: '10px', marginBottom: '15px', border: '1px solid var(--border)' }}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Moneda</label>
            <select className="form-select" value={formData.moneda_original} onChange={e => setFormData({...formData, moneda_original: e.target.value as Moneda})}>
              <option value="VES">Bolívares (VES)</option>
              <option value="USD">Dólares (USD)</option>
              <option value="EUR">Euros (EUR)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Monto Original</label>
            <input type="number" className="form-input" value={formData.monto_original} onChange={e => setFormData({...formData, monto_original: e.target.value})} style={{ fontWeight: 700, color: 'var(--accent)' }} />
          </div>
        </div>
        {formData.moneda_original !== 'VES' && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tasa de Cambio</label>
              <input type="number" className="form-input" value={formData.tasa_cambio} onChange={e => setFormData({...formData, tasa_cambio: e.target.value, tasa_fuente: 'MANUAL'})} />
            </div>
            <div className="form-group">
              <label className="form-label">Fuente</label>
              <input type="text" className="form-input" value={formData.tasa_fuente} readOnly style={{ background: 'transparent', border: 'none' }} />
            </div>
          </div>
        )}
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

      <div className="form-group">
        <label className="form-label">Imagen de la Factura (JPG/PNG)</label>
        <input type="file" className="form-input" accept="image/*" onChange={handleImagenChange} />
        {imagenPreview && (
          <div className="mt-2" style={{ position: 'relative', height: '120px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <Image src={imagenPreview} alt="Preview" fill style={{ objectFit: 'contain' }} />
          </div>
        )}
      </div>
    </BaseWindow>
  );
}

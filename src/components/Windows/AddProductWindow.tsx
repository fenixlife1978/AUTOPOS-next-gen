
"use client";

import React, { useState, useEffect } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { calcularPrecio as calcFinal } from '@/lib/posLogic';

export default function AddProductWindow() {
  const { state, setState, activeWindow, closeWindow, editingProduct, toast } = usePOS();
  
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'lubricante',
    codigo: '',
    costo: 0,
    ganancia: 0,
    iva: 16,
    precio: 0,
    stock: 0,
    unidad: 'pieza',
    desc: ''
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        nombre: editingProduct.nombre,
        categoria: editingProduct.categoria,
        codigo: editingProduct.codigo,
        costo: editingProduct.costo,
        ganancia: editingProduct.porcentajeGanancia || 0,
        iva: editingProduct.porcentajeIVA || 16,
        precio: editingProduct.precio,
        stock: editingProduct.categoria === 'servicio' ? 0 : editingProduct.stock,
        unidad: editingProduct.unidad,
        desc: editingProduct.desc || ''
      });
    } else {
      setFormData({
        nombre: '',
        categoria: 'lubricante',
        codigo: '',
        costo: 0,
        ganancia: 0,
        iva: 16,
        precio: 0,
        stock: 0,
        unidad: 'pieza',
        desc: ''
      });
    }
  }, [editingProduct, activeWindow]);

  const handleCalc = () => {
    const p = calcFinal(formData.costo, formData.ganancia, formData.iva);
    setFormData(prev => ({ ...prev, precio: parseFloat(p.toFixed(2)) }));
  };

  const handleSave = () => {
    if (!formData.nombre || !formData.codigo) {
      toast('Nombre y código obligatorios', 'error');
      return;
    }

    const data = {
      ...formData,
      porcentajeGanancia: formData.ganancia,
      porcentajeIVA: formData.iva,
      stock: formData.categoria === 'servicio' ? 999 : formData.stock,
      icon: { lubricante: 'fa-bottle-droplet', repuesto: 'fa-gear', servicio: 'fa-wrench' }[formData.categoria] || 'fa-box'
    };

    setState(prev => {
      if (editingProduct) {
        return {
          ...prev,
          productos: prev.productos.map(p => p.id === editingProduct.id ? { ...p, ...data } : p)
        };
      } else {
        return {
          ...prev,
          productos: [...prev.productos, { ...data as any, id: prev.nextProdId }],
          nextProdId: prev.nextProdId + 1
        };
      }
    });

    toast(editingProduct ? 'Actualizado' : 'Agregado', 'success');
    closeWindow();
  };

  return (
    <BaseWindow 
      id="agregarProducto" 
      title={editingProduct ? 'Editar Producto' : 'Agregar Producto'} 
      icon="fa-plus-circle" 
      width="480px"
      isOpen={activeWindow === 'agregarProducto'}
      onClose={closeWindow}
      footer={
        <>
          <button className="btn btn-secondary" onClick={closeWindow}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}><i className="fas fa-save"></i>Guardar</button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Nombre del producto/servicio</label>
        <input type="text" className="form-input" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Categoría</label>
          <select className="form-select" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value as any})}>
            <option value="lubricante">Lubricante</option>
            <option value="repuesto">Repuesto</option>
            <option value="servicio">Servicio</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Código/SKU</label>
          <input type="text" className="form-input" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} />
        </div>
      </div>
      <div style={{ background: 'var(--bg)', padding: '8px', borderRadius: '6px', marginBottom: '12px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, marginBottom: '8px' }}><i className="fas fa-calculator"></i> CÁLCULO DE PRECIO AUTOMÁTICO</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Costo Inicial ($)</label>
            <input type="number" className="form-input" value={formData.costo} onChange={e => setFormData({...formData, costo: parseFloat(e.target.value) || 0})} onBlur={handleCalc} />
          </div>
          <div className="form-group">
            <label className="form-label">% Ganancia</label>
            <input type="number" className="form-input" value={formData.ganancia} onChange={e => setFormData({...formData, ganancia: parseFloat(e.target.value) || 0})} onBlur={handleCalc} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">% IVA</label>
            <input type="number" className="form-input" value={formData.iva} onChange={e => setFormData({...formData, iva: parseFloat(e.target.value) || 0})} onBlur={handleCalc} />
          </div>
          <div className="form-group">
            <label className="form-label">Precio Venta Final ($)</label>
            <input type="number" className="form-input" value={formData.precio} onChange={e => setFormData({...formData, precio: parseFloat(e.target.value) || 0})} style={{ background: 'var(--bg3)', borderColor: 'var(--accent)', fontWeight: 700, color: 'var(--accent)', fontFamily: 'Space Grotesk' }} />
          </div>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Stock</label>
          <input type="number" className="form-input" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} disabled={formData.categoria === 'servicio'} />
        </div>
        <div className="form-group">
          <label className="form-label">Unidad</label>
          <select className="form-select" value={formData.unidad} onChange={e => setFormData({...formData, unidad: e.target.value})}>
            <option value="pieza">Pieza</option>
            <option value="litro">Litro</option>
            <option value="galón">Galón</option>
            <option value="servicio">Servicio</option>
            <option value="juego">Juego</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Descripción</label>
        <textarea className="form-textarea" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})}></textarea>
      </div>
    </BaseWindow>
  );
}

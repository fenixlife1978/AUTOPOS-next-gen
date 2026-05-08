
"use client";

import React, { useState, useEffect } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';

export default function AddSupplierWindow() {
  const { state, setState, activeWindow, closeWindow, editingSupplier, toast } = usePOS();
  
  const [formData, setFormData] = useState({
    nombre: '',
    rif: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
    categoria: 'lubricante' as any,
    notas: ''
  });

  useEffect(() => {
    if (editingSupplier) {
      setFormData({
        nombre: editingSupplier.nombre,
        rif: editingSupplier.rif || '',
        contacto: editingSupplier.contacto || '',
        telefono: editingSupplier.telefono || '',
        email: editingSupplier.email || '',
        direccion: editingSupplier.direccion || '',
        categoria: editingSupplier.categoria,
        notas: editingSupplier.notas || ''
      });
    } else {
      setFormData({
        nombre: '',
        rif: '',
        contacto: '',
        telefono: '',
        email: '',
        direccion: '',
        categoria: 'lubricante',
        notas: ''
      });
    }
  }, [editingSupplier, activeWindow]);

  const handleSave = () => {
    if (!formData.nombre) {
      toast('Nombre obligatorio', 'error');
      return;
    }

    setState(prev => {
      if (editingSupplier) {
        return {
          ...prev,
          proveedores: prev.proveedores.map(p => p.id === editingSupplier.id ? { ...p, ...formData } : p)
        };
      } else {
        return {
          ...prev,
          proveedores: [...prev.proveedores, { ...formData, id: prev.nextProvId }],
          nextProvId: prev.nextProvId + 1
        };
      }
    });

    toast(editingSupplier ? 'Actualizado' : 'Agregado', 'success');
    closeWindow();
  };

  return (
    <BaseWindow 
      id="agregarProveedor" 
      title={editingSupplier ? 'Editar Proveedor' : 'Agregar Proveedor'} 
      icon="fa-truck" 
      width="460px"
      isOpen={activeWindow === 'agregarProveedor'}
      onClose={closeWindow}
      footer={
        <>
          <button className="btn btn-secondary" onClick={closeWindow}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}><i className="fas fa-save"></i>Guardar</button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Razón Social *</label>
        <input type="text" className="form-input" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="Ej. Distribuidora Polar" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">RIF</label>
          <input type="text" className="form-input" value={formData.rif} onChange={e => setFormData({...formData, rif: e.target.value})} placeholder="J-0000000-0" />
        </div>
        <div className="form-group">
          <label className="form-label">Categoría</label>
          <select className="form-select" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value as any})}>
            <option value="lubricante">Lubricantes</option>
            <option value="repuesto">Repuestos</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Contacto</label>
          <input type="text" className="form-input" value={formData.contacto} onChange={e => setFormData({...formData, contacto: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">Teléfono</label>
          <input type="text" className="form-input" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Correo</label>
        <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
      </div>
      <div className="form-group">
        <label className="form-label">Dirección</label>
        <input type="text" className="form-input" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
      </div>
      <div className="form-group">
        <label className="form-label">Notas</label>
        <textarea className="form-textarea" value={formData.notas} onChange={e => setFormData({...formData, notas: e.target.value})}></textarea>
      </div>
    </BaseWindow>
  );
}

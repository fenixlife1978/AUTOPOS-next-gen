
"use client";

import React, { useState, useEffect } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';

export default function AddClientWindow() {
  const { state, setState, activeWindow, closeWindow, editingClient, toast } = usePOS();
  
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    placa: '',
    vehiculo: '',
    notas: ''
  });

  useEffect(() => {
    if (editingClient) {
      setFormData({
        nombre: editingClient.nombre,
        telefono: editingClient.telefono || '',
        email: editingClient.email || '',
        direccion: editingClient.direccion || '',
        placa: editingClient.placa || '',
        vehiculo: editingClient.vehiculo || '',
        notas: editingClient.notas || ''
      });
    } else {
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
        placa: '',
        vehiculo: '',
        notas: ''
      });
    }
  }, [editingClient, activeWindow]);

  const handleSave = () => {
    if (!formData.nombre) {
      toast('Nombre obligatorio', 'error');
      return;
    }

    setState(prev => {
      if (editingClient) {
        return {
          ...prev,
          clientes: prev.clientes.map(c => c.id === editingClient.id ? { ...c, ...formData } : c)
        };
      } else {
        return {
          ...prev,
          clientes: [...prev.clientes, { ...formData, id: prev.nextCliId }],
          nextCliId: prev.nextCliId + 1
        };
      }
    });

    toast(editingClient ? 'Actualizado' : 'Agregado', 'success');
    closeWindow();
  };

  return (
    <BaseWindow 
      id="agregarCliente" 
      title={editingClient ? 'Editar Cliente' : 'Agregar Cliente'} 
      icon="fa-user-plus" 
      width="440px"
      isOpen={activeWindow === 'agregarCliente'}
      onClose={closeWindow}
      footer={
        <>
          <button className="btn btn-secondary" onClick={closeWindow}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}><i className="fas fa-save"></i>Guardar</button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Nombre completo</label>
        <input type="text" className="form-input" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Teléfono</label>
          <input type="text" className="form-input" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">Correo</label>
          <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Dirección</label>
        <input type="text" className="form-input" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Placa</label>
          <input type="text" className="form-input" value={formData.placa} onChange={e => setFormData({...formData, placa: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">Vehículo</label>
          <input type="text" className="form-input" value={formData.vehiculo} onChange={e => setFormData({...formData, vehiculo: e.target.value})} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Notas</label>
        <textarea className="form-textarea" value={formData.notas} onChange={e => setFormData({...formData, notas: e.target.value})}></textarea>
      </div>
    </BaseWindow>
  );
}

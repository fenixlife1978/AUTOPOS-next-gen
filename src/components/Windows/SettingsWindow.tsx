
"use client";

import React, { useState, useEffect } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { Settings, Save, Store, CreditCard, MapPin, Phone, Mail, Lock, LogOut } from 'lucide-react';

export default function SettingsWindow() {
  const { state, updateBusinessSettings, activeWindow, closeWindow, lockModule } = usePOS();
  
  const [formData, setFormData] = useState({
    nombre: '',
    rif: '',
    direccion: '',
    telefono: '',
    email: '',
    adminPin: ''
  });

  useEffect(() => {
    if (state.settings) {
      setFormData(state.settings);
    }
  }, [state.settings, activeWindow]);

  const handleSave = () => {
    updateBusinessSettings(formData);
    closeWindow();
  };

  return (
    <BaseWindow 
      id="configuracion" 
      title="Configuración del Negocio" 
      icon="fa-gears" 
      width="480px"
      isOpen={activeWindow === 'configuracion'}
      onClose={closeWindow}
      footer={
        <div className="flex justify-between w-full">
          <button className="btn btn-danger btn-sm gap-2" onClick={() => lockModule('configuracion')}>
            <LogOut size={14} /> SALIR Y BLOQUEAR
          </button>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={closeWindow}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Guardar</button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-[10px] text-muted font-bold uppercase tracking-widest border-b border-[var(--border)] pb-1 mb-4">Información Fiscal y de Contacto</p>
        
        <div className="form-group">
          <label className="form-label flex items-center gap-2"><Store size={12} /> Nombre del Negocio</label>
          <input 
            type="text" 
            className="form-input" 
            value={formData.nombre} 
            onChange={e => setFormData({...formData, nombre: e.target.value})} 
            placeholder="Ej: Repuestos El Tunal C.A."
          />
        </div>

        <div className="form-group">
          <label className="form-label flex items-center gap-2"><CreditCard size={12} /> R.I.F.</label>
          <input 
            type="text" 
            className="form-input font-mono" 
            value={formData.rif} 
            onChange={e => setFormData({...formData, rif: e.target.value})} 
            placeholder="J-00000000-0"
          />
        </div>

        <div className="form-group">
          <label className="form-label flex items-center gap-2"><MapPin size={12} /> Dirección Fiscal</label>
          <textarea 
            className="form-textarea h-20" 
            value={formData.direccion} 
            onChange={e => setFormData({...formData, direccion: e.target.value})} 
            placeholder="Av. 20 entre calles 10 y 11..."
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="form-label flex items-center gap-2"><Phone size={12} /> Teléfono</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.telefono} 
              onChange={e => setFormData({...formData, telefono: e.target.value})} 
              placeholder="0414-0000000"
            />
          </div>
          <div className="form-group">
            <label className="form-label flex items-center gap-2"><Mail size={12} /> Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              placeholder="info@negocio.com"
            />
          </div>
        </div>

        <p className="text-[10px] text-muted font-bold uppercase tracking-widest border-b border-[var(--border)] pb-1 mt-6 mb-4">Seguridad de Acceso</p>
        
        <div className="form-group">
          <label className="form-label flex items-center gap-2"><Lock size={12} /> PIN Administrativo (6 dígitos)</label>
          <input 
            type="password" 
            maxLength={6}
            className="form-input font-mono tracking-widest text-center text-lg" 
            value={formData.adminPin} 
            onChange={e => setFormData({...formData, adminPin: e.target.value.replace(/\D/g, '')})} 
            placeholder="******"
          />
          <p className="text-[10px] text-muted mt-1 italic">Clave requerida para Reportes, Contabilidad y esta Configuración.</p>
        </div>
      </div>
    </BaseWindow>
  );
}

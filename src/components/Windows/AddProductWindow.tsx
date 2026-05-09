
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { calcularPrecio as calcFinal } from '@/lib/posLogic';
import { getAutomotiveCatalog, CatalogItem, isCatalogLoading } from '@/lib/automotive-catalog';
import { Search, Plus, Check, Info, Loader2 } from 'lucide-react';

export default function AddProductWindow() {
  const { state, setState, activeWindow, closeWindow, editingProduct, toast, addCustomCategory } = usePOS();
  
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
    desc: '',
    marca: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showCatalog, setShowCatalog] = useState(false);
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  
  const catalogRef = useRef<HTMLDivElement>(null);

  const catalog = getAutomotiveCatalog();
  const loading = isCatalogLoading();

  const filteredCatalog = useMemo(() => {
    if (searchQuery.length < 2 || catalog.length === 0) return [];
    const q = searchQuery.toLowerCase();
    return catalog.filter(item => 
      item.nombre.toLowerCase().includes(q) ||
      item.marca.toLowerCase().includes(q)
    ).slice(0, 500); 
  }, [catalog, searchQuery]);

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
        desc: editingProduct.desc || '',
        marca: editingProduct.marca || ''
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
        desc: '',
        marca: ''
      });
    }
  }, [editingProduct, activeWindow]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catalogRef.current && !catalogRef.current.contains(event.target as Node)) {
        setShowCatalog(false);
      }
    };
    if (showCatalog) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCatalog]);

  const generateSKU = (catName: string) => {
    const prefix = catName.substring(0, 3).toUpperCase();
    const count = state.productos.filter(p => p.categoria === catName).length + 1;
    return `${prefix}-${String(count).padStart(3, '0')}`;
  };

  const handleCategoryChange = (val: string) => {
    if (val === 'OTRA') {
      setShowNewCatModal(true);
    } else {
      setFormData(prev => ({ 
        ...prev, 
        categoria: val, 
        codigo: generateSKU(val) 
      }));
    }
  };

  const handleAddNewCategory = () => {
    if (!newCatName) return;
    addCustomCategory(newCatName);
    setFormData(prev => ({ 
      ...prev, 
      categoria: newCatName,
      codigo: generateSKU(newCatName)
    }));
    setShowNewCatModal(false);
    setNewCatName('');
  };

  const selectFromCatalog = (item: CatalogItem) => {
    setFormData(prev => ({
      ...prev,
      nombre: item.nombre,
      categoria: item.categoria,
      marca: item.marca,
      unidad: item.unidad,
      codigo: generateSKU(item.categoria)
    }));
    setShowCatalog(false);
    setSearchQuery('');
  };

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
      icon: { motor: 'fa-cog', transmision: 'fa-circle-dot', frenos: 'fa-disc-brake', suspension: 'fa-arrows-up-down', electrico: 'fa-bolt', lubricante: 'fa-bottle-droplet', servicio: 'fa-wrench' }[formData.categoria] || 'fa-box'
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
      title={editingProduct ? 'Editar Producto' : 'Nuevo Producto / Servicio'} 
      icon="fa-plus-circle" 
      width="520px"
      isOpen={activeWindow === 'agregarProducto'}
      onClose={closeWindow}
      footer={
        <>
          <button className="btn btn-secondary" onClick={closeWindow}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} title="Guardar cambios permanentemente"><i className="fas fa-save"></i>Guardar</button>
        </>
      }
    >
      <div className="mb-4 bg-[var(--bg3)] p-3 rounded-lg border border-[var(--border)]" ref={catalogRef}>
        <label className="form-label text-[var(--accent)] font-bold mb-2 flex items-center gap-2">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} 
          BUSCADOR INTELIGENTE {catalog.length > 0 ? `(+${catalog.length} items)` : '(Cargando...)'}
        </label>
        <div className="relative">
          <input 
            type="text" 
            className="form-input" 
            placeholder={loading ? "Cargando base de datos en RAM..." : "Buscar en catálogo real (ej: Bujía, Amortiguador, Aceite...)"}
            value={searchQuery}
            disabled={loading}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowCatalog(true);
            }}
          />
          {showCatalog && filteredCatalog.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-[100] mt-1 bg-[var(--bg2)] border border-[var(--border)] rounded-lg shadow-2xl max-h-60 overflow-y-auto">
              <div className="p-2 text-[10px] text-muted border-b border-[var(--border)] flex justify-between">
                <span>MOSTRANDO {filteredCatalog.length} RESULTADOS</span>
                <span className="flex items-center gap-1"><Info size={10} /> Seleccione para autocompletar</span>
              </div>
              {filteredCatalog.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-2 hover:bg-[var(--bg4)] cursor-pointer flex justify-between items-center border-b border-[var(--border)]/50 transition-colors"
                  onClick={() => selectFromCatalog(item)}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[var(--fg)]">{item.nombre}</span>
                    <span className="text-[10px] text-muted">{item.marca} | Categoría: {item.categoria.toUpperCase()}</span>
                  </div>
                  <Plus size={12} className="text-[var(--accent)]" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Nombre del producto/servicio</label>
        <input type="text" className="form-input" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} title="Nombre oficial del producto para factura" />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Categoría</label>
          <select 
            className="form-select" 
            value={formData.categoria} 
            onChange={e => handleCategoryChange(e.target.value)}
            title="Seleccione una categoría o cree una nueva"
          >
            <option value="motor">Motor</option>
            <option value="transmision">Transmisión</option>
            <option value="frenos">Frenos</option>
            <option value="suspension">Suspensión</option>
            <option value="electrico">Eléctrico</option>
            <option value="lubricante">Lubricante</option>
            <option value="servicio">Servicio</option>
            {state.customCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="OTRA" className="font-bold text-[var(--accent)]">+ Nueva Categoría...</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Código / SKU (Auto)</label>
          <input type="text" className="form-input font-mono" value={formData.codigo} readOnly style={{ background: 'var(--bg3)', color: 'var(--muted)' }} title="SKU generado automáticamente" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Marca de Fábrica</label>
          <input type="text" className="form-input" value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})} placeholder="Ej: Motul, Denso..." title="Marca del fabricante" />
        </div>
        <div className="form-group">
          <label className="form-label">Unidad de Medida</label>
          <select className="form-select" value={formData.unidad} onChange={e => setFormData({...formData, unidad: e.target.value})}>
            <option value="pieza">Pieza</option>
            <option value="litro">Litro</option>
            <option value="galón">Galón</option>
            <option value="servicio">Servicio</option>
            <option value="juego">Juego</option>
          </select>
        </div>
      </div>

      <div className="bg-[var(--bg)] p-3 rounded-lg border border-[var(--border)] mb-3">
        <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, marginBottom: '8px' }}><i className="fas fa-calculator"></i> CONFIGURACIÓN DE PRECIOS</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Costo ($)</label>
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
            <label className="form-label">Venta Final ($)</label>
            <input type="number" className="form-input font-bold text-[var(--accent)]" value={formData.precio} onChange={e => setFormData({...formData, precio: parseFloat(e.target.value) || 0})} style={{ background: 'var(--bg3)' }} />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Stock Actual</label>
        <input type="number" className="form-input" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} disabled={formData.categoria === 'servicio'} title="Cantidad física disponible en almacén" />
      </div>

      {showNewCatModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg2)] p-6 rounded-xl border border-[var(--border)] w-full max-w-xs shadow-2xl">
            <h4 className="font-bold mb-4 flex items-center gap-2 text-sm"><Plus size={16} /> Crear Nueva Categoría</h4>
            <input 
              className="form-input mb-4" 
              placeholder="Nombre (ej: Frenos)" 
              value={newCatName} 
              onChange={e => setNewCatName(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <button className="btn btn-secondary flex-1" onClick={() => setShowNewCatModal(false)}>Cancelar</button>
              <button className="btn btn-primary flex-1" onClick={handleAddNewCategory}>Crear</button>
            </div>
          </div>
        </div>
      )}
    </BaseWindow>
  );
}

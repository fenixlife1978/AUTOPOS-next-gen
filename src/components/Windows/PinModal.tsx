
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { usePOS } from '../POSContext';
import { Lock, ShieldCheck, X, Delete } from 'lucide-react';

export default function PinModal() {
  const { isPinModalOpen, setIsPinModalOpen, pendingAdminWindow, setPendingAdminWindow, openWindow, state, toast } = usePOS();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isPinModalOpen) {
      setPin('');
      setError(false);
    }
  }, [isPinModalOpen]);

  const verify = useCallback((inputPin: string) => {
    if (inputPin === state.settings.adminPin) {
      setIsPinModalOpen(false);
      if (pendingAdminWindow) {
        openWindow(pendingAdminWindow);
        setPendingAdminWindow(null);
      }
      toast('Acceso concedido', 'success');
    } else {
      setError(true);
      setPin('');
      toast('PIN incorrecto', 'error');
    }
  }, [state.settings.adminPin, pendingAdminWindow, openWindow, setIsPinModalOpen, setPendingAdminWindow, toast]);

  const handleKeyPress = useCallback((num: string) => {
    setPin(prev => {
      if (prev.length < 6) {
        const newPin = prev + num;
        if (newPin.length === 6) {
          verify(newPin);
        }
        return newPin;
      }
      return prev;
    });
  }, [verify]);

  const handleBackspace = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  }, []);

  const closeModal = useCallback(() => {
    setIsPinModalOpen(false);
    setPendingAdminWindow(null);
  }, [setIsPinModalOpen, setPendingAdminWindow]);

  // Soporte para teclado físico
  useEffect(() => {
    if (!isPinModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Capturar números 0-9
      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        handleKeyPress(e.key);
      }
      // Capturar borrar
      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      }
      // Capturar cerrar
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPinModalOpen, handleKeyPress, handleBackspace, closeModal]);

  if (!isPinModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl w-full max-w-[320px] p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-[var(--accent)]">
            <ShieldCheck size={20} />
            <span className="font-bold font-headline text-sm uppercase tracking-wider">Acceso Restringido</span>
          </div>
          <button onClick={closeModal} className="text-muted hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full border-2 transition-all duration-200 ${
                  pin.length > i 
                    ? 'bg-[var(--accent)] border-[var(--accent)] scale-110' 
                    : error ? 'border-red-500 animate-shake' : 'border-[var(--border)]'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted uppercase font-bold tracking-widest">Ingrese PIN de 6 dígitos</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(n => (
            <button 
              key={n} 
              onClick={() => handleKeyPress(n)}
              className="h-14 bg-[var(--bg3)] hover:bg-[var(--bg4)] border border-[var(--border)] rounded-xl text-xl font-bold font-headline flex items-center justify-center transition-all active:scale-95"
            >
              {n}
            </button>
          ))}
          <div className="flex items-center justify-center">
            {/* Espacio vacío */}
          </div>
          <button 
            onClick={() => handleKeyPress('0')}
            className="h-14 bg-[var(--bg3)] hover:bg-[var(--bg4)] border border-[var(--border)] rounded-xl text-xl font-bold font-headline flex items-center justify-center active:scale-95"
          >
            0
          </button>
          <button 
            onClick={handleBackspace}
            className="h-14 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-500 flex items-center justify-center active:scale-95"
          >
            <Delete size={20} />
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[10px] text-muted italic">Módulo: {pendingAdminWindow?.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}

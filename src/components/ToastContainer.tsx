
"use client";

import React from 'react';
import { usePOS } from './POSContext';

export default function ToastContainer() {
  const { toasts } = usePOS();

  return (
    <div className="toast-container">
      {toasts.map((t) => {
        const icon = t.type === 'success' ? 'fa-check-circle' : t.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
        const color = t.type === 'success' ? 'var(--success)' : t.type === 'error' ? 'var(--danger)' : 'var(--info)';
        
        return (
          <div key={t.id} className={`toast ${t.type}`}>
            <i className={`fas ${icon}`} style={{ color }}></i>
            {t.msg}
          </div>
        );
      })}
    </div>
  );
}

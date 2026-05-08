
"use client";

import React, { useEffect } from 'react';

interface Props {
  id: string;
  title: string;
  icon: string;
  width?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export default function BaseWindow({ id, title, icon, width = '440px', children, footer, isOpen, onClose }: Props) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const style: React.CSSProperties = {
    width: width,
    maxWidth: '95vw',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 5001,
  };

  return (
    <div className="window-overlay show" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        id={`win-${id}`} 
        className="app-window" 
        style={style} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="win-titlebar" style={{ cursor: 'default' }}>
          <i className={`fas ${icon}`}></i>
          <span>{title}</span>
          <button className="win-btn close" onClick={onClose} aria-label="Cerrar">
            <i className="fas fa-xmark"></i>
          </button>
        </div>
        <div className="win-body" style={{ overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
        {footer && (
          <div className="win-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

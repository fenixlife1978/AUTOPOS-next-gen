
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
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    boxShadow: '0 25px 70px rgba(0,0,0,0.8)',
    overflow: 'hidden'
  };

  return (
    <div 
      className="window-overlay show" 
      onClick={onClose} 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.6)', 
        backdropFilter: 'blur(3px)',
        zIndex: 5000,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
    >
      <div 
        id={`win-${id}`} 
        style={style} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="win-titlebar" style={{ 
          height: '40px', 
          background: 'var(--bg3)', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 12px', 
          gap: '10px',
          borderBottom: '1px solid var(--border)',
          cursor: 'default',
          flexShrink: 0
        }}>
          <i className={`fas ${icon}`} style={{ color: 'var(--accent)' }}></i>
          <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, fontFamily: 'Space Grotesk' }}>{title}</span>
          <button className="win-btn close" onClick={onClose} style={{ 
            width: '24px', height: '24px', border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer' 
          }}>
            <i className="fas fa-xmark"></i>
          </button>
        </div>
        <div className="win-body" style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
          {children}
        </div>
        {footer && (
          <div className="win-footer" style={{ 
            padding: '12px 20px', 
            borderTop: '1px solid var(--border)', 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '10px',
            flexShrink: 0 
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

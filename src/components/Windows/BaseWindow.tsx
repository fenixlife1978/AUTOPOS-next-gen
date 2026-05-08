
"use client";

import React, { useRef } from 'react';

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
  const windowRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const style: React.CSSProperties = {
    display: 'flex',
    width: width,
    maxWidth: '95vw',
    maxHeight: '90vh',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    position: 'fixed',
  };

  return (
    <div id={`win-${id}`} className="app-window" style={style} ref={windowRef}>
      <div className="win-titlebar">
        <i className={`fas ${icon}`}></i>
        <span>{title}</span>
        <button className="win-btn close" onClick={onClose} aria-label="Cerrar">
          <i className="fas fa-xmark"></i>
        </button>
      </div>
      <div className="win-body">
        {children}
      </div>
      {footer && (
        <div className="win-footer">
          {footer}
        </div>
      )}
    </div>
  );
}

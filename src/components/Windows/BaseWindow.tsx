
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePOS } from '../POSContext';

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
  const [position, setPosition] = useState<{ x: string, y: string }>({ x: '50%', y: '80px' });
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.win-btn')) return;
    
    setIsDragging(true);
    const rect = windowRef.current!.getBoundingClientRect();
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - offsetRef.current.x;
      const newY = e.clientY - offsetRef.current.y;
      
      setPosition({
        x: `${newX}px`,
        y: `${newY}px`
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const style: React.CSSProperties = {
    display: 'flex',
    width: width,
    top: position.y,
    left: position.x,
    transform: position.x === '50%' ? 'translateX(-50%)' : 'none'
  };

  return (
    <div id={`win-${id}`} className="app-window" style={style} ref={windowRef}>
      <div className="win-titlebar" onMouseDown={handleMouseDown}>
        <i className={`fas ${icon}`}></i>
        <span>{title}</span>
        <button className="win-btn close" onClick={onClose}><i className="fas fa-xmark"></i></button>
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

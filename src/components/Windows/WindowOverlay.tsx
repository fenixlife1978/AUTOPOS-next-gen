
"use client";

import React from 'react';
import { usePOS } from '../POSContext';

export default function WindowOverlay() {
  const { activeWindow, closeWindow } = usePOS();
  
  if (!activeWindow) return null;

  return (
    <div className="window-overlay show" onClick={closeWindow}></div>
  );
}

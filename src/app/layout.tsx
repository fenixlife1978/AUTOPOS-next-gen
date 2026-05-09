"use client";

import './globals.css';
import { useEffect, useState } from 'react';
import { initializeFirebase } from '@/firebase';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function setup() {
      if (typeof window === 'undefined') return;
      
      try {
        // Inicializamos Firebase para que el sistema esté listo
        initializeFirebase();
        // El catálogo ahora se inicializa dentro del POSProvider en segundo plano
        setInitialized(true);
      } catch (e) {
        console.error('Error en inicialización:', e);
        setInitialized(true);
      }
    }
    setup();
  }, []);

  return (
    <html lang="es">
      <head>
        <title>AutoPOS v1 next-gen - Sistema de Ventas Automotriz</title>
        <meta name="description" content="Sistema POS profesional de próxima generación para talleres y refaccionarias automotrices." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body className="font-body antialiased">
        <div className="bg-glow bg-glow-1"></div>
        <div className="bg-glow bg-glow-2"></div>
        {initialized ? (
          children
        ) : (
          <div className="flex flex-col h-screen items-center justify-center bg-[#0c0c14] text-white">
            <div className="relative">
              <i className="fas fa-oil-can fa-bounce text-6xl text-[var(--accent)] mb-6"></i>
              <div className="absolute -bottom-2 -right-2 bg-[var(--bg)] p-1 rounded-full border border-[var(--accent)]/30">
                <i className="fas fa-gear fa-spin text-[var(--accent)] text-sm"></i>
              </div>
            </div>
            <h1 className="text-3xl font-bold font-headline mb-1 tracking-tight">AutoPOS <span className="text-[var(--accent)]">v1</span></h1>
            <p className="text-[12px] text-gray-400 uppercase tracking-[0.3em] font-medium">next-gen system</p>
            <div className="mt-8 flex items-center gap-2">
              <div className="w-1 h-1 bg-[var(--accent)] rounded-full animate-ping"></div>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest">Iniciando núcleo del sistema...</p>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}

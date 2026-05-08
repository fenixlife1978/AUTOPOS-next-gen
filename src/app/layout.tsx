
"use client";

import './globals.css';
import { useEffect, useState } from 'react';
import { initializeFirebase } from '@/firebase';
import { initCatalog } from '@/lib/automotive-catalog';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [initialized, setInitialized] = useState(false);
  const [progress, setProgress] = useState('Iniciando sistema...');

  useEffect(() => {
    async function setup() {
      if (typeof window === 'undefined') return;
      
      try {
        setProgress('Conectando con base de datos...');
        initializeFirebase();
        
        setProgress('Cargando catálogo maestro (+18,000 items)...');
        // Esto descarga una vez y cachea en disco permanentemente
        await initCatalog();
        
        setInitialized(true);
      } catch (e) {
        console.error('Error en inicialización:', e);
        // Permitimos continuar aunque el catálogo falle
        setInitialized(true);
      }
    }
    setup();
  }, []);

  return (
    <html lang="es">
      <head>
        <title>AutoPOS - Sistema de Ventas Automotriz</title>
        <meta name="description" content="Sistema POS profesional para talleres y refaccionarias automotrices." />
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
              <i className="fas fa-cog fa-spin text-5xl text-[var(--accent)] mb-4"></i>
              <i className="fas fa-car absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--accent)] text-xs"></i>
            </div>
            <h1 className="text-2xl font-bold font-headline mb-2 text-[var(--accent)]">AutoPOS Professional</h1>
            <div className="w-64 h-1 bg-[var(--bg3)] rounded-full overflow-hidden mt-4">
              <div className="h-full bg-[var(--accent)] animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-4 uppercase tracking-widest">{progress}</p>
          </div>
        )}
      </body>
    </html>
  );
}


"use client";

import type { Metadata } from 'next';
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
    initializeFirebase();
    setInitialized(true);
  }, []);

  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body className="font-body antialiased">
        <div className="bg-glow bg-glow-1"></div>
        <div className="bg-glow bg-glow-2"></div>
        {initialized ? children : <div className="flex h-screen items-center justify-center bg-[#0c0c14] text-white">Iniciando AutoPOS...</div>}
      </body>
    </html>
  );
}

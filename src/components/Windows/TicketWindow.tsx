
"use client";

import React from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { fmt } from '@/lib/posLogic';

export default function TicketWindow() {
  const { currentSaleForTicket, activeWindow, closeWindow } = usePOS();
  
  if (!currentSaleForTicket) return null;

  const handlePrint = () => {
    const content = document.getElementById('ticketContent')?.innerHTML;
    if (!content) return;
    const w = window.open('', '_blank', 'width=350,height=600');
    w?.document.write(`
      <html>
        <head>
          <title>Imprimir Ticket</title>
          <style>
            body { margin: 10px; font-family: 'Courier New', monospace; font-size: 12px; color: #000; background: #fff; }
            .ticket-line { display: flex; justify-content: space-between; padding: 1px 0; }
            .ticket-sep { border-top: 1px dashed #999; margin: 4px 0; }
            .ticket-total { font-size: 16px; font-weight: 700; }
            h4 { text-align: center; margin: 0; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    w?.document.close();
    setTimeout(() => w?.print(), 300);
  };

  return (
    <BaseWindow 
      id="ticket" 
      title="Ticket de Venta" 
      icon="fa-receipt" 
      width="380px"
      isOpen={activeWindow === 'ticket'}
      onClose={closeWindow}
      footer={
        <>
          <button className="btn btn-secondary" onClick={closeWindow}><i className="fas fa-xmark"></i>Cerrar</button>
          <button className="btn btn-primary" onClick={handlePrint}><i className="fas fa-print"></i>Imprimir</button>
        </>
      }
    >
      <div id="ticketContent" style={{ background: '#f5f5f5', padding: '10px' }}>
        <div className="ticket">
          <h4>AUTOPOS</h4>
          <div className="ticket-sep"></div>
          <div className="ticket-line">
            <span>Ticket #{String(currentSaleForTicket.id).padStart(5, '0')}</span>
            <span>{currentSaleForTicket.fechaStr} {currentSaleForTicket.horaStr}</span>
          </div>
          <div className="ticket-line">
            <span>Cliente:</span>
            <span>{currentSaleForTicket.cliente ? currentSaleForTicket.cliente.nombre : 'CLIENTE GENERAL'}</span>
          </div>
          <div className="ticket-line">
            <span>Método:</span>
            <span>{currentSaleForTicket.metodo.toUpperCase()}</span>
          </div>
          <div className="ticket-sep"></div>
          {currentSaleForTicket.items.map((item, idx) => (
            <React.Fragment key={idx}>
              <div className="ticket-line"><span>{item.cantidad}x {item.nombre}</span></div>
              <div className="ticket-line" style={{ justifyContent: 'flex-end' }}><span>{fmt(item.subtotal)}</span></div>
            </React.Fragment>
          ))}
          <div className="ticket-sep"></div>
          <div className="ticket-line"><span>Subtotal:</span><span>{fmt(currentSaleForTicket.subtotal)}</span></div>
          <div className="ticket-line"><span>IVA 16%:</span><span>{fmt(currentSaleForTicket.iva)}</span></div>
          <div className="ticket-line ticket-total" style={{ marginTop: '4px' }}><span>TOTAL:</span><span>{fmt(currentSaleForTicket.total)}</span></div>
          
          {currentSaleForTicket.metodo === 'efectivo' && (
            <>
              <div className="ticket-sep"></div>
              <div className="ticket-line"><span>Recibido:</span><span>{fmt(currentSaleForTicket.recibido)}</span></div>
              <div className="ticket-line"><span>Cambio:</span><span>{fmt(currentSaleForTicket.cambio)}</span></div>
            </>
          )}
          
          <div className="ticket-sep"></div>
          <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '8px' }}>Gracias por su compra</div>
        </div>
      </div>
    </BaseWindow>
  );
}

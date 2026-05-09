
"use client";

import React from 'react';
import { usePOS } from '../POSContext';
import BaseWindow from './BaseWindow';
import { fmt } from '@/lib/posLogic';

export default function TicketWindow() {
  const { currentSaleForTicket, activeWindow, closeWindow, state } = usePOS();
  
  if (!currentSaleForTicket) return null;

  const biz = state.settings;

  const handlePrint = () => {
    const content = document.getElementById('ticketContent')?.innerHTML;
    if (!content) return;
    const w = window.open('', '_blank', 'width=350,height=700');
    w?.document.write(`
      <html>
        <head>
          <title>Imprimir Ticket</title>
          <style>
            body { margin: 10px; font-family: 'Courier New', monospace; font-size: 11px; color: #000; background: #fff; }
            .ticket-header { text-align: center; margin-bottom: 10px; }
            .ticket-line { display: flex; justify-content: space-between; padding: 1px 0; }
            .ticket-sep { border-top: 1px dashed #000; margin: 4px 0; }
            .ticket-total { font-size: 14px; font-weight: 700; margin-top: 5px; }
            h2 { font-size: 16px; margin: 0 0 5px 0; }
            p { margin: 2px 0; }
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
      title="Ticket de Venta Generado" 
      icon="fa-receipt" 
      width="380px"
      isOpen={activeWindow === 'ticket'}
      onClose={closeWindow}
      footer={
        <>
          <button className="btn btn-secondary" onClick={closeWindow}><i className="fas fa-xmark"></i>Cerrar</button>
          <button className="btn btn-primary" onClick={handlePrint}><i className="fas fa-print"></i>Imprimir Ticket</button>
        </>
      }
    >
      <div id="ticketContent" className="bg-white text-black p-6 font-mono text-[11px] border border-gray-200 shadow-sm max-w-[320px] mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-sm font-bold uppercase">{biz.nombre}</h2>
          <p>RIF: {biz.rif}</p>
          <p className="text-[9px]">{biz.direccion}</p>
          <p>Telf: {biz.telefono}</p>
          {biz.email && <p>{biz.email}</p>}
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        <div className="flex justify-between font-bold text-xs mb-1">
          <span>Ticket Nro:</span>
          <span>{String(currentSaleForTicket.ticketNumber).padStart(7, '0')}</span>
        </div>
        <div className="flex justify-between">
          <span>Fecha:</span>
          <span>{currentSaleForTicket.fechaStr} {currentSaleForTicket.horaStr}</span>
        </div>
        <div className="flex justify-between">
          <span>Cliente:</span>
          <span className="uppercase">{currentSaleForTicket.cliente ? currentSaleForTicket.cliente.nombre : 'CLIENTE GENERAL'}</span>
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-black">
              <th className="py-1">Cant. / Item</th>
              <th className="text-right py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {currentSaleForTicket.items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-1">
                  <div>{item.cantidad} x {item.nombre.substring(0, 20)}</div>
                  <div className="text-[9px] text-gray-600">P.U: {fmt(item.precio)}</div>
                </td>
                <td className="text-right py-1 align-top font-bold">{fmt(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-black mt-2 pt-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{fmt(currentSaleForTicket.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>IVA (16%):</span>
            <span>{fmt(currentSaleForTicket.iva)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm mt-1 border-t border-dashed border-black pt-1">
            <span>TOTAL USD:</span>
            <span>{fmt(currentSaleForTicket.total)}</span>
          </div>
          <div className="flex justify-between text-xs font-bold mt-1 border-t border-dotted border-black pt-1">
            <span>TOTAL BOLÍVARES:</span>
            <span>{fmt(currentSaleForTicket.totalVES, 'VES')}</span>
          </div>
          <div className="text-[9px] text-gray-500 mt-1">Tasa BCV Aplicada: {currentSaleForTicket.tasaCambio} VES</div>
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        <div className="flex justify-between">
          <span>Método Pago:</span>
          <span className="uppercase">{currentSaleForTicket.metodo.replace('_', ' ')}</span>
        </div>

        <div className="text-center mt-6">
          <p className="font-bold">¡GRACIAS POR SU COMPRA!</p>
          <p className="text-[8px] mt-2 italic">Desarrollado por AutoPOS Professional</p>
        </div>
      </div>
    </BaseWindow>
  );
}

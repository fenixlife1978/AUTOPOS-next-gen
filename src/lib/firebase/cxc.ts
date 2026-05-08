
'use client';

import { 
  getFirestore, 
  collection, 
  doc, 
  runTransaction, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  Timestamp, 
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { SalesInvoice, Moneda, Method } from '@/lib/types';

// Función auxiliar para obtener la instancia de base de datos de forma segura
function getDb(): Firestore {
  const { firestore } = initializeFirebase();
  return firestore;
}

/**
 * Obtiene la última tasa de cambio para una moneda y fecha específica
 */
export async function obtenerUltimaTasa(moneda: Moneda, fecha: Date = new Date()) {
  if (moneda === 'VES') return { tasa: 1, fuente: 'MONEDA_LOCAL' };
  
  const db = getDb();
  const q = query(
    collection(db, 'tasas_cambio'),
    where('monedaOrigen', '==', moneda),
    where('fecha', '<=', Timestamp.fromDate(fecha)),
    orderBy('fecha', 'desc'),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
}

/**
 * Registrar una factura de venta a crédito
 */
export async function registrarFacturaCredito(data: Partial<SalesInvoice>) {
  const db = getDb();
  const facturaId = doc(collection(db, 'facturas_venta')).id;
  const asientoId = doc(collection(db, 'asientos_contables')).id;
  const movimientoId = doc(collection(db, 'movimientos_cxc')).id;

  await runTransaction(db, async (transaction) => {
    // 1. Crear Factura
    const facturaDoc = doc(db, 'facturas_venta', facturaId);
    transaction.set(facturaDoc, {
      ...data,
      id: facturaId,
      estado: 'PENDIENTE',
      totalCobradoOriginal: 0,
      totalCobradoVes: 0,
      saldo_pendiente_original: data.montoOriginal,
      saldo_pendiente_ves: data.montoBolivares,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });

    // 2. Crear Asiento Contable
    const asientoDoc = doc(db, 'asientos_contables', asientoId);
    transaction.set(asientoDoc, {
      fecha: data.fechaEmision,
      descripcion: `Venta a crédito - Factura ${data.numeroFactura}`,
      tipo: 'VENTA',
      referencia: facturaId,
      modulo: 'CLIENTES',
      lineas: [
        { cuentaId: '1.1.3.01', nombreCuenta: 'Cuentas por Cobrar Clientes', debe: data.montoBolivares, haber: 0, moneda: 'VES' },
        { cuentaId: '4.1.1.01', nombreCuenta: 'Ventas de Mercancía', debe: 0, haber: data.montoBolivares / 1.16, moneda: 'VES' },
        { cuentaId: '2.1.2.01', nombreCuenta: 'Débito Fiscal IVA', debe: 0, haber: (data.montoBolivares / 1.16) * 0.16, moneda: 'VES' }
      ],
      created_at: serverTimestamp()
    });

    // 3. Crear Movimiento Auxiliar
    const movDoc = doc(db, 'movimientos_cxc', movimientoId);
    transaction.set(movDoc, {
      clienteId: data.clienteId,
      facturaId: facturaId,
      tipo: 'FACTURA',
      fecha: data.fechaEmision,
      monedaOriginal: data.monedaOriginal,
      montoOriginal: data.montoOriginal,
      montoBolivares: data.montoBolivares,
      saldoOriginalAcumulado: data.montoOriginal,
      saldoVesAcumulado: data.montoBolivares,
      created_at: serverTimestamp()
    });
  });

  return facturaId;
}

/**
 * Registrar un cobro de factura
 */
export async function registrarCobro(data: {
  factura: SalesInvoice;
  montoCobroOriginal: number;
  monedaCobro: Moneda;
  tasaCobroDia: number;
  metodoPago: Method;
  referencia?: string;
  fecha: Date;
}) {
  const db = getDb();
  const { factura, montoCobroOriginal, monedaCobro, tasaCobroDia, fecha } = data;
  const cobroId = doc(collection(db, 'cobros')).id;
  const asientoId = doc(collection(db, 'asientos_contables')).id;
  const movimientoId = doc(collection(db, 'movimientos_cxc')).id;

  const montoVESRecibido = montoCobroOriginal * tasaCobroDia;
  
  let montoAplicadoOriginal = montoCobroOriginal;
  if (monedaCobro !== factura.monedaOriginal) {
    montoAplicadoOriginal = montoVESRecibido / factura.tasaCambioUsada;
  }

  const saldoVESReducido = montoAplicadoOriginal * factura.tasaCambioUsada;
  const diferenciaCambio = montoVESRecibido - saldoVESReducido;

  await runTransaction(db, async (transaction) => {
    const facturaRef = doc(db, 'facturas_venta', factura.id);
    const facturaSnap = await transaction.get(facturaRef);
    if (!facturaSnap.exists()) throw new Error('Factura no existe');
    
    const fData = facturaSnap.data() as SalesInvoice;
    const nuevoSaldoOrig = Math.max(0, (fData.saldoPendienteOriginal || 0) - montoAplicadoOriginal);
    const nuevoSaldoVes = Math.max(0, (fData.saldoPendienteVes || 0) - saldoVESReducido);
    const nuevoTotalCobOrig = (fData.totalCobradoOriginal || 0) + montoAplicadoOriginal;
    const nuevoTotalCobVes = (fData.totalCobradoVes || 0) + saldoVESReducido;

    let nuevoEstado: any = 'PARCIAL';
    if (nuevoSaldoOrig <= 0.01) nuevoEstado = 'COBRADO';

    transaction.update(facturaRef, {
      saldoPendienteOriginal: nuevoSaldoOrig,
      saldoPendienteVes: nuevoSaldoVes,
      totalCobradoOriginal: nuevoTotalCobOrig,
      totalCobradoVes: nuevoTotalCobVes,
      estado: nuevoEstado,
      updated_at: serverTimestamp()
    });

    const cobroDoc = doc(db, 'cobros', cobroId);
    transaction.set(cobroDoc, {
      facturaId: factura.id,
      fechaCobro: Timestamp.fromDate(fecha),
      monedaCobro,
      montoOriginal: montoCobroOriginal,
      montoBolivares: montoVESRecibido,
      tasaCambioAplicada: tasaCobroDia,
      metodoPago: data.metodoPago,
      referencia: data.referencia,
      created_at: serverTimestamp()
    });

    const lineas = [
      { cuentaId: '1.1.1.01', nombreCuenta: 'Caja/Bancos', debe: montoVESRecibido, haber: 0, moneda: 'VES' },
      { cuentaId: '1.1.3.01', nombreCuenta: 'Cuentas por Cobrar Clientes', debe: 0, haber: saldoVESReducido, moneda: 'VES' }
    ];

    if (Math.abs(diferenciaCambio) > 0.01) {
      if (diferenciaCambio > 0) {
        lineas.push({ cuentaId: '4.2.1.01', nombreCuenta: 'Ganancia Cambiaria', debe: 0, haber: diferenciaCambio, moneda: 'VES' });
      } else {
        lineas.push({ cuentaId: '5.3.1.01', nombreCuenta: 'Pérdida Cambiaria', debe: Math.abs(diferenciaCambio), haber: 0, moneda: 'VES' });
      }
    }

    const asientoDoc = doc(db, 'asientos_contables', asientoId);
    transaction.set(asientoDoc, {
      fecha: Timestamp.fromDate(fecha),
      descripcion: `Cobro Factura ${factura.numeroFactura}`,
      tipo: 'COBRO',
      referencia: cobroId,
      modulo: 'CLIENTES',
      lineas,
      created_at: serverTimestamp()
    });

    const movDoc = doc(db, 'movimientos_cxc', movimientoId);
    transaction.set(movDoc, {
      clienteId: factura.clienteId,
      facturaId: factura.id,
      tipo: 'COBRO',
      fecha: Timestamp.fromDate(fecha),
      monedaOriginal: monedaCobro,
      montoOriginal: -montoCobroOriginal,
      montoBolivares: -montoVESRecibido,
      saldoOriginalAcumulado: nuevoSaldoOrig,
      saldoVesAcumulado: nuevoSaldoVes,
      created_at: serverTimestamp()
    });
  });
}


export type Category = 'lubricante' | 'repuesto' | 'servicio' | 'general' | 'todos';
export type Method = 'efectivo_bs' | 'pago_movil' | 'biopago' | 'transferencia' | 'efectivo_usd' | 'tarjeta' | 'zelle';
export type AccountStatus = 'pendiente' | 'pagada' | 'vencida' | 'parcial';
export type FacturaTipo = 'FISCAL_SENIAT' | 'NOTA_ENTREGA';
export type Moneda = 'VES' | 'USD' | 'EUR';

export interface TasaCambio {
  id: number;
  moneda_origen: Moneda;
  moneda_destino: Moneda;
  tasa: number;
  fecha: string;
  fuente: 'BCV' | 'PARALELO' | 'MANUAL';
}

export interface Product {
  id: number;
  nombre: string;
  categoria: Category;
  codigo: string;
  precio: number;
  costo: number;
  porcentajeGanancia: number;
  porcentajeIVA: number;
  stock: number;
  unidad: string;
  desc?: string;
  icon?: string;
}

export interface Client {
  id: number;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  placa?: string;
  vehiculo?: string;
  notas?: string;
}

export interface Supplier {
  id: number;
  nombre: string;
  rif?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  categoria: Category;
  notas?: string;
}

export interface SaleItem {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  unidad: string;
  categoria: Category;
}

export interface Sale {
  id: string;
  fecha: string;
  fechaStr: string;
  horaStr: string;
  cliente: Client | null;
  clienteId: number | null;
  items: SaleItem[];
  subtotal: number;
  iva: number;
  total: number;
  metodo: Method;
  recibido: number;
  cambio: number;
  nota?: string;
}

export interface PurchaseInvoice {
  id: number;
  proveedorId: number;
  numeroFactura: string;
  fechaEmision: string;
  fechaVencimiento?: string;
  
  // Multimoneda
  moneda_original: Moneda;
  monto_original: number;
  monto_bolivares: number;
  tasa_cambio_usada: number;
  tasa_fuente: string;

  tipoFactura: FacturaTipo;
  estadoPago: AccountStatus;
  
  total_pagado_original: number;
  saldo_pendiente_original: number;
  total_pagado_ves: number;
  saldo_pendiente_ves: number;
  
  imagenUrl?: string;
  created_at: string;
}

export interface PurchasePayment {
  id: string;
  facturaId: number;
  moneda_abono: Moneda;
  monto_original: number;
  monto_bolivares: number;
  tasa_cambio_aplicada: number;
  fechaAbono: string;
  metodoPago: Method;
  referencia?: string;
}

export interface AsientoContable {
  id: number;
  fecha: string;
  concepto: string;
  referenciaId: string | number;
  tipo: 'COMPRA' | 'ABONO' | 'VENTA';
  lineas: {
    cuenta: string;
    debe: number;
    haber: number;
  }[];
}

export interface AppState {
  productos: Product[];
  clientes: Client[];
  proveedores: Supplier[];
  ventas: Sale[];
  compras: PurchaseInvoice[];
  abonos: PurchasePayment[];
  asientos: AsientoContable[];
  tasas: TasaCambio[];
  carrito: { prodId: number; cantidad: number }[];
  clienteActual: number | '';
  storageMode: 'local' | 'hybrid' | 'cloud';
  nextProdId: number;
  nextCliId: number;
  nextProvId: number;
  nextVentaId: number;
  nextCompraId: number;
  nextAbonoId: number;
  nextAsientoId: number;
  nextTasaId: number;
}


export type Category = 'lubricante' | 'repuesto' | 'servicio' | 'general' | 'todos' | string;
export type Method = 'efectivo_bs' | 'pago_movil' | 'biopago' | 'transferencia' | 'efectivo_usd' | 'tarjeta' | 'zelle' | 'cheque';
export type AccountStatus = 'PENDIENTE' | 'PARCIAL' | 'COBRADO' | 'VENCIDO' | 'CASTIGADO';
export type FacturaTipo = 'FISCAL_SENIAT' | 'NOTA_ENTREGA';
export type Moneda = 'VES' | 'USD' | 'EUR';

export type AccountType = 
  | 'ACTIVO CORRIENTE' 
  | 'ACTIVO NO CORRIENTE' 
  | 'PASIVO CORRIENTE' 
  | 'PASIVO NO CORRIENTE' 
  | 'PATRIMONIO' 
  | 'INGRESOS OPERACIONALES' 
  | 'INGRESOS NO OPERACIONALES' 
  | 'COSTOS DE VENTAS' 
  | 'GASTOS ADMINISTRATIVOS' 
  | 'GASTOS DE VENTAS' 
  | 'GASTOS FINANCIEROS' 
  | 'OTROS INGRESOS' 
  | 'OTROS GASTOS' 
  | 'CUENTAS DE ORDEN' 
  | 'RESERVAS';

export interface TasaCambio {
  id?: string;
  monedaOrigen: Moneda;
  monedaDestino: Moneda;
  tasa: number;
  fecha: any;
  fuente: 'BCV' | 'PARALELO' | 'MANUAL';
  created_at: any;
}

export interface Client {
  id: number;
  nombre: string;
  rif?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  placa?: string;
  vehiculo?: string;
  notas?: string;
}

export interface Product {
  id: number;
  nombre: string;
  categoria: string;
  codigo: string;
  precio: number;
  costo: number;
  porcentajeGanancia: number;
  porcentajeIVA: number;
  stock: number;
  unidad: string;
  desc?: string;
  icon?: string;
  marca?: string;
}

export interface CartItem {
  prodId: number;
  cantidad: number;
}

export interface Sale {
  id: string;
  fecha: string;
  fechaStr: string;
  horaStr: string;
  cliente: Client | null;
  clienteId: number | null;
  items: {
    id: number;
    nombre: string;
    cantidad: number;
    precio: number;
    subtotal: number;
    unidad: string;
    categoria: string;
  }[];
  subtotal: number;
  iva: number;
  total: number;
  metodo: Method;
  recibido: number;
  cambio: number;
  nota?: string;
}

export interface Supplier {
  id: number;
  nombre: string;
  rif?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  categoria: string;
  notas?: string;
}

export interface PurchaseInvoice {
  id: number;
  proveedorId: number;
  numeroFactura: string;
  fechaEmision: string;
  fechaVencimiento?: string;
  moneda_original: Moneda;
  monto_original: number;
  monto_bolivares: number;
  tasa_cambio_usada: number;
  tasa_fuente: string;
  tipoFactura: FacturaTipo;
  estadoPago: 'pendiente' | 'parcial' | 'pagada' | 'vencida';
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
}

export interface CuentaContable {
  id: string;
  codigo: string;
  nombre: string;
  tipo: AccountType;
  nivel: number;
  padreId?: string;
  saldoInicial: number;
  monedaSaldoInicial: Moneda;
  editable: boolean;
  mesCerrado?: string; // Formato YYYY-MM
}

export interface AsientoContable {
  id: string;
  fecha: any;
  descripcion: string;
  tipo: 'VENTA' | 'COMPRA' | 'COBRO' | 'ABONO' | 'AJUSTE' | 'CIERRE' | 'OTRO';
  referencia: string;
  modulo: 'VENTAS' | 'COMPRAS' | 'CLIENTES' | 'PROVEEDORES' | 'CONTABILIDAD';
  lineas: {
    cuentaId: string;
    nombreCuenta: string;
    debe: number;
    haber: number;
    moneda: string;
  }[];
  created_at: any;
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
  cuentas: CuentaContable[];
  carrito: CartItem[];
  customCategories: string[];
  clienteActual: number | '';
  nextProdId: number;
  nextCliId: number;
  nextProvId: number;
  nextAsientoId: number;
  nextTasaId: number;
  nextCompraId: number;
}

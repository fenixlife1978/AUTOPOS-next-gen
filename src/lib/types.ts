
export type Category = 'lubricante' | 'repuesto' | 'servicio' | 'general' | 'todos';
export type Method = 'efectivo_bs' | 'pago_movil' | 'biopago' | 'transferencia' | 'efectivo_usd' | 'tarjeta' | 'zelle' | 'cheque';
export type AccountStatus = 'PENDIENTE' | 'PARCIAL' | 'COBRADO' | 'VENCIDO' | 'CASTIGADO';
export type FacturaTipo = 'FISCAL_SENIAT' | 'NOTA_ENTREGA';
export type Moneda = 'VES' | 'USD' | 'EUR';

export interface TasaCambio {
  id?: string;
  monedaOrigen: Moneda;
  monedaDestino: Moneda;
  tasa: number;
  fecha: any; // Timestamp
  fuente: 'BCV' | 'PARALELO' | 'MANUAL';
  created_at: any;
}

export interface Client {
  id: string;
  nombre: string;
  rif?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  created_at: any;
}

export interface SalesInvoice {
  id: string;
  clienteId: string;
  numeroFactura: string;
  fechaEmision: any;
  fechaVencimiento: any;
  monedaOriginal: Moneda;
  montoOriginal: number;
  tasaCambioUsada: number;
  montoBolivares: number;
  saldoPendienteOriginal: number;
  saldoPendienteVes: number;
  totalCobradoOriginal: number;
  totalCobradoVes: number;
  estado: AccountStatus;
  created_at: any;
  updated_at: any;
}

export interface CollectionRecord {
  id: string;
  facturaId: string;
  fechaCobro: any;
  monedaCobro: Moneda;
  montoOriginal: number;
  montoBolivares: number;
  tasaCambioAplicada: number;
  metodoPago: Method;
  referencia?: string;
  created_at: any;
}

export interface CreditNote {
  id: string;
  facturaId: string;
  motivo: string;
  montoOriginal: number;
  montoBolivares: number;
  fechaEmision: any;
  created_at: any;
}

export interface AccountingEntry {
  id: string;
  fecha: any;
  descripcion: string;
  tipo: 'VENTA' | 'COBRO' | 'NOTA_CREDITO' | 'CASTIGO';
  referencia: string;
  modulo: 'CLIENTES';
  lineas: {
    cuentaId: string;
    nombreCuenta: string;
    debe: number;
    haber: number;
    moneda: string;
  }[];
  created_at: any;
}

export interface CxCMovement {
  id: string;
  clienteId: string;
  facturaId: string;
  tipo: 'FACTURA' | 'COBRO' | 'NOTA_CREDITO' | 'CASTIGO';
  fecha: any;
  monedaOriginal: string;
  montoOriginal: number;
  montoBolivares: number;
  saldoOriginalAcumulado: number;
  saldoVesAcumulado: number;
  created_at: any;
}

export interface AppState {
  productos: any[];
  clientes: Client[];
  proveedores: any[];
  ventas: any[];
  compras: any[];
  abonos: any[];
  asientos: AccountingEntry[];
  tasas: TasaCambio[];
  carrito: { prodId: number; cantidad: number }[];
  clienteActual: string | '';
  nextProdId: number;
  nextCliId: number;
  nextProvId: number;
}

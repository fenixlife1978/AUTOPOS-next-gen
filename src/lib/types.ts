
export type Category = 'lubricante' | 'repuesto' | 'servicio' | 'general' | 'todos';
export type Method = 'efectivo_bs' | 'pago_movil' | 'biopago' | 'transferencia' | 'efectivo_usd' | 'tarjeta' | 'zelle';
export type AccountStatus = 'pendiente' | 'pagada' | 'vencida' | 'parcial';
export type FacturaTipo = 'FISCAL_SENIAT' | 'NOTA_ENTREGA';

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
  montoDolares?: number;
  montoBolivares: number;
  tasaBCV?: number;
  tipoFactura: FacturaTipo;
  estadoPago: AccountStatus;
  totalPagado: number;
  saldoPendiente: number;
  imagenUrl?: string;
  created_at: string;
}

export interface PurchasePayment {
  id: string;
  facturaId: number;
  montoBolivares: number;
  fechaAbono: string;
  metodoPago: Method;
  referencia?: string;
}

export interface AppState {
  productos: Product[];
  clientes: Client[];
  proveedores: Supplier[];
  ventas: Sale[];
  compras: PurchaseInvoice[];
  abonos: PurchasePayment[];
  carrito: { prodId: number; cantidad: number }[];
  clienteActual: number | '';
  storageMode: 'local' | 'hybrid' | 'cloud';
  nextProdId: number;
  nextCliId: number;
  nextProvId: number;
  nextVentaId: number;
  nextCompraId: number;
  nextAbonoId: number;
}

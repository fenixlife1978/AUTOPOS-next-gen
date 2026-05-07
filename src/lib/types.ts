
export type Category = 'lubricante' | 'repuesto' | 'servicio' | 'general' | 'todos';
export type Method = 'efectivo' | 'tarjeta' | 'transferencia';
export type AccountStatus = 'pendiente' | 'pagada' | 'vencida';
export type AccountType = 'cobrar' | 'pagar';

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
  id: number;
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

export interface PaymentRecord {
  fecha: string;
  nota: string;
  monto: number;
}

export interface Account {
  id: number;
  tipo: AccountType;
  personaId: number;
  personaNombre: string;
  concepto: string;
  monto: number;
  saldo: number;
  fechaVencimiento: string;
  estado: AccountStatus;
  historialPagos: PaymentRecord[];
}

export interface CartItem {
  prodId: number;
  cantidad: number;
}

export interface AppState {
  productos: Product[];
  clientes: Client[];
  proveedores: Supplier[];
  ventas: Sale[];
  cuentas: Account[];
  carrito: CartItem[];
  clienteActual: string;
  nextProdId: number;
  nextCliId: number;
  nextProvId: number;
  nextVentaId: number;
  nextCuentaId: number;
}

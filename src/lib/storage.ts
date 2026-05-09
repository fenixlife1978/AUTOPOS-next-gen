
import { AppState, Product, Client, Supplier, BusinessSettings, TasaCambio } from './types';

export const STORAGE_KEY = 'autopos_v6_pro_full';

export const PRODUCTOS_INICIALES: Product[] = [];

export const CLIENTES_INICIALES: Client[] = [
  {id:1,nombre:'Carlos Mendoza',telefono:'555-100-2000',email:'carlos@email.com',direccion:'Av. Principal #45',placa:'ABC-1234',vehiculo:'Honda Civic 2019',notas:'Cliente frecuente'}
];

export const PROVEEDORES_INICIALES: Supplier[] = [
  {id:1,nombre:'Distribuidora Nacional de Aceites SA',rif:'J-12345678-9',contacto:'Juan Pérez',telefono:'555-800-1000',email:'ventas@dna.com',direccion:'Zona Industrial #200',categoria:'lubricante',notas:'Entrega los martes'}
];

export const TASAS_INICIALES: TasaCambio[] = [
  { monedaOrigen: 'USD', monedaDestino: 'VES', tasa: 45.50, fecha: new Date(), fuente: 'BCV', created_at: new Date() }
];

export const DEFAULT_SETTINGS: BusinessSettings = {
  nombre: 'Mi Autorepuesto Pro',
  rif: 'J-00000000-0',
  direccion: 'Calle Principal, Local #1, Ciudad',
  telefono: '0212-000-0000',
  email: 'contacto@negocio.com'
};

export const DEFAULT_STATE: AppState = {
  settings: DEFAULT_SETTINGS,
  productos: PRODUCTOS_INICIALES,
  clientes: CLIENTES_INICIALES,
  proveedores: PROVEEDORES_INICIALES,
  ventas: [],
  compras: [],
  abonos: [],
  asientos: [],
  tasas: TASAS_INICIALES,
  cuentas: [],
  carrito: [],
  customCategories: [],
  clienteActual: '',
  nextProdId: 1,
  nextCliId: 2,
  nextProvId: 2,
  nextAsientoId: 1,
  nextTasaId: 2,
  nextCompraId: 1,
  nextTicketNumber: 1,
  boxSession: null
};

export function saveState(state: AppState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...DEFAULT_STATE, 
        ...parsed,
        settings: parsed.settings || DEFAULT_SETTINGS,
        cuentas: parsed.cuentas || [],
        tasas: parsed.tasas || TASAS_INICIALES,
        nextTicketNumber: parsed.nextTicketNumber || 1
      };
    }
  } catch (e) {
    console.error('Failed to load state', e);
  }
  return DEFAULT_STATE;
}

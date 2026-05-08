
import { AppState, Product, Client, Supplier, CuentaContable, TasaCambio } from './types';

export const STORAGE_KEY = 'autopos_v6_pro_full';

export const PRODUCTOS_INICIALES: Product[] = [
  {id:1,nombre:'Aceite Sintético 5W-30 PDV',categoria:'lubricante',codigo:'LUB-001',precio:285,costo:180,porcentajeGanancia:0,porcentajeIVA:16,stock:24,unidad:'litro',desc:'Aceite motor sintético premium nacional',icon:'fa-bottle-droplet',marca:'PDV'},
  {id:10,nombre:'Filtro de Aceite Bosch 7401',categoria:'repuesto',codigo:'REP-001',precio:85,costo:35,porcentajeGanancia:0,porcentajeIVA:16,stock:40,unidad:'pieza',desc:'Filtro de alta eficiencia para motores modernos',icon:'fa-filter',marca:'Bosch'}
];

export const CLIENTES_INICIALES: Client[] = [
  {id:1,nombre:'Carlos Mendoza',telefono:'555-100-2000',email:'carlos@email.com',direccion:'Av. Principal #45',placa:'ABC-1234',vehiculo:'Honda Civic 2019',notas:'Cliente frecuente'}
];

export const PROVEEDORES_INICIALES: Supplier[] = [
  {id:1,nombre:'Distribuidora Nacional de Aceites SA',rif:'J-12345678-9',contacto:'Juan Pérez',telefono:'555-800-1000',email:'ventas@dna.com',direccion:'Zona Industrial #200',categoria:'lubricante',notas:'Entrega los martes'}
];

export const CUENTAS_INICIALES: CuentaContable[] = [
  { id: 'root-1', codigo: '1.1.01.01', nombre: 'Caja Principal', tipo: 'ACTIVO CORRIENTE', nivel: 4, saldoInicial: 0, monedaSaldoInicial: 'VES', editable: false },
  { id: 'root-2', codigo: '2.1.02.01', nombre: 'Débito Fiscal IVA', tipo: 'PASIVO CORRIENTE', nivel: 4, saldoInicial: 0, monedaSaldoInicial: 'VES', editable: false },
  { id: 'root-3', codigo: '4.1.01.01', nombre: 'Ingresos por Ventas', tipo: 'INGRESOS OPERACIONALES', nivel: 4, saldoInicial: 0, monedaSaldoInicial: 'VES', editable: false }
];

export const TASAS_INICIALES: TasaCambio[] = [
  { monedaOrigen: 'USD', monedaDestino: 'VES', tasa: 45.50, fecha: new Date(), fuente: 'BCV', created_at: new Date() }
];

export const DEFAULT_STATE: AppState = {
  productos: PRODUCTOS_INICIALES,
  clientes: CLIENTES_INICIALES,
  proveedores: PROVEEDORES_INICIALES,
  ventas: [],
  compras: [],
  abonos: [],
  asientos: [],
  tasas: TASAS_INICIALES,
  cuentas: CUENTAS_INICIALES,
  carrito: [],
  customCategories: [],
  clienteActual: '',
  nextProdId: 37,
  nextCliId: 3,
  nextProvId: 3,
  nextAsientoId: 1,
  nextTasaId: 3,
  nextCompraId: 1
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
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load state', e);
  }
  return DEFAULT_STATE;
}

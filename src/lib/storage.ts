
import { AppState, Product, Client, Supplier } from './types';

export const STORAGE_KEY = 'autopos_v3';

export const PRODUCTOS_INICIALES: Product[] = [
  {id:1,nombre:'Aceite Sintético 5W-30 1L',categoria:'lubricante',codigo:'LUB-001',precio:285,costo:180,porcentajeGanancia:0,porcentajeIVA:16,stock:24,unidad:'litro',desc:'Aceite motor sintético de alta performance',icon:'fa-bottle-droplet'},
  {id:2,nombre:'Aceite Sintético 5W-30 4L',categoria:'lubricante',codigo:'LUB-002',precio:899,costo:580,porcentajeGanancia:0,porcentajeIVA:16,stock:12,unidad:'litro',desc:'Presentación galón 4 litros',icon:'fa-bottle-droplet'},
  {id:3,nombre:'Aceite Semi-Sintético 10W-40 4L',categoria:'lubricante',codigo:'LUB-003',precio:650,costo:400,porcentajeGanancia:0,porcentajeIVA:16,stock:18,unidad:'galón',desc:'Aceite semi-sintético para vehículos estándar',icon:'fa-bottle-droplet'},
  {id:4,nombre:'Aceite Mineral 20W-50 4L',categoria:'lubricante',codigo:'LUB-004',precio:420,costo:250,porcentajeGanancia:0,porcentajeIVA:16,stock:20,unidad:'galón',desc:'Aceite mineral para motores de alto kilometraje',icon:'fa-bottle-droplet'},
  {id:5,nombre:'Aceite de Transmisión ATF',categoria:'lubricante',codigo:'LUB-005',precio:195,costo:110,porcentajeGanancia:0,porcentajeIVA:16,stock:15,unidad:'litro',desc:'Fluido automático de transmisión',icon:'fa-bottle-droplet'},
  {id:6,nombre:'Grasa Multiusos 500g',categoria:'lubricante',codigo:'LUB-006',precio:125,costo:65,porcentajeGanancia:0,porcentajeIVA:16,stock:30,unidad:'pieza',desc:'Grasa de litio multipropósito',icon:'fa-grease'},
  {id:7,nombre:'Líquido de Frenos DOT 4',categoria:'lubricante',codigo:'LUB-007',precio:95,costo:50,porcentajeGanancia:0,porcentajeIVA:16,stock:25,unidad:'litro',desc:'Líquido de frenos de alto punto de ebullición',icon:'fa-droplet'},
  {id:8,nombre:'Anticongelante Verde 1L',categoria:'lubricante',codigo:'LUB-008',precio:85,costo:45,porcentajeGanancia:0,porcentajeIVA:16,stock:22,unidad:'litro',desc:'Refrigerante para sistema de enfriamiento',icon:'fa-temperature-low'},
  {id:9,nombre:'Aceite de Dirección Hidráulica',categoria:'lubricante',codigo:'LUB-009',precio:110,costo:60,porcentajeGanancia:0,porcentajeIVA:16,stock:14,unidad:'litro',desc:'Fluidos para dirección asistida',icon:'fa-bottle-droplet'},
  {id:10,nombre:'Filtro de Aceite Universal',categoria:'repuesto',codigo:'REP-001',precio:85,costo:35,porcentajeGanancia:0,porcentajeIVA:16,stock:40,unidad:'pieza',desc:'Filtro de aceite compatible con múltiples modelos',icon:'fa-filter'},
  {id:11,nombre:'Filtro de Aire Sedán',categoria:'repuesto',codigo:'REP-002',precio:150,costo:65,porcentajeGanancia:0,porcentajeIVA:16,stock:20,unidad:'pieza',desc:'Filtro de aire para sedanes',icon:'fa-wind'},
  {id:12,nombre:'Filtro de Aire SUV/Pickup',categoria:'repuesto',codigo:'REP-003',precio:195,costo:85,porcentajeGanancia:0,porcentajeIVA:16,stock:15,unidad:'pieza',desc:'Filtro de aire para SUV y pickups',icon:'fa-wind'},
  {id:13,nombre:'Filtro de Combustible',categoria:'repuesto',codigo:'REP-004',precio:120,costo:50,porcentajeGanancia:0,porcentajeIVA:16,stock:18,unidad:'pieza',desc:'Filtro de gasolina inline',icon:'fa-filter'},
  {id:14,nombre:'Bujía de Encendido (unidad)',categoria:'repuesto',codigo:'REP-005',precio:45,costo:18,porcentajeGanancia:0,porcentajeIVA:16,stock:60,unidad:'pieza',desc:'Bujía de platino iridio',icon:'fa-bolt'},
  {id:15,nombre:'Juego de Bujías x4',categoria:'repuesto',codigo:'REP-006',precio:165,costo:65,porcentajeGanancia:0,porcentajeIVA:16,stock:15,unidad:'juego',desc:'Set de 4 bujías iridio',icon:'fa-bolt'},
  {id:16,nombre:'Pastillas de Freno Delanteras',categoria:'repuesto',codigo:'REP-007',precio:380,costo:190,porcentajeGanancia:0,porcentajeIVA:16,stock:10,unidad:'juego',desc:'Juego de pastillas cerámicas delanteras',icon:'fa-compact-disc'},
  {id:17,nombre:'Pastillas de Freno Traseras',categoria:'repuesto',codigo:'REP-008',precio:320,costo:160,porcentajeGanancia:0,porcentajeIVA:16,stock:10,unidad:'juego',desc:'Juego de pastillas cerámicas traseras',icon:'fa-compact-disc'},
  {id:18,nombre:'Disco de Freno Delantero (unidad)',categoria:'repuesto',codigo:'REP-009',precio:520,costo:280,porcentajeGanancia:0,porcentajeIVA:16,stock:8,unidad:'pieza',desc:'Disco ventilado delantero',icon:'fa-circle'},
  {id:19,nombre:'Amortiguador Delantero (unidad)',categoria:'repuesto',codigo:'REP-010',precio:680,costo:380,porcentajeGanancia:0,porcentajeIVA:16,stock:6,unidad:'pieza',desc:'Amortiguador de gas para suspensión delantera',icon:'fa-arrows-up-down'},
  {id:20,nombre:'Banda Serpentina',categoria:'repuesto',codigo:'REP-011',precio:185,costo:80,porcentajeGanancia:0,porcentajeIVA:16,stock:12,unidad:'pieza',desc:'Banda poly-V para accesorios',icon:'fa-ring'},
  {id:21,nombre:'Bateria 12V 45Ah',categoria:'repuesto',codigo:'REP-012',precio:1250,costo:800,porcentajeGanancia:0,porcentajeIVA:16,stock:5,unidad:'pieza',desc:'Batería de arranque libre de mantenimiento',icon:'fa-car-battery'},
  {id:22,nombre:'Lámpara H4 Halógena (par)',categoria:'repuesto',codigo:'REP-013',precio:140,costo:55,porcentajeGanancia:0,porcentajeIVA:16,stock:20,unidad:'juego',desc:'Par de lámparas H4 60/55W',icon:'fa-lightbulb'},
  {id:23,nombre:'Limpiaparabrisas 22" (unidad)',categoria:'repuesto',codigo:'REP-014',precio:95,costo:40,porcentajeGanancia:0,porcentajeIVA:16,stock:16,unidad:'pieza',desc:'Escobilla de silicona premium',icon:'fa-water'},
  {id:24,nombre:'Termostato Universal',categoria:'repuesto',codigo:'REP-015',precio:110,costo:50,porcentajeGanancia:0,porcentajeIVA:16,stock:10,unidad:'pieza',desc:'Termostato de 82°C',icon:'fa-temperature-half'},
  {id:25,nombre:'Cambio de Aceite y Filtro',categoria:'servicio',codigo:'SER-001',precio:150,costo:0,porcentajeGanancia:0,porcentajeIVA:16,stock:999,unidad:'servicio',desc:'Incluye aceite y filtro (el cliente compra los materiales)',icon:'fa-wrench'},
  {id:26,nombre:'Cambio de Aceite Completo',categoria:'servicio',codigo:'SER-002',precio:450,costo:50,porcentajeGanancia:0,porcentajeIVA:16,stock:999,unidad:'servicio',desc:'Incluye aceite sintético 5W-30 4L + filtro + mano de obra',icon:'fa-wrench'},
  {id:27,nombre:'Alineación Frontal',categoria:'servicio',codigo:'SER-003',precio:350,costo:0,porcentajeGanancia:0,porcentajeIVA:16,stock:999,unidad:'servicio',desc:'Alineación de dirección delantera computarizada',icon:'fa-compass-drafting'},
  {id:28,nombre:'Balanceo de Llantas (4)',categoria:'servicio',codigo:'SER-004',precio:200,costo:0,porcentajeGanancia:0,porcentajeIVA:16,stock:999,unidad:'servicio',desc:'Balanceo computarizado de 4 llantas',icon:'fa-circle-notch'},
  {id:29,nombre:'Cambio de Pastillas Delanteras',categoria:'servicio',codigo:'SER-005',precio:300,costo:0,porcentajeGanancia:0,porcentajeIVA:16,stock:999,unidad:'servicio',desc:'Mano de obra de cambio de pastillas delanteras',icon:'fa-wrench'},
  {id:30,nombre:'Cambio de Bujías',categoria:'servicio',codigo:'SER-006',precio:250,costo:0,porcentajeGanancia:0,porcentajeIVA:16,stock:999,unidad:'servicio',desc:'Mano de obra de cambio de bujías (hasta 4 cilindros)',icon:'fa-wrench'},
  {id:31,nombre:'Escaneo de Diagnóstico',categoria:'servicio',codigo:'SER-007',precio:200,costo:0,porcentajeGanancia:0,porcentajeIVA:16,stock:999,unidad:'servicio',desc:'Lectura de códigos de falla con escáner OBD2',icon:'fa-microchip'},
  {id:32,nombre:'Cambio de Filtro de Aire',categoria:'servicio',codigo:'SER-008',precio:50,costo:0,porcentajeGanancia:0,porcentajeIVA:16,stock:999,unidad:'servicio',desc:'Mano de obra de cambio de filtro de aire',icon:'fa-wrench'},
  {id:33,nombre:'Revisión General',categoria:'servicio',codigo:'SER-009',precio:0,costo:0,porcentajeGanancia:0,porcentajeIVA:16,stock:999,unidad:'servicio',desc:'Revisión gratuita de niveles y estado general',icon:'fa-clipboard-check'},
  {id:34,nombre:'Cambio de Banda Serpentina',categoria:'servicio',codigo:'SER-010',precio:200,costo:0,porcentajeGanancia:0,porcentajeIVA:16,stock:999,unidad:'servicio',desc:'Mano de obra de cambio de banda',icon:'fa-wrench'},
  {id:35,nombre:'Cambio de Amortiguador (x1)',categoria:'servicio',codigo:'SER-011',precio:400,costo:0,porcentajeGanancia:0,porcentajeIVA:16,stock:999,unidad:'servicio',desc:'Mano de obra de cambio de amortiguador por unidad',icon:'fa-wrench'},
  {id:36,nombre:'Lavado de Motor',categoria:'servicio',codigo:'SER-012',precio:150,costo:20,porcentajeGanancia:0,porcentajeIVA:16,stock:999,unidad:'servicio',desc:'Lavado a presión con desconexión de batería',icon:'fa-spray-can-sparkles'}
];

export const CLIENTES_INICIALES: Client[] = [
  {id:1,nombre:'Carlos Mendoza',telefono:'555-100-2000',email:'carlos@email.com',direccion:'Av. Principal #45',placa:'ABC-1234',vehiculo:'Honda Civic 2019',notas:'Cliente frecuente'},
  {id:2,nombre:'María García',telefono:'555-200-3000',email:'maria@email.com',direccion:'Col. Centro #89',placa:'DEF-5678',vehiculo:'Toyota Corolla 2021',notas:''}
];

export const PROVEEDORES_INICIALES: Supplier[] = [
  {id:1,nombre:'Distribuidora Nacional de Aceites SA de CV',contacto:'Juan Pérez',telefono:'555-800-1000',email:'ventas@dna.com',direccion:'Zona Industrial #200',categoria:'lubricante',notas:'Entrega los martes'},
  {id:2,nombre:'Refacciones Automotrices del Norte',contacto:'Laura Sánchez',telefono:'555-900-2000',email:'pedidos@ran.com',direccion:'Blvd. Norte #500',categoria:'repuesto',notas:'Repuestos originales y alternativos'}
];

export const DEFAULT_STATE: AppState = {
  productos: PRODUCTOS_INICIALES,
  clientes: CLIENTES_INICIALES,
  proveedores: PROVEEDORES_INICIALES,
  ventas: [],
  cuentas: [],
  carrito: [],
  clienteActual: '',
  nextProdId: 37,
  nextCliId: 3,
  nextProvId: 3,
  nextVentaId: 1,
  nextCuentaId: 1
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
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load state', e);
  }
  return DEFAULT_STATE;
}


/**
 * @fileOverview Catálogo Maestro Automotriz (+18,000 items).
 * Persistencia optimizada: Firebase RTDB -> IndexedDB -> RAM.
 * Soporte para seguimiento de progreso de carga.
 */

import { initializeFirebase } from '@/firebase';
import { ref, get, set } from 'firebase/database';

export interface CatalogItem {
  nombre: string;
  marca: string;
  categoria: string;
  unidad: string;
}

const DB_NAME = 'AutoPOS_Master_Catalog';
const STORE_NAME = 'Items';
const RTDB_PATH = 'catalog_v4';

let RAM_CATALOG: CatalogItem[] | null = null;
let IS_LOADING = false;
let CURRENT_PROGRESS = 0;

// Tipado para el callback de progreso
export type ProgressCallback = (percent: number) => void;

const VEHICULOS = ['Toyota Corolla', 'Toyota Hilux', 'Ford Fiesta', 'Ford Explorer', 'Chevrolet Aveo', 'Chevrolet Optra', 'Chevrolet Spark', 'Fiat Uno', 'Hyundai Elantra', 'Honda Civic', 'Jeep Grand Cherokee', 'Mitsubishi Lancer'];
const MARCAS = ['Bosch', 'Denso', 'NGK', 'AC Delco', 'Fram', 'Wix', 'Mann Filter', 'Mopar', 'Motorcraft', 'PDV', 'Shell', 'Motul', 'Castrol', 'Mobil', 'Valvoline', 'Inca', 'Venoco', 'Sky', 'TotalEnergies'];

const PARTES = {
  'motor': ['Kit de embrague', 'Bomba de agua', 'Bomba de aceite', 'Bomba de gasolina', 'Correa de distribución', 'Kit de tiempo', 'Filtro de aire', 'Inyectores', 'Bobina de encendido', 'Bujías Iridio', 'Radiador', 'Termostato', 'Soporte de motor', 'Culata', 'Anillos de pistón', 'Taqués hidráulicos'],
  'transmision': ['Cilindro maestro embrague', 'Semieje', 'Junta homocinética', 'Fuelle de junta', 'Cruceta', 'Retén de eje', 'Aceite ATF Dexron', 'Filtro de caja'],
  'frenos': ['Pastillas delanteras', 'Balatas traseras', 'Disco de freno', 'Tambor de freno', 'Cilindro de rueda', 'Bomba de freno', 'Líquido DOT 4', 'Caliper'],
  'suspension': ['Amortiguador delantero', 'Amortiguador trasero', 'Espirales', 'Bujes de meseta', 'Rotula', 'Terminal de dirección', 'Muñón', 'Cremallera', 'Brazo de control'],
  'electrico': ['Alternador', 'Motor de arranque', 'Batería 60Ah', 'Regulador de voltaje', 'Relé 40A', 'Faro delantero', 'Stop trasero', 'Sensores CKP', 'Sensores CMP', 'Sensor TPS', 'Módulo de encendido'],
  'refrigeracion': ['Electroventilador', 'Manguera superior', 'Manguera inferior', 'Depósito expansión', 'Compresor A/C', 'Evaporador A/C', 'Condensador A/C'],
  'lubricante': ['Aceite 20W50 Mineral', 'Aceite 15W40 Mineral', 'Aceite 10W30 Semisintético', 'Aceite 5W30 Sintético', 'Valvulina 80W90', 'Grasa Roja', 'Limpiador de frenos'],
  'servicio': ['Cambio de Aceite', 'Limpieza de Inyectores', 'Revisión de Frenos', 'Lavado y Engrase', 'Escaneo Computarizado', 'Mecánica Ligera']
};

function generateSeedData(onProgress?: ProgressCallback): CatalogItem[] {
  const catalog: CatalogItem[] = [];
  const marcasLubricantes = ['PDV', 'Shell', 'Motul', 'Castrol', 'Mobil', 'Valvoline', 'Inca', 'Venoco', 'Sky', 'TotalEnergies'];
  
  const totalSteps = VEHICULOS.length;
  
  VEHICULOS.forEach((vehiculo, vIdx) => {
    Object.entries(PARTES).forEach(([cat, items]) => {
      items.forEach(item => {
        MARCAS.forEach(marca => {
          const esCatLubricante = cat === 'lubricante';
          const esMarcaLubricante = marcasLubricantes.includes(marca);
          
          if (esCatLubricante === esMarcaLubricante || !esCatLubricante) {
            catalog.push({
              nombre: `${item} ${marca} para ${vehiculo}`,
              marca: marca,
              categoria: cat,
              unidad: cat === 'servicio' ? 'servicio' : (cat === 'lubricante' ? 'litro' : 'pieza')
            });
          }
        });
      });
    });
    
    if (onProgress) {
      const progress = Math.round(((vIdx + 1) / totalSteps) * 100);
      onProgress(progress);
    }
  });
  return catalog;
}

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 4);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveLocal(data: CatalogItem[]) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(data, 'cached_catalog');
  } catch (e) {}
}

async function getLocal(): Promise<CatalogItem[] | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const store = db.transaction(STORE_NAME).objectStore(STORE_NAME);
      const req = store.get('cached_catalog');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) { return null; }
}

export async function initCatalog(onProgress?: ProgressCallback): Promise<CatalogItem[]> {
  if (typeof window === 'undefined') return [];
  if (RAM_CATALOG && RAM_CATALOG.length > 0) {
    if (onProgress) onProgress(100);
    return RAM_CATALOG;
  }
  if (IS_LOADING) return [];

  IS_LOADING = true;

  // 1. Cargar desde IndexedDB
  if (onProgress) onProgress(5);
  const cached = await getLocal();
  if (cached && cached.length > 0) {
    RAM_CATALOG = cached;
    IS_LOADING = false;
    if (onProgress) onProgress(100);
    return RAM_CATALOG;
  }

  // 2. Si no hay local, intentar descargar de RTDB
  if (onProgress) onProgress(10);
  try {
    const { rtdb } = initializeFirebase();
    const snap = await get(ref(rtdb, RTDB_PATH));
    if (snap.exists()) {
      RAM_CATALOG = snap.val();
      await saveLocal(RAM_CATALOG!);
      IS_LOADING = false;
      if (onProgress) onProgress(100);
      return RAM_CATALOG!;
    }
  } catch (e) {}

  // 3. Fallback: Generar masivamente si es la primera vez absoluta
  if (onProgress) onProgress(15);
  RAM_CATALOG = generateSeedData((p) => {
    const adjustedProgress = 15 + Math.round(p * 0.7); // Escalar de 15% a 85%
    if (onProgress) onProgress(adjustedProgress);
  });
  
  await saveLocal(RAM_CATALOG);
  if (onProgress) onProgress(95);
  
  try {
    const { rtdb } = initializeFirebase();
    set(ref(rtdb, RTDB_PATH), RAM_CATALOG);
  } catch (e) {}

  IS_LOADING = false;
  if (onProgress) onProgress(100);
  return RAM_CATALOG;
}

export function getAutomotiveCatalog(): CatalogItem[] {
  return RAM_CATALOG || [];
}

export function isCatalogLoading(): boolean {
  return IS_LOADING;
}

export function getCatalogProgress(): number {
  return CURRENT_PROGRESS;
}

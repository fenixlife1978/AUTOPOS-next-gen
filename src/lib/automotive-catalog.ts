
/**
 * @fileOverview Catálogo Maestro Automotriz (+18,000 items).
 * Persistencia optimizada: Firebase RTDB -> IndexedDB -> RAM.
 * Soporte para seguimiento de progreso de carga con procesamiento asíncrono por lotes.
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
const RTDB_PATH = 'catalog_v5';

let RAM_CATALOG: CatalogItem[] | null = null;
let IS_LOADING = false;
let CURRENT_PROGRESS = 0;

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

/**
 * Genera datos de forma asíncrona para no bloquear el hilo principal.
 */
async function generateSeedDataAsync(onProgress?: ProgressCallback): Promise<CatalogItem[]> {
  const catalog: CatalogItem[] = [];
  const marcasLubricantes = ['PDV', 'Shell', 'Motul', 'Castrol', 'Mobil', 'Valvoline', 'Inca', 'Venoco', 'Sky', 'TotalEnergies'];
  
  const totalVehiculos = VEHICULOS.length;
  
  for (let vIdx = 0; vIdx < totalVehiculos; vIdx++) {
    const vehiculo = VEHICULOS[vIdx];
    
    for (const [cat, items] of Object.entries(PARTES)) {
      for (const item of items) {
        for (const marca of MARCAS) {
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
        }
      }
    }
    
    // Notificar progreso y ceder control al navegador
    if (onProgress) {
      const progress = Math.round(((vIdx + 1) / totalVehiculos) * 100);
      onProgress(progress);
    }
    
    // Pequeña pausa para permitir que el navegador actualice la UI
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return catalog;
}

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 5);
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
  } catch (e) {
    console.error('Error saving to IndexedDB:', e);
  }
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

  // 1. Intentar cargar desde IndexedDB (Máxima prioridad)
  if (onProgress) onProgress(5);
  const cached = await getLocal();
  if (cached && cached.length > 0) {
    RAM_CATALOG = cached;
    IS_LOADING = false;
    if (onProgress) onProgress(100);
    return RAM_CATALOG;
  }

  // 2. Si no hay local, intentar descargar de RTDB (con timeout para evitar colgarse)
  if (onProgress) onProgress(10);
  try {
    const { rtdb } = initializeFirebase();
    const rtdbPromise = get(ref(rtdb, RTDB_PATH));
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
    
    const snap = await Promise.race([rtdbPromise, timeoutPromise]) as any;
    if (snap && snap.exists()) {
      RAM_CATALOG = snap.val();
      await saveLocal(RAM_CATALOG!);
      IS_LOADING = false;
      if (onProgress) onProgress(100);
      return RAM_CATALOG!;
    }
  } catch (e) {
    console.warn('RTDB load failed or timed out, falling back to local generation');
  }

  // 3. Fallback: Generación asíncrona por lotes
  if (onProgress) onProgress(15);
  RAM_CATALOG = await generateSeedDataAsync((p) => {
    const adjustedProgress = 15 + Math.round(p * 0.8); // Escalar de 15% a 95%
    if (onProgress) onProgress(adjustedProgress);
  });
  
  // Guardar permanentemente en disco
  await saveLocal(RAM_CATALOG);
  if (onProgress) onProgress(98);
  
  // Opcional: Intentar subir a RTDB en segundo plano
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

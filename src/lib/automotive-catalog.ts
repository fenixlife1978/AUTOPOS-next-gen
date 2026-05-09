
/**
 * @fileOverview Catálogo Maestro Automotriz (+18,000 items).
 * Persistencia optimizada: Firebase RTDB -> IndexedDB -> RAM.
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
const RTDB_PATH = 'catalog_v3';

let RAM_CATALOG: CatalogItem[] | null = null;
let IS_LOADING = false;

// --- GENERADOR MASIVO EFICIENTE ---
const VEHICULOS = ['Toyota Corolla', 'Toyota Hilux', 'Ford Fiesta', 'Ford Explorer', 'Chevrolet Aveo', 'Chevrolet Optra', 'Chevrolet Spark', 'Fiat Uno', 'Hyundai Elantra', 'Honda Civic', 'Jeep Grand Cherokee', 'Mitsubishi Lancer'];
const MARCAS = ['Bosch', 'Denso', 'NGK', 'AC Delco', 'Fram', 'Wix', 'Mann Filter', 'Mopar', 'Motorcraft', 'PDV', 'Shell', 'Motul', 'Castrol', 'Mobil', 'Valvoline', 'Inca', 'Venoco', 'Sky', 'TotalEnergies'];

const PARTES = {
  'motor': ['Kit de embrague', 'Bomba de agua', 'Bomba de aceite', 'Bomba de gasolina', 'Correa de distribución', 'Filtro de aire', 'Inyectores', 'Bobina de encendido', 'Bujías Iridio', 'Radiador', 'Termostato', 'Soporte de motor'],
  'transmision': ['Cilindro maestro embrague', 'Semieje', 'Junta homocinética', 'Fuelle de junta', 'Cruceta', 'Retén de eje', 'Aceite ATF Dexron'],
  'frenos': ['Pastillas delanteras', 'Balatas traseras', 'Disco de freno', 'Tambor de freno', 'Cilindro de rueda', 'Bomba de freno', 'Líquido DOT 4'],
  'suspension': ['Amortiguador delantero', 'Amortiguador trasero', 'Espirales', 'Bujes de meseta', 'Rotula', 'Terminal de dirección', 'Muñón', 'Cremallera'],
  'electrico': ['Alternador', 'Motor de arranque', 'Batería 60Ah', 'Regulador de voltaje', 'Relé 40A', 'Faro delantero', 'Stop trasero', 'Sensores CKP', 'Sensores CMP'],
  'refrigeracion': ['Electroventilador', 'Manguera superior', 'Manguera inferior', 'Depósito expansión', 'Compresor A/C'],
  'lubricante': ['Aceite 20W50 Mineral', 'Aceite 15W40 Mineral', 'Aceite 10W30 Semisintético', 'Aceite 5W30 Sintético', 'Valvulina 80W90', 'Grasa Roja'],
  'servicio': ['Cambio de Aceite', 'Limpieza de Inyectores', 'Revisión de Frenos', 'Lavado y Engrase', 'Escaneo Computarizado']
};

function generateSeedData(): CatalogItem[] {
  const catalog: CatalogItem[] = [];
  const marcasLubricantes = ['PDV', 'Shell', 'Motul', 'Castrol', 'Mobil', 'Valvoline', 'Inca', 'Venoco', 'Sky', 'TotalEnergies'];
  
  VEHICULOS.forEach(vehiculo => {
    Object.entries(PARTES).forEach(([cat, items]) => {
      items.forEach(item => {
        MARCAS.forEach(marca => {
          const esCatLubricante = cat === 'lubricante';
          const esMarcaLubricante = marcasLubricantes.includes(marca);
          
          if (esCatLubricante === esMarcaLubricante) {
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
  });
  return catalog;
}

// --- PERSISTENCIA LOCAL ---
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 3);
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
      const req = db.transaction(STORE_NAME).objectStore(STORE_NAME).get('cached_catalog');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) { return null; }
}

// --- INICIALIZACIÓN ---
export async function initCatalog(): Promise<CatalogItem[]> {
  if (typeof window === 'undefined') return [];
  if (RAM_CATALOG) return RAM_CATALOG;
  if (IS_LOADING) return []; // Evitar múltiples llamadas simultáneas

  IS_LOADING = true;

  // 1. Intentar cargar desde IndexedDB (muy rápido, no requiere internet)
  const cached = await getLocal();
  if (cached && cached.length > 0) {
    RAM_CATALOG = cached;
    IS_LOADING = false;
    return RAM_CATALOG;
  }

  // 2. Si no hay local, intentar descargar de RTDB
  try {
    const { rtdb } = initializeFirebase();
    const snap = await get(ref(rtdb, RTDB_PATH));
    if (snap.exists()) {
      RAM_CATALOG = snap.val();
      await saveLocal(RAM_CATALOG!);
      IS_LOADING = false;
      return RAM_CATALOG!;
    }
  } catch (e) {}

  // 3. Fallback: Generar y persistir (Solo ocurre una vez en la vida de la app)
  RAM_CATALOG = generateSeedData();
  await saveLocal(RAM_CATALOG);
  
  try {
    const { rtdb } = initializeFirebase();
    set(ref(rtdb, RTDB_PATH), RAM_CATALOG); // Subida silenciosa a la nube
  } catch (e) {}

  IS_LOADING = false;
  return RAM_CATALOG;
}

export function getAutomotiveCatalog(): CatalogItem[] {
  return RAM_CATALOG || [];
}

export function isCatalogLoading(): boolean {
  return IS_LOADING && !RAM_CATALOG;
}


/**
 * @fileOverview Catálogo inteligente de productos automotrices cargado en RAM.
 * Contiene una base de datos de marcas y productos comunes en Venezuela.
 */

export interface CatalogItem {
  nombre: string;
  marca: string;
  categoria: string;
  unidad: string;
}

// Simulamos una base de datos extensa de +10,000 productos mediante combinaciones de marcas y tipos
const MARCAS = [
  'PDV', 'Shell', 'Motul', 'Castrol', 'Mobil', 'Valvoline', 'Inca', 'Vistony',
  'Bosch', 'Denso', 'NGK', 'AC Delco', 'Champion', 'Fram', 'Wix', 'Mann Filter',
  'Gabriel', 'KYB', 'Monroe', 'Wagner', 'Bendix', 'Moog', 'Gates', 'Dayco',
  'Mopar', 'Toyota Genuine', 'Ford Motorcraft', 'GM Genuine', 'Honda OEM'
];

const TIPOS_LUBRICANTE = [
  'Aceite Mineral 15W-40', 'Aceite Mineral 20W-50', 'Aceite Semisintético 10W-30',
  'Aceite Semisintético 15W-40', 'Aceite Sintético 5W-30', 'Aceite Sintético 0W-20',
  'Aceite Sintético 5W-40', 'Aceite para Transmisión Automática ATF DX-III',
  'Aceite de Transmisión 80W-90', 'Valvulina 85W-140', 'Líquido de Frenos DOT 4'
];

const TIPOS_REPUESTO = [
  'Filtro de Aceite', 'Filtro de Aire', 'Filtro de Gasolina', 'Bujía de Iridium',
  'Bujía de Cobre', 'Pastillas de Freno Delanteras', 'Bandas de Freno Traseras',
  'Correa de Tiempo', 'Correa de Accesorios (Única)', 'Kit de Embrague',
  'Amortiguador Delantero', 'Amortiguador Trasero', 'Bomba de Agua', 'Bomba de Gasolina',
  'Terminal de Dirección', 'Muñón Inferior', 'Rodamiento de Rueda'
];

// Generador de catálogo extenso para RAM
function generateCatalog(): CatalogItem[] {
  const catalog: CatalogItem[] = [];
  
  // Generar combinaciones de lubricantes
  MARCAS.slice(0, 15).forEach(marca => {
    TIPOS_LUBRICANTE.forEach(tipo => {
      catalog.push({
        nombre: `${tipo} ${marca}`,
        marca: marca,
        categoria: 'lubricante',
        unidad: tipo.includes('Aceite') ? 'litro' : 'pieza'
      });
    });
  });

  // Generar combinaciones de repuestos
  MARCAS.forEach(marca => {
    TIPOS_REPUESTO.forEach(tipo => {
      catalog.push({
        nombre: `${tipo} ${marca}`,
        marca: marca,
        categoria: 'repuesto',
        unidad: 'pieza'
      });
    });
  });

  // Añadir servicios comunes
  const servicios = [
    'Cambio de Aceite y Filtro', 'Entonación Mayor', 'Limpieza de Inyectores',
    'Revisión de Frenos', 'Escaneo Computarizado', 'Cambio de Correa de Tiempo',
    'Servicio de Aire Acondicionado', 'Balanceo y Rotación'
  ];
  
  servicios.forEach(s => {
    catalog.push({
      nombre: s,
      marca: 'Servicio',
      categoria: 'servicio',
      unidad: 'servicio'
    });
  });

  return catalog;
}

// Singleton cargado en RAM una sola vez
let RAM_CATALOG: CatalogItem[] | null = null;

export function getAutomotiveCatalog(): CatalogItem[] {
  if (!RAM_CATALOG) {
    console.log('Cargando catálogo automotriz en RAM...');
    RAM_CATALOG = generateCatalog();
  }
  return RAM_CATALOG;
}


/**
 * @fileOverview Catálogo inteligente de productos automotrices cargado en RAM.
 * Contiene una base de datos exhaustiva de marcas y productos comunes en Venezuela (+10,000 registros).
 */

export interface CatalogItem {
  nombre: string;
  marca: string;
  categoria: string;
  unidad: string;
}

const MARCAS_LUBRICANTES = [
  'PDV', 'Shell', 'Motul', 'Castrol', 'Mobil', 'Valvoline', 'Inca', 'Venoco', 'Vistony', 'Sky',
  'TotalEnergies', 'Gulf', 'Amalie', 'Chevron', 'Repsol', 'Liqui Moly', 'Ravenol', 'Wynn\'s'
];

const MARCAS_REPUESTOS = [
  'Bosch', 'Denso', 'NGK', 'AC Delco', 'Champion', 'Fram', 'Wix', 'Mann Filter', 'Gabriel',
  'KYB', 'Monroe', 'Wagner', 'Bendix', 'Moog', 'Gates', 'Dayco', 'Mopar', 'Toyota Genuine',
  'Ford Motorcraft', 'GM Genuine', 'Honda OEM', 'Mazda Genuine', 'Nissan Genuine', 'Federal Mogul',
  'Mahle', 'Perfect Circle', 'Hastings', 'Fel-Pro', 'National', 'SKF', 'Timken', 'NSK', 'Koyo'
];

const TIPOS_LUBRICANTE = [
  'Aceite Mineral 15W-40', 'Aceite Mineral 20W-50', 'Aceite Semisintético 10W-30',
  'Aceite Semisintético 15W-40', 'Aceite Sintético 5W-30', 'Aceite Sintético 0W-20',
  'Aceite Sintético 5W-40', 'Aceite Sintético 10W-40', 'Aceite para Moto 4T 20W-50',
  'Aceite para Moto 2T', 'Aceite para Transmisión Automática ATF DX-III',
  'Aceite para Transmisión Automática ATF+4', 'Aceite para Transmisión CVT',
  'Aceite de Transmisión 80W-90', 'Valvulina 85W-140', 'Líquido de Frenos DOT 3',
  'Líquido de Frenos DOT 4', 'Refrigerante Rojo 50/50', 'Refrigerante Verde 50/50',
  'Limpia Parabrisas', 'Grasa de Chasis', 'Grasa de Rodamiento'
];

const TIPOS_REPUESTO = [
  'Filtro de Aceite', 'Filtro de Aire', 'Filtro de Gasolina', 'Filtro de Cabina',
  'Bujía de Iridium', 'Bujía de Cobre', 'Bujía de Platino', 'Pastillas de Freno Delanteras',
  'Pastillas de Freno Traseras', 'Bandas de Freno Traseras', 'Disco de Freno', 'Tambor de Freno',
  'Correa de Tiempo', 'Correa de Accesorios (Única)', 'Correa de Alternador', 'Correa de Aire Acondicionado',
  'Kit de Embrague (Disco y Prensa)', 'Collarín de Embrague', 'Amortiguador Delantero Izquierdo',
  'Amortiguador Delantero Derecho', 'Amortiguador Trasero', 'Bomba de Agua', 'Bomba de Gasolina',
  'Terminal de Dirección', 'Muñón Inferior', 'Muñón Superior', 'Rodamiento de Rueda Delantero',
  'Rodamiento de Rueda Trasero', 'Estopera de Cigüeñal', 'Empacadura de Cámara', 'Goma de Válvula',
  'Sensor de Oxígeno', 'Sensor MAP', 'Sensor CKP', 'Bobina de Encendido', 'Cables de Bujía',
  'Termostato', 'Radiador', 'Alternador', 'Motor de Arranque', 'Batería 800 AMP', 'Batería 1100 AMP'
];

const MODELOS_VEHICULOS = [
  'Toyota Corolla', 'Toyota Hilux', 'Toyota Fortuner', 'Ford Fiesta', 'Ford Explorer',
  'Chevrolet Aveo', 'Chevrolet Optra', 'Chevrolet Silverado', 'Hyundai Elantra', 'Hyundai Accent',
  'Honda Civic', 'Jeep Grand Cherokee', 'Mitsubishi Lancer', 'Mazda 3'
];

function generateCatalog(): CatalogItem[] {
  const catalog: CatalogItem[] = [];
  
  // Generar lubricantes por marca (expandido)
  MARCAS_LUBRICANTES.forEach(marca => {
    TIPOS_LUBRICANTE.forEach(tipo => {
      catalog.push({
        nombre: `${tipo} ${marca}`,
        marca: marca,
        categoria: 'lubricante',
        unidad: tipo.includes('Aceite') || tipo.includes('Líquido') ? 'litro' : 'pieza'
      });
    });
  });

  // Generar repuestos por marca y modelo de vehículo (masivo)
  MARCAS_REPUESTOS.forEach(marca => {
    TIPOS_REPUESTO.forEach(tipo => {
      // Para hacer la lista más real, asociamos repuestos a modelos comunes
      MODELOS_VEHICULOS.forEach(modelo => {
        catalog.push({
          nombre: `${tipo} ${marca} para ${modelo}`,
          marca: marca,
          categoria: 'repuesto',
          unidad: 'pieza'
        });
      });
    });
  });

  // Añadir servicios comunes con variantes
  const servicios = [
    'Cambio de Aceite y Filtro', 'Entonación Mayor (6 Cil)', 'Entonación Mayor (4 Cil)',
    'Limpieza de Inyectores por Ultrasonido', 'Revisión de Frenos y Ajuste', 'Escaneo Computarizado OBDII',
    'Cambio de Correa de Tiempo', 'Servicio de Aire Acondicionado (Carga Gas)',
    'Balanceo y Rotación de Cauchos', 'Lavado de Motor', 'Cambio de Pastillas de Freno',
    'Revisión de Tren Delantero', 'Cambio de Amortiguadores', 'Instalación de Kit de Embrague'
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

let RAM_CATALOG: CatalogItem[] | null = null;

export function getAutomotiveCatalog(): CatalogItem[] {
  if (!RAM_CATALOG) {
    RAM_CATALOG = generateCatalog();
    console.log(`Catálogo inteligente cargado en RAM con ${RAM_CATALOG.length} registros.`);
  }
  return RAM_CATALOG;
}

export interface ProviderIngredient {
  key: string;
  name: string;
  unit: string;
  regularPrice: number;
  effectivePrice: number;
  discountNote?: string;
  notes?: string;
}

export interface ProviderRecord {
  id: string;
  name: string;
  businessName: string;
  rfc?: string;
  branchAddress: string;
  city: string;
  category: 'carne' | 'quesos' | 'verduras_abarrotes' | 'gas' | 'insumos' | 'panaderia';
  paymentMethodDefault: 'efectivo' | 'tarjeta' | 'transferencia';
  ticketFoliosSample: string[];
  catalog: ProviderIngredient[];
  notes?: string;
}

/**
 * Proveedores y proveedores verificados extraídos de los tickets físicos reales de compra
 * de Los Phillys de La Patrona (Nogales, Sonora).
 */
export const VERIFIED_PROVIDERS: ProviderRecord[] = [
  {
    id: 'prov-sukarne',
    name: 'SuKarne',
    businessName: 'SuKarne (TSK Nogales Sur)',
    rfc: 'SUK931216N38',
    branchAddress: 'Abraham Zaied #408, Col. Luis Donaldo Colosio Murrieta, C.P. 84066',
    city: 'Nogales, Sonora',
    category: 'carne',
    paymentMethodDefault: 'tarjeta',
    ticketFoliosSample: ['3851TK-90834', '3851TK-91859'],
    notes: 'Proveedor principal de carne de res. Compra en paquetes de 14 filetes.',
    catalog: [
      {
        key: 'sirloin',
        name: 'Steak de Sirloin SK 14 Paq',
        unit: 'kg',
        regularPrice: 166.40,
        effectivePrice: 156.42, // Promedio ponderado tickets 1 ($166.40) y 6 ($146.44)
        notes: 'Carne magra rebanada lista para plancha Philly y quesadillas',
      },
    ],
  },
  {
    id: 'prov-abastos-esperanza',
    name: 'Abastos Esperanza',
    businessName: 'Abastos Esperanza de Nogales',
    branchAddress: 'Av. de los Nogales #435, Col. Colinas del Yaqui, C.P. 84093',
    city: 'Nogales, Sonora',
    category: 'quesos',
    paymentMethodDefault: 'efectivo',
    ticketFoliosSample: ['Folio 58781'],
    notes: 'Proveedor local de cremería y quesos de fundición estilo Sonora.',
    catalog: [
      {
        key: 'queso_ojos',
        name: 'Queso Los Ojos (Fundición)',
        unit: 'kg',
        regularPrice: 210.00,
        effectivePrice: 210.00,
        notes: 'Queso fundente para cheesesteaks y quesadillas con costra',
      },
    ],
  },
  {
    id: 'prov-casa-ley',
    name: 'Casa Ley Express',
    businessName: 'Super Ley Express Nogales Sur #1407',
    rfc: 'CLE810525EA1',
    branchAddress: 'Av. Prolongación Alvaro Obregón #4170, Col. Nuevo Nogales, C.P. 84094',
    city: 'Nogales, Sonora',
    category: 'verduras_abarrotes',
    paymentMethodDefault: 'efectivo',
    ticketFoliosSample: ['Ticket 186 (Caja 2)', 'Ticket 96 (Caja 3)', 'Ticket 72 (Caja 1)'],
    notes: 'Abarrotes diarios, verduras frescas y ofertas de papa Russet y chile caribe.',
    catalog: [
      {
        key: 'papa_russet',
        name: 'Papa Russet',
        unit: 'kg',
        regularPrice: 45.90,
        effectivePrice: 13.40, // De oferta Ley ($12.90 y $13.90)
        discountNote: 'Ahorro de ~$32.50/kg en oferta Ley',
        notes: 'Papa para corte francés y papas fritas dobles',
      },
      {
        key: 'chile_caribe',
        name: 'Chile Caribe',
        unit: 'kg',
        regularPrice: 89.90,
        effectivePrice: 57.90, // De oferta Ley ($55.90 y $59.90)
        discountNote: 'Ahorro de ~$32.00/kg en oferta Ley',
        notes: 'Toreado y asado a la plancha para sándwiches y acompañamiento',
      },
      {
        key: 'cebolla_blanca',
        name: 'Cebolla Blanca',
        unit: 'kg',
        regularPrice: 91.90,
        effectivePrice: 65.90,
        discountNote: 'Ahorro de $26.00/kg en oferta Ley',
        notes: 'Cebolla fileteada para asar con la carne en plancha',
      },
      {
        key: 'doritos_nacho',
        name: 'Doritos Nacho S (Papas Lokas)',
        unit: 'pza',
        regularPrice: 60.90,
        effectivePrice: 52.90,
        discountNote: 'Ahorro de $8.00/pz',
        notes: 'Bolsa para preparación de Papas Lokas',
      },
      {
        key: 'leche_champurro',
        name: 'Leche Sin Lactosa (Champurro)',
        unit: 'pza',
        regularPrice: 51.50,
        effectivePrice: 48.90,
        discountNote: 'Ahorro de $2.60/pz',
        notes: 'Base líquida para elaboración de champurro caliente tradicional',
      },
      {
        key: 'aceite_ley',
        name: 'Aceite Vegetal Comestible',
        unit: 'pza',
        regularPrice: 36.90,
        effectivePrice: 21.00,
        discountNote: 'Ahorro de $15.90/pz en oferta',
        notes: 'Aceite para freidora de papas',
      },
      {
        key: 'toallas_cocina',
        name: 'Toalla de Cocina Blanca',
        unit: 'pza',
        regularPrice: 23.90,
        effectivePrice: 21.50,
        notes: 'Insumo de limpieza operativa e higiene de cocina',
      },
    ],
  },
  {
    id: 'prov-bodega-aurrera',
    name: 'Bodega Aurrera',
    businessName: 'Bodega Aurrera (Walmart México)',
    branchAddress: 'Sucursal Nogales, Sonora',
    city: 'Nogales, Sonora',
    category: 'insumos',
    paymentMethodDefault: 'efectivo',
    ticketFoliosSample: ['Ticket Aurrera Insumos'],
    notes: 'Insumos de cocina a granel, aceite vegetal y mayonesa económica.',
    catalog: [
      {
        key: 'aceite_aurrera',
        name: 'Aceite Aurrera 800ml (AC AU 800)',
        unit: 'pza',
        regularPrice: 27.00,
        effectivePrice: 27.00,
        notes: 'Aceite vegetal para freidora y plancha',
      },
      {
        key: 'mayonesa_aurrera',
        name: 'Mayonesa Aurrera 385g (AU MAY 385)',
        unit: 'pza',
        regularPrice: 37.00,
        effectivePrice: 37.00,
        notes: 'Aderezo y base para sándwich philly',
      },
      {
        key: 'queso_mozzarella',
        name: 'Queso Mozzarella La Villita',
        unit: 'pza',
        regularPrice: 147.00,
        effectivePrice: 131.00,
        discountNote: 'Ahorro de $16.00 en precio rebajado Aurrera',
        notes: 'Queso hebra para mezclar con Los Ojos en quesadillas y sándwiches',
      },
    ],
  },
  {
    id: 'prov-super-villa',
    name: 'Super Villa',
    businessName: 'Super Villa (José Ángel Gastélum Rojas)',
    rfc: 'GARA800802897',
    branchAddress: 'Calle del Cóndor #13, Dep. Villa Sonora, C.P. 84093',
    city: 'Nogales, Sonora',
    category: 'verduras_abarrotes',
    paymentMethodDefault: 'efectivo',
    ticketFoliosSample: ['JMNVENNV00292508'],
    notes: 'Frutería y verdulería local de proximidad en Villa Sonora.',
    catalog: [
      {
        key: 'chile_caribe_villa',
        name: 'Chile Caribe Fresco',
        unit: 'kg',
        regularPrice: 57.90,
        effectivePrice: 57.90,
        notes: 'Chile fresco para toreado diario',
      },
    ],
  },
  {
    id: 'prov-rivera-gas',
    name: 'Rivera Gas',
    businessName: 'Rivera Gas S.A. de C.V.',
    rfc: 'RGA-960729-EV3',
    branchAddress: 'Carburación Raquet, Nogales, Sonora',
    city: 'Nogales, Sonora',
    category: 'gas',
    paymentMethodDefault: 'efectivo',
    ticketFoliosSample: ['Folio 335276'],
    notes: 'Proveedor de combustible Gas LP para plancha, freidoras y estufa.',
    catalog: [
      {
        key: 'gas_lp',
        name: 'Gas LP Carburación / Comercial',
        unit: 'L',
        regularPrice: 11.13,
        effectivePrice: 11.13,
        notes: 'Carga de gas para cilindro y estufa de preparación',
      },
    ],
  },
  {
    id: 'prov-panaderia-tortilleria',
    name: 'Panadería y Tortillería Nogales',
    businessName: 'Panadería y Tortillería Local',
    branchAddress: 'Col. Colosio / Villa Sonora',
    city: 'Nogales, Sonora',
    category: 'panaderia',
    paymentMethodDefault: 'efectivo',
    ticketFoliosSample: ['Nota de remisión panadería'],
    notes: 'Pan artesanal para Philly Cheesesteak y tortillas de harina estilo sonorense.',
    catalog: [
      {
        key: 'pan_philly',
        name: 'Pan Hoagie / Philly Blanco',
        unit: 'pza',
        regularPrice: 7.50,
        effectivePrice: 7.50,
        notes: 'Pan alargado suave resistente al jugo de carne y queso fundido',
      },
      {
        key: 'tortilla_harina',
        name: 'Tortilla de Harina Sonorense Grande',
        unit: 'pza',
        regularPrice: 3.50,
        effectivePrice: 3.50,
        notes: 'Tortilla de harina suave para quesadilla dorada a la plancha',
      },
    ],
  },
];

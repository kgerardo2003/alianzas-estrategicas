export interface MinisterioInfo {
  id?: string;
  codigo: string;
  siglas: string;
  nombre: string;
  nombreCorto: string;
  ministro: string;
  color: string;
  bgBadge: string;
  borderBadge: string;
  textColor: string;
  descripcion: string;
  unidadesEjecutoras: string[];
}

export type MinisterioGuatemala = MinisterioInfo;

export const getMinisterioBySiglas = (siglas: string): MinisterioInfo | undefined => {
  if (!siglas) return undefined;
  const clean = siglas.trim().toUpperCase();
  return MINISTERIOS_GUATEMALA.find(
    m => m.siglas.toUpperCase() === clean || m.codigo.toUpperCase() === clean
  );
};

export const getMinisterioByNombre = (nombre: string): MinisterioInfo | undefined => {
  if (!nombre) return undefined;
  const clean = nombre.trim().toLowerCase();
  return MINISTERIOS_GUATEMALA.find(
    m => m.nombre.toLowerCase().includes(clean) || m.nombreCorto.toLowerCase().includes(clean)
  );
};

const RAW_MINISTERIOS: MinisterioInfo[] = [
  {
    id: 'CIV',
    codigo: 'MICIVI',
    siglas: 'CIV',
    nombre: 'Ministerio de Comunicaciones, Infraestructura y Vivienda',
    nombreCorto: 'Comunicaciones e Infraestructura',
    ministro: 'Ing. Félix Alvarado',
    color: '#B91C1C',
    bgBadge: 'bg-red-50 text-red-700',
    borderBadge: 'border-red-200',
    textColor: 'text-red-700',
    descripcion: 'Infraestructura vial troncal, puentes, aeropuertos, telecomunicaciones y proyectos de vivienda digna.',
    unidadesEjecutoras: [
      'Dirección General de Caminos (DGC)',
      'Unidad de Construcción de Edificios Escolares (UCEE)',
      'Fondo Social de Solidaridad (FSS)',
      'Dirección General de Aeronáutica Civil (DGAC)',
      'Fondo para la Vivienda (FOPAVI)',
      'Unidad Ejecutora de Conservación Vial (COVIAL)'
    ]
  },
  {
    id: 'MCD',
    codigo: 'MCD',
    siglas: 'MCD',
    nombre: 'Ministerio de Cultura y Deportes',
    nombreCorto: 'Cultura y Deportes',
    ministro: 'Licda. Liwy Grazioso',
    color: '#991B1B',
    bgBadge: 'bg-rose-50 text-rose-800',
    borderBadge: 'border-rose-200',
    textColor: 'text-rose-800',
    descripcion: 'Conservación de sitios arqueológicos mayas, centros culturales, parques deportivos y fomento artístico.',
    unidadesEjecutoras: [
      'Dirección General del Patrimonio Cultural y Natural',
      'Dirección General del Deporte y la Recreación',
      'Dirección General de las Artes',
      'Parque Nacional Tikal y Sitios Arqueológicos'
    ]
  },
  {
    id: 'MINGOB',
    codigo: 'MINGOB',
    siglas: 'MINGOB',
    nombre: 'Ministerio de Gobernación',
    nombreCorto: 'Gobernación y Seguridad',
    ministro: 'Lic. Francisco Jiménez',
    color: '#7F1D1D',
    bgBadge: 'bg-amber-50 text-amber-900',
    borderBadge: 'border-amber-200',
    textColor: 'text-amber-900',
    descripcion: 'Seguridad interior, modernización de la Policía Nacional Civil y sistema penitenciario con tecnología.',
    unidadesEjecutoras: [
      'Dirección General de la Policía Nacional Civil (PNC)',
      'Dirección General del Sistema Penitenciario (DGSP)',
      'Dirección General de Inteligencia Civil (DIGICI)',
      'Unidad para la Prevención Comunitaria de la Violencia (UPCV)'
    ]
  },
  {
    id: 'MAGA',
    codigo: 'MAGA',
    siglas: 'MAGA',
    nombre: 'Ministerio de Agricultura, Ganadería y Alimentación',
    nombreCorto: 'Agricultura y Alimentación',
    ministro: 'Ing. Maynor Estrada',
    color: '#15803D',
    bgBadge: 'bg-emerald-50 text-emerald-800',
    borderBadge: 'border-emerald-200',
    textColor: 'text-emerald-800',
    descripcion: 'Seguridad alimentaria, tecnificación de riego parcelario, centros de acopio y apoyo a pequeños productores.',
    unidadesEjecutoras: [
      'Viceministerio de Desarrollo Económico Rural (VIDER)',
      'Viceministerio de Seguridad Alimentaria y Nutricional (VISAN)',
      'Fondo de Desarrollo Rural',
      'Dirección de Infraestructura Productiva (DIP)'
    ]
  },
  {
    id: 'MINFIN',
    codigo: 'MINFIN',
    siglas: 'MINFIN',
    nombre: 'Ministerio de Finanzas Públicas',
    nombreCorto: 'Finanzas Públicas',
    ministro: 'Lic. Jonathan Menkos',
    color: '#450A0A',
    bgBadge: 'bg-stone-50 text-stone-900',
    borderBadge: 'border-stone-300',
    textColor: 'text-stone-900',
    descripcion: 'Modernización del Sistema de Contabilidad Integrada (SICOIN), Guatecompras y transparencia presupuestaria.',
    unidadesEjecutoras: [
      'Dirección Técnica del Presupuesto (DTP)',
      'Dirección General de Adquisiciones del Estado (DGAE)',
      'Dirección de Tecnologías de la Información (DTI)',
      'Tesorería Nacional (TN)'
    ]
  },
  {
    id: 'MINEDUC',
    codigo: 'MINEDUC',
    siglas: 'MINEDUC',
    nombre: 'Ministerio de Educación',
    nombreCorto: 'Educación',
    ministro: 'Dra. Anabella Giracca',
    color: '#1D4ED8',
    bgBadge: 'bg-blue-50 text-blue-800',
    borderBadge: 'border-blue-200',
    textColor: 'text-blue-800',
    descripcion: 'Remozamiento integral de escuelas rurales, laboratorios de computación y provisión de textos y tecnología.',
    unidadesEjecutoras: [
      'Dirección General de Infraestructura Escolar (DIGEIE)',
      'Dirección de Informática (DINF)',
      'Dirección General de Coordinación de Calidad Educativa'
    ]
  },
  {
    id: 'MSPAS',
    codigo: 'MSPAS',
    siglas: 'MSPAS',
    nombre: 'Ministerio de Salud Pública y Asistencia Social',
    nombreCorto: 'Salud Pública',
    ministro: 'Dr. Joaquín Barnoya',
    color: '#0F766E',
    bgBadge: 'bg-teal-50 text-teal-800',
    borderBadge: 'border-teal-200',
    textColor: 'text-teal-800',
    descripcion: 'Construcción y equipamiento de hospitales regionales, puestos de salud y cadena de frío para biológicos.',
    unidadesEjecutoras: [
      'Unidad Especial de Ejecución de Proyectos de Salud (UEPS)',
      'Dirección de Redes Integradas de Servicios de Salud (DRISS)',
      'Dirección General del Sistema Integral de Atención en Salud'
    ]
  },
  {
    id: 'MINECO',
    codigo: 'MINECO',
    siglas: 'MINECO',
    nombre: 'Ministerio de Economía',
    nombreCorto: 'Economía y Mipymes',
    ministro: 'Dra. Gabriela García Quinn',
    color: '#B45309',
    bgBadge: 'bg-amber-50 text-amber-800',
    borderBadge: 'border-amber-200',
    textColor: 'text-amber-800',
    descripcion: 'Parques tecnológicos, incubadoras de microempresas, digitalización mercantil y atracción de inversiones.',
    unidadesEjecutoras: [
      'Viceministerio de Desarrollo de la Mipyme',
      'Viceministerio de Inversión y Competencia',
      'Registro Mercantil General de la República'
    ]
  },
  {
    id: 'MEM',
    codigo: 'MEM',
    siglas: 'MEM',
    nombre: 'Ministerio de Energía y Minas',
    nombreCorto: 'Energía y Minas',
    ministro: 'Ing. Víctor Hugo Ventura',
    color: '#A16207',
    bgBadge: 'bg-yellow-50 text-yellow-800',
    borderBadge: 'border-yellow-200',
    textColor: 'text-yellow-800',
    descripcion: 'Electrificación rural mediante sistemas solares aislados y diversificación de la matriz energética limpia.',
    unidadesEjecutoras: [
      'Dirección General de Energía (DGE)',
      'Comisión Nacional de Energía Eléctrica (CNEE)',
      'Unidad de Electrificación Rural'
    ]
  },
  {
    id: 'MARN',
    codigo: 'MARN',
    siglas: 'MARN',
    nombre: 'Ministerio de Ambiente y Recursos Naturales',
    nombreCorto: 'Ambiente y Recursos Naturales',
    ministro: 'Dra. Patricia Orantes',
    color: '#047857',
    bgBadge: 'bg-emerald-50 text-emerald-800',
    borderBadge: 'border-emerald-200',
    textColor: 'text-emerald-800',
    descripcion: 'Plantas de tratamiento de aguas residuales, biobardas en cuencas del Río Motagua y reforestación masiva.',
    unidadesEjecutoras: [
      'Dirección de Gestión Ambiental',
      'Autoridad para el Manejo Sustentable de la Cuenca del Lago de Atitlán (AMSCLAE)',
      'Autoridad para el Manejo Sustentable del Lago de Amatitlán (AMSA)'
    ]
  },
  {
    id: 'MIDES',
    codigo: 'MIDES',
    siglas: 'MIDES',
    nombre: 'Ministerio de Desarrollo Social',
    nombreCorto: 'Desarrollo Social',
    ministro: 'Lic. Abelardo Pinto',
    color: '#6D28D9',
    bgBadge: 'bg-purple-50 text-purple-800',
    borderBadge: 'border-purple-200',
    textColor: 'text-purple-800',
    descripcion: 'Comedores sociales, transferencias monetarias para niñas y fortalecimiento de piso digno comunitario.',
    unidadesEjecutoras: [
      'Fondo de Desarrollo Social (FODES)',
      'Dirección de Asistencia Social',
      'Dirección de Prevención Social'
    ]
  },
  {
    id: 'MINTRAB',
    codigo: 'MINTRAB',
    siglas: 'MINTRAB',
    nombre: 'Ministerio de Trabajo y Previsión Social',
    nombreCorto: 'Trabajo y Previsión Social',
    ministro: 'Dra. Miriam Roquel',
    color: '#4338CA',
    bgBadge: 'bg-indigo-50 text-indigo-800',
    borderBadge: 'border-indigo-200',
    textColor: 'text-indigo-800',
    descripcion: 'Centros de formación vocacional, sistema nacional de empleo digital e inspección laboral.',
    unidadesEjecutoras: [
      'Dirección General de Empleo',
      'Inspección General de Trabajo',
      'Departamento de Formación y Capacitación'
    ]
  },
  {
    id: 'MINDEF',
    codigo: 'MINDEF',
    siglas: 'MINDEF',
    nombre: 'Ministerio de la Defensa Nacional',
    nombreCorto: 'Defensa Nacional',
    ministro: 'Gral. Henry Sáenz Ramos',
    color: '#334155',
    bgBadge: 'bg-slate-100 text-slate-800',
    borderBadge: 'border-slate-300',
    textColor: 'text-slate-800',
    descripcion: 'Apertura de caminos rurales por el Cuerpo de Ingenieros, apoyo ante emergencias y resguardo de fronteras.',
    unidadesEjecutoras: [
      'Cuerpo de Ingenieros del Ejército "General Francisco Javier Arana"',
      'Servicio de Sanidad Militar',
      'Dirección General de Control de Armas y Municiones (DIGECAM)'
    ]
  },
  {
    id: 'MINEX',
    codigo: 'MINEX',
    siglas: 'MINEX',
    nombre: 'Ministerio de Relaciones Exteriores',
    nombreCorto: 'Relaciones Exteriores',
    ministro: 'Lic. Carlos Ramiro Martínez',
    color: '#0369A1',
    bgBadge: 'bg-sky-50 text-sky-800',
    borderBadge: 'border-sky-200',
    textColor: 'text-sky-800',
    descripcion: 'Sistemas consulares biométricos, pasaportes en el exterior y canalización de cooperación internacional.',
    unidadesEjecutoras: [
      'Dirección General de Asuntos Consulares y Migratorios',
      'Dirección General de Relaciones Económicas Internacionales',
      'Red de Consulados Generales de Guatemala'
    ]
  }
];

export const MINISTERIOS_GUATEMALA: MinisterioInfo[] = RAW_MINISTERIOS.map(m => ({
  ...m,
  id: m.siglas
}));

export const DEPARTAMENTOS_GUATEMALA = [
  'Guatemala',
  'Alta Verapaz',
  'Baja Verapaz',
  'Chimaltenango',
  'Chiquimula',
  'El Progreso',
  'Escuintla',
  'Huehuetenango',
  'Izabal',
  'Jalapa',
  'Jutiapa',
  'Petén',
  'Quetzaltenango',
  'Quiché',
  'Retalhuleu',
  'Sacatepéquez',
  'San Marcos',
  'Santa Rosa',
  'Sololá',
  'Suchitepéquez',
  'Totonicapán',
  'Zacapa'
];

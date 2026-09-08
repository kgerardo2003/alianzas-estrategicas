export type UserRole = 'administrador' | 'auditor' | 'usuario_estandar';

export interface User {
  id: string;
  username: string;
  nombreCompleto: string;
  email: string;
  password?: string;
  rol: UserRole;
  cargo: string;
  departamento: string;
  activo: boolean;
  fechaCreacion: string;
  ultimoAcceso?: string;
}

export type EvaluacionGIT = 'Sí' | 'No';

export type EstatusProyecto = 
  | 'Planificación' 
  | 'En Licitación' 
  | 'En Ejecución' 
  | 'Suspendido' 
  | 'Finalizado' 
  | 'En Liquidación';

export type EstatusEventoDefault = EstatusProyecto;

export type TipoDocumentoDrive = 
  | 'Términos de Referencia'
  | 'Bases de Licitación'
  | 'Contrato Administrativo'
  | 'Planos Técnicos'
  | 'Dictamen Técnico'
  | 'Dictamen Financiero'
  | 'Informe Mensual de Avance'
  | 'Informe de Supervisión'
  | 'Fianza de Cumplimiento'
  | 'Acta de Recepción Definitiva'
  | 'Documentación General';

export interface GoogleDriveDocument {
  id: string;
  nombre: string;
  tipo: TipoDocumentoDrive;
  url: string; // Enlace directo a Google Drive (drive.google.com/...)
  fecha: string;
  tamano?: string;
  subidoPor?: string;
  descripcion?: string;
}

export interface AttachedDocument {
  nombre: string;
  tamano?: number;
  tipo?: string;
  fechaSubida?: string;
  dataUrl?: string; // Archivo base64 / blob URL para descarga y visualización
}

export interface ProjectRecord {
  id: string;
  codigo?: string; // Identificador único del proyecto (ej: PRJ-MICIVI-2026-001)
  nombre?: string; // Nombre completo del proyecto
  descripcion: string; // Resumen del alcance y objetivos
  ministerio?: string; // Nombre del ministerio (ej: Ministerio de Comunicaciones, Infraestructura y Vivienda)
  siglasMinisterio?: string; // CIV, MINGOB, MCD, MAGA, MINFIN, etc.
  unidadEjecutora?: string; // Dirección General de Caminos, UCEE, etc.
  estatus?: EstatusProyecto; // Planificación, Licitación, Ejecución, etc.
  presupuestoAsignado?: number; // Monto asignado en Quetzales (Q)
  presupuestoEjecutado?: number; // Monto ejecutado en Quetzales (Q)
  avanceFisico?: number; // Porcentaje de avance físico (0 a 100%)
  avanceFinanciero?: number; // Porcentaje de avance financiero (0 a 100%)
  fechaInicio?: string; // YYYY-MM-DD
  fechaFinalizacionEstimada?: string; // YYYY-MM-DD
  fechaFinalizacionReal?: string; // YYYY-MM-DD
  responsable?: string; // Nombre y cargo del coordinador/director del proyecto
  contactoResponsable?: string; // Teléfono o correo de contacto
  departamento?: string; // Departamento de Guatemala
  municipio?: string;
  googleDriveFolderUrl?: string; // Carpeta principal de Google Drive
  documentosDrive?: GoogleDriveDocument[]; // Documentos vinculados en Google Drive
  alianzaEstrategica?: string; // "FIRME - Alianzas Estratégicas", "Cooperación Multilateral", etc.
  prioridad?: 'Alta' | 'Media' | 'Baja';
  observaciones?: string;
  creadoPor?: string;
  fechaCreacion?: string;
  modificadoPor?: string;
  fechaModificacion?: string;

  // Propiedades de retrocompatibilidad con el modelo anterior de PurchaseRecord
  monto?: number;
  f56e?: string;
  f56?: string;
  nog?: string;
  fechaSolicitud?: string;
  fechaVoBo?: string;
  fechaAutorizado?: string;
  fechaPublicacion?: string;
  fechaOfertas?: string;
  cantidadOfertas?: number;
  evaluadoGIT?: EvaluacionGIT;
  fechaDictamenGIT?: string;
  fechaElaboracionOficioGIT?: string;
  estatusEvento?: string;
  fechaAdjudicacion?: string;
  areaSolicitante?: string;
  categoriaTecnologica?: string;
  dependenciaSolicitante?: string;
  modalidadCompra?: string;
  proveedorAdjudicado?: string;
  f56Documento?: AttachedDocument;
}

// Alias de retrocompatibilidad
export type PurchaseRecord = ProjectRecord;

export interface CatalogItem {
  id: string;
  codigo: string;
  valor: string;
  descripcion?: string;
  activo: boolean;
  color?: string;
}

export interface Catalog {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  esSistema: boolean;
  items: CatalogItem[];
}

export type AuditAction = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'CREAR_PROYECTO'
  | 'EDITAR_PROYECTO' 
  | 'ELIMINAR_PROYECTO' 
  | 'VINCULAR_DOCUMENTO_DRIVE'
  | 'CREAR_COMPRA' 
  | 'EDITAR_COMPRA' 
  | 'ELIMINAR_COMPRA' 
  | 'CAMBIO_ESTATUS' 
  | 'CREAR_CATALOGO' 
  | 'EDITAR_CATALOGO' 
  | 'CREAR_USUARIO' 
  | 'EDITAR_USUARIO' 
  | 'EXPORTAR_DATOS'
  | 'RESTAURAR_DATOS'
  | 'IMPORTAR_DATOS';

export interface AuditLogEntry {
  id: string;
  fecha: string;
  usuario: string;
  rol: UserRole;
  accion: AuditAction;
  modulo: 'Autenticación' | 'Proyectos' | 'Compras' | 'Catálogos' | 'Usuarios' | 'Auditoría' | 'Reportes' | 'Google Drive' | 'Sistema';
  detalles: string;
  registroId?: string;
  ip: string;
  valoresAnteriores?: Record<string, any>;
  valoresNuevos?: Record<string, any>;
}

export type NotificationType = 'urgente' | 'alerta' | 'info' | 'exito';

export interface AppNotification {
  id: string;
  tipo: NotificationType;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  enlaceId?: string;
  categoria: 'vencimiento_oferta' | 'cambio_estatus' | 'aprobacion_vobo' | 'nuevo_registro' | 'sistema' | 'documento_drive';
}

export type ActiveTab = 
  | 'dashboard' 
  | 'compras' // Mantener alias interno para pantalla de proyectos
  | 'estadisticas'
  | 'catalogos' 
  | 'auditoria' 
  | 'usuarios' 
  | 'reportes' 
  | 'personalizacion' 
  | 'correo';

export interface GmailConfig {
  userEmail: string;
  senderName: string;
  appPassword: string;
  smtpHost: string;
  smtpPort: number;
  secure: boolean;
  recipientEmails: string[];
  notifyOnNewPurchase: boolean;
  notifyOnAdjudication: boolean;
  notifyOnDeadlineWarning: boolean;
  notifyOnGitOpinion: boolean;
  notifyOnCriticalAudit: boolean;
  lastTestDate?: string;
  lastTestStatus?: 'success' | 'error';
  lastTestError?: string;
}

export type SystemThemeId = 'firme_carmesi' | 'firme_blanco' | 'azul_persia_acero' | 'slate_ambar' | 'azul_judicial' | 'grafito_esmeralda';

export interface CustomLogoConfig {
  type: 'preset' | 'custom_image';
  presetId?: 'firme_3d' | 'oj_vector' | 'oj_monogram' | 'escudo_nacional';
  imageUrl?: string;
  title: string;
  subtitle: string;
}

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
